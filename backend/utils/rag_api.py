"""
KORAI ORL - Backend API v3
Séparation RAG (symptômes) + Vision (image) avec validation experte
Stockage sur Google Drive
"""
# Au début du fichier, après les imports
from dotenv import load_dotenv

# Charge les variables d'environnement depuis .env
load_dotenv()
import os
import io
import json
import csv
import uuid
import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Tuple
import base64

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from PIL import Image
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Google Drive imports
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.auth.transport.requests import Request

def get_resource_path(relative_path):
    """ Récupère le chemin absolu des ressources (modèles, db) pour PyInstaller """
    try:
        # PyInstaller crée un dossier temporaire et stocke le chemin dans _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# ================= PIPELINE IMAGE =================
from utils.orl_Inference_pipeline import load_model, predict_top3

# ================= LANGCHAIN / RAG (Version 1.2.10) =================
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.documents import Document
from langchain_classic.chains import RetrievalQA


# =====================================================================
# CONFIG
# =====================================================================
class Config:
    # Chemins des ressources - compatible PyInstaller avec --add-data
    PROJECT_DIR    = "KORAI-APP"
    CHROMA_DIR     = get_resource_path(f"{PROJECT_DIR}/chroma_db")
    COLLECTION     = "orl_knowledge_base"
    EMBEDDING_MODEL= "almanach/camembert-bio-base"
    LLM_MODEL      = "mistral-large-latest"
    MISTRAL_API_KEY= os.getenv("MISTRAL_API_KEY", "")
    MODEL_PATH     = get_resource_path("efficientnet.onnx")
    API_HOST       = os.getenv("API_HOST", "127.0.0.1")
    API_PORT       = int(os.getenv("API_PORT", "8000"))
    
    # Google Drive Configuration
    GOOGLE_DRIVE_ENABLED = os.getenv("GOOGLE_DRIVE_ENABLED", "false").lower() == "true"
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN", "")

CLASS_KEYWORDS: Dict[str, List[str]] = {
    "aspect post tympanoplastie": ["tympanoplastie", "greffe tympanique", "cicatrice"],
    "bouchon de cerumen":         ["cérumen", "bouchon", "obstruction"],
    "cholestéatome":              ["cholestéatome", "épiderme", "os pétreux"],
    "corps étranger oreille":    ["corps étranger", "objet", "oreille"],
    "myringosclerose":            ["myringosclérose", "tympanosclérose", "calcification"],
    "otomycose":                  ["otomycose", "candida", "aspergillus", "champignon"],
    "otite moyenne aigue":        ["otite", "otalgie", "fièvre", "otorrhée"],
    "otite séromuqueuse":         ["otite séromuqueuse", "épanchement", "colle"],
    "perforation tympanique":     ["perforation", "rupture tympan", "traumatisme"],
    "tympan normal":              ["tympan normal", "examen normal", "pas de pathologie"],
}


# =====================================================================
# PYDANTIC MODELS
# =====================================================================
class ChatRequest(BaseModel):
    message: str
    show_sources: bool = False
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[Dict]] = None
    conversation_id: str
    timestamp: str

class VisionDiagnosticResponse(BaseModel):
    prediction: str
    confidence: float
    top3: List[Dict]
    timestamp: str

class RAGDiagnosticResponse(BaseModel):
    summary: str
    sources: Optional[List[Dict]]
    timestamp: str

class SeparateDiagnosticResponse(BaseModel):
    case_id: str
    timestamp: str
    vision: VisionDiagnosticResponse
    rag: RAGDiagnosticResponse
    requires_expert_validation: bool
    drive_image_url: Optional[str] = None
    drive_file_id: Optional[str] = None

class ExpertValidation(BaseModel):
    case_id: str
    expert_diagnosis: str
    expert_comment: Optional[str] = ""
    expert_id: Optional[str] = "anonymous"
    # L'expert peut choisir entre :
    # - valider le diagnostic vision
    # - valider le diagnostic RAG
    # - donner un tout nouveau diagnostic
    validated_prediction: Optional[str] = None  # La prédiction validée
    validation_source: str = "expert"  # "vision", "rag", or "expert"

class ExpertValidationResponse(BaseModel):
    case_id: str
    saved: bool
    message: str
    drive_export_url: Optional[str] = None


# =====================================================================
# GOOGLE DRIVE SERVICE
# =====================================================================
class GoogleDriveService:
    def __init__(self):
        self.drive_service = None
        self.folder_id = None
        if Config.GOOGLE_DRIVE_ENABLED:
            self.initialize()

    def initialize(self):
        try:
            credentials = Credentials(
                token=None,
                refresh_token=Config.GOOGLE_REFRESH_TOKEN,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=Config.GOOGLE_CLIENT_ID,
                client_secret=Config.GOOGLE_CLIENT_SECRET
            )
            
            # Rafraîchir le token si nécessaire
            if credentials.expired:
                credentials.refresh(Request())
            
            self.drive_service = build('drive', 'v3', credentials=credentials)
            self.create_or_get_main_folder()
            logger.info("✅ Google Drive initialisé avec succès")
        except Exception as e:
            logger.error(f"❌ Erreur initialisation Drive: {e}")
            Config.GOOGLE_DRIVE_ENABLED = False

    def create_or_get_main_folder(self):
        try:
            # Chercher le dossier existant
            response = self.drive_service.files().list(
                q="name='KORAI-Medical' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields="files(id, name)"
            ).execute()
            
            if response.get('files'):
                self.folder_id = response['files'][0]['id']
                logger.info(f"📁 Dossier existant: {self.folder_id}")
            else:
                # Créer le dossier
                file_metadata = {
                    'name': 'KORAI-Medical',
                    'mimeType': 'application/vnd.google-apps.folder'
                }
                file = self.drive_service.files().create(body=file_metadata, fields='id').execute()
                self.folder_id = file.get('id')
                logger.info(f"📁 Nouveau dossier créé: {self.folder_id}")
            
            # Créer les sous-dossiers
            self.create_subfolder('cases')
            self.create_subfolder('validations')
            self.create_subfolder('exports')
            
        except Exception as e:
            logger.error(f"Erreur création dossier: {e}")

    def create_subfolder(self, folder_name):
        try:
            response = self.drive_service.files().list(
                q=f"name='{folder_name}' and '{self.folder_id}' in parents and trashed=false",
                fields="files(id)"
            ).execute()
            
            if not response.get('files'):
                file_metadata = {
                    'name': folder_name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [self.folder_id]
                }
                self.drive_service.files().create(body=file_metadata, fields='id').execute()
                logger.info(f"📁 Sous-dossier créé: {folder_name}")
        except Exception as e:
            logger.error(f"Erreur création sous-dossier {folder_name}: {e}")

    def upload_image(self, image_bytes: bytes, filename: str, case_id: str) -> Tuple[Optional[str], Optional[str]]:
        if not self.drive_service:
            return None, None
        
        try:
            # Créer dossier par date
            date_folder = datetime.now().strftime("%Y/%m/%d")
            date_path = date_folder.split('/')
            
            current_parent = self.folder_id
            for folder in date_path:
                current_parent = self.get_or_create_subfolder(current_parent, folder)
            
            # Upload de l'image
            media = MediaIoBaseUpload(
                io.BytesIO(image_bytes),
                mimetype='image/jpeg',
                resumable=True
            )
            
            file_metadata = {
                'name': filename,
                'parents': [current_parent]
            }
            
            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink'
            ).execute()
            
            file_id = file.get('id')
            view_link = file.get('webViewLink')
            
            # Rendre le fichier accessible (optionnel)
            self.drive_service.permissions().create(
                fileId=file_id,
                body={'type': 'anyone', 'role': 'reader'}
            ).execute()
            
            direct_link = f"https://drive.google.com/uc?export=view&id={file_id}"
            
            logger.info(f"✅ Image uploadée: {filename} (ID: {file_id})")
            return file_id, direct_link
            
        except Exception as e:
            logger.error(f"Erreur upload image: {e}")
            return None, None

    def get_or_create_subfolder(self, parent_id: str, folder_name: str) -> str:
        try:
            response = self.drive_service.files().list(
                q=f"name='{folder_name}' and '{parent_id}' in parents and trashed=false",
                fields="files(id)"
            ).execute()
            
            if response.get('files'):
                return response['files'][0]['id']
            
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_id]
            }
            file = self.drive_service.files().create(body=file_metadata, fields='id').execute()
            return file.get('id')
        except Exception as e:
            logger.error(f"Erreur création dossier {folder_name}: {e}")
            return parent_id

    def save_validation_data(self, case_data: Dict, filename: str) -> Optional[str]:
        if not self.drive_service:
            return None
        
        try:
            exports_folder = self.get_or_create_subfolder(self.folder_id, 'exports')
            
            json_content = json.dumps(case_data, ensure_ascii=False, indent=2, default=str)
            media = MediaIoBaseUpload(
                io.BytesIO(json_content.encode('utf-8')),
                mimetype='application/json',
                resumable=True
            )
            
            file_metadata = {
                'name': filename,
                'parents': [exports_folder]
            }
            
            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='webViewLink'
            ).execute()
            
            logger.info(f"✅ Validation sauvegardée: {filename}")
            return file.get('webViewLink')
            
        except Exception as e:
            logger.error(f"Erreur sauvegarde validation: {e}")
            return None


# =====================================================================
# CHATBOT ORL (RAG)
# =====================================================================
class ORLChatbot:
    def __init__(self):
        self.vectorstore: Optional[Chroma] = None
        self.qa_chain = None
        self._init_rag()

    def _init_rag(self):
        os.environ["MISTRAL_API_KEY"] = Config.MISTRAL_API_KEY
        
        print("📚 Chargement des embeddings...")
        try:
            embeddings = HuggingFaceEmbeddings(
                model_name=Config.EMBEDDING_MODEL,
                model_kwargs={"device": "cpu"}
            )
            print("✅ Embeddings HuggingFace chargés avec succès")
        except Exception as e:
            print(f"❌ Erreur lors du chargement des embeddings: {e}")
            raise
        
        persist_dir = f"{Config.CHROMA_DIR}/{Config.COLLECTION}"
        if not os.path.exists(persist_dir):
            error_msg = f"Chroma DB introuvable : {persist_dir}\nChemin absolu attendu: {os.path.abspath(persist_dir)}"
            print(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
        
        print(f"🔍 Connexion à Chroma DB: {persist_dir}")
        try:
            self.vectorstore = Chroma(
                persist_directory=persist_dir,
                embedding_function=embeddings
            )
            print("✅ Chroma DB connectée avec succès")
        except Exception as e:
            print(f"❌ Erreur de connexion à Chroma DB: {e}")
            raise
        
        prompt = PromptTemplate(
            template="""Tu es KORAI, un assistant médical ORL expert.

RÈGLES STRICTES :
- Résumé clinique uniquement, maximum 120 mots.
- Pas de markdown, pas d'astérisques, pas de listes à puces.
- Langage médical précis et synthétique.
- Si le contexte ne contient pas de réponse, indique-le clairement.

FORMAT :
1. Causes probables
2. Signes associés
3. Conduite à tenir

CONTEXTE MÉDICAL :
{context}

QUESTION / SYMPTÔMES :
{question}

RÉSUMÉ CLINIQUE :
""",
            input_variables=["context", "question"]
        )
        
        print("🤖 Initialisation du modèle Mistral...")
        llm = ChatMistralAI(
            model=Config.LLM_MODEL,
            temperature=0.1,
            max_tokens=350
        )
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 4}),
            chain_type="stuff",
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True
        )
        
        print("✅ Chatbot ORL RAG initialisé avec succès")

    def query(self, message: str, show_sources: bool = False) -> Dict:
        result = self.qa_chain.invoke({"query": message})
        
        answer = result["result"]
        for char in ["**", "*", "_", "•"]:
            answer = answer.replace(char, "")
        answer = answer.strip()
        
        raw_context = " ".join([doc.page_content for doc in result.get("source_documents", [])])
        
        sources = None
        if show_sources:
            sources = [
                {
                    "source": Path(doc.metadata.get("source", "")).name,
                    "page": doc.metadata.get("page"),
                    "content": doc.page_content[:200]
                }
                for doc in result.get("source_documents", [])[:3]
            ]
        
        return {"response": answer, "sources": sources, "raw_context": raw_context}


# =====================================================================
# FASTAPI APP
# =====================================================================
app = FastAPI(title="KORAI ORL API v3", version="3.0.0")

# Configuration CORS robuste pour multipart/form-data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "Access-Control-Allow-Headers",
    ],
    expose_headers=["Content-Disposition"],
    max_age=600,
)

chatbot: Optional[ORLChatbot] = None
dl_model = None
case_store: Dict[str, Dict] = {}
drive_service: Optional[GoogleDriveService] = None


# =====================================================================
# STARTUP
# =====================================================================
@app.on_event("startup")
async def startup():
    global chatbot, dl_model, drive_service
    
    print("🚀 Démarrage KORAI ORL v3 (RAG + Vision séparés)")
    
    try:
        chatbot = ORLChatbot()
        print("✅ Chatbot RAG initialisé")
        
        model_path = Config.MODEL_PATH
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Modèle ONNX non trouvé: {model_path}")
        
        dl_model = load_model(model_path)
        print(f"✅ EfficientNetB0 ONNX chargé depuis: {model_path}")
        
        # Initialiser Google Drive si configuré
        if Config.GOOGLE_DRIVE_ENABLED:
            global drive_service
            drive_service = GoogleDriveService()
        
        print("✅ Système KORAI v3 prêt")
    except Exception as e:
        print(f"❌ Erreur au démarrage: {e}")
        raise


# =====================================================================
# ROUTES
# =====================================================================

@app.get("/")
async def root():
    return {"status": "running", "version": "3.0.0", "drive_enabled": Config.GOOGLE_DRIVE_ENABLED}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "chatbot_ready": chatbot is not None,
        "model_ready": dl_model is not None,
        "drive_ready": Config.GOOGLE_DRIVE_ENABLED and drive_service is not None,
    }

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    if chatbot is None:
        raise HTTPException(status_code=503, detail="Chatbot non prêt")
    
    conv_id = req.conversation_id or datetime.now().strftime("%Y%m%d_%H%M%S")
    result = chatbot.query(req.message, req.show_sources)
    
    return ChatResponse(
        response=result["response"],
        sources=result["sources"],
        conversation_id=conv_id,
        timestamp=datetime.now().isoformat()
    )

@app.post("/vision/predict")
async def vision_predict(file: UploadFile = File(...)):
    """Prédiction UNIQUEMENT par le modèle de vision"""
    if dl_model is None:
        raise HTTPException(status_code=503, detail="Modèle non chargé")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Fichier image requis")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        raw_top3 = predict_top3(dl_model, image)
        
        top3 = []
        for pred in raw_top3:
            top3.append({
                "class": str(pred["class"]),
                "confidence": float(pred["confidence"])
            })
        
        return VisionDiagnosticResponse(
            prediction=top3[0]["class"],
            confidence=top3[0]["confidence"],
            top3=top3,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.exception("Erreur dans /vision/predict")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

@app.post("/rag/analyze")
async def rag_analyze(symptoms: str = Form(...), show_sources: bool = Form(False)):
    """Analyse UNIQUEMENT par RAG (symptômes)"""
    if chatbot is None:
        raise HTTPException(status_code=503, detail="Chatbot non prêt")
    
    try:
        result = chatbot.query(symptoms, show_sources)
        
        return RAGDiagnosticResponse(
            summary=result["response"],
            sources=result["sources"],
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.exception("Erreur dans /rag/analyze")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

@app.post("/diagnose-separate")
async def diagnose_separate(
    background_tasks: BackgroundTasks,
    symptoms: str = Form(...),
    show_sources: bool = Form(False),
    file: UploadFile = File(...),
):
    """
    Diagnostic SÉPARÉ : 
    - Vision → prédiction image
    - RAG → analyse symptômes
    Pas de fusion, l'expert verra les deux côte à côte
    """
    if chatbot is None or dl_model is None:
        raise HTTPException(status_code=503, detail="Système non prêt")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Fichier image requis")
    
    try:
        # Lire l'image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 1. Prédiction Vision
        raw_top3 = predict_top3(dl_model, image)
        vision_top3 = []
        for pred in raw_top3:
            vision_top3.append({
                "class": str(pred["class"]),
                "confidence": float(pred["confidence"])
            })
        
        vision_diagnostic = VisionDiagnosticResponse(
            prediction=vision_top3[0]["class"],
            confidence=vision_top3[0]["confidence"],
            top3=vision_top3,
            timestamp=datetime.now().isoformat()
        )
        
        # 2. Analyse RAG
        rag_result = chatbot.query(symptoms, show_sources)
        rag_diagnostic = RAGDiagnosticResponse(
            summary=rag_result["response"],
            sources=rag_result["sources"],
            timestamp=datetime.now().isoformat()
        )
        
        # 3. Stockage sur Google Drive
        case_id = str(uuid.uuid4())[:8].upper()
        drive_image_url = None
        drive_file_id = None
        
        if drive_service and Config.GOOGLE_DRIVE_ENABLED:
            filename = f"case_{case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            drive_file_id, drive_image_url = drive_service.upload_image(contents, filename, case_id)
        
        # 4. Stockage local
        case_store[case_id] = {
            "case_id": case_id,
            "timestamp": datetime.now().isoformat(),
            "symptoms": symptoms,
            "vision": {
                "prediction": vision_diagnostic.prediction,
                "confidence": vision_diagnostic.confidence,
                "top3": vision_diagnostic.top3
            },
            "rag": {
                "summary": rag_diagnostic.summary,
                "sources": rag_diagnostic.sources
            },
            "drive_image_url": drive_image_url,
            "drive_file_id": drive_file_id,
            "validation": None,
            "requires_expert_validation": True  # Toujours vrai car on veut validation experte
        }
        
        return SeparateDiagnosticResponse(
            case_id=case_id,
            timestamp=case_store[case_id]["timestamp"],
            vision=vision_diagnostic,
            rag=rag_diagnostic,
            requires_expert_validation=True,
            drive_image_url=drive_image_url,
            drive_file_id=drive_file_id
        )
        
    except Exception as e:
        logger.exception("Erreur dans /diagnose-separate")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

@app.post("/validate", response_model=ExpertValidationResponse)
async def expert_validate(validation: ExpertValidation):
    """
    Validation par expert ORL
    L'expert peut voir les deux diagnostics (vision et RAG) et donner le bon
    """
    if validation.case_id not in case_store:
        raise HTTPException(status_code=404, detail=f"Cas {validation.case_id} introuvable")
    
    case = case_store[validation.case_id]
    
    # Déterminer le diagnostic validé
    validated_diagnosis = validation.expert_diagnosis
    
    # Sauvegarde de la validation
    validation_data = {
        "expert_id": validation.expert_id,
        "expert_diagnosis": validation.expert_diagnosis,
        "expert_comment": validation.expert_comment,
        "validated_at": datetime.now().isoformat(),
        "vision_original": case["vision"]["prediction"],
        "rag_original": case["rag"]["summary"][:200],  # Extrait
        "vision_confidence": case["vision"]["confidence"],
        "validation_source": validation.validation_source
    }
    
    case["validation"] = validation_data
    
    # Sauvegarde sur Google Drive
    drive_export_url = None
    if drive_service and Config.GOOGLE_DRIVE_ENABLED:
        export_filename = f"validation_{validation.case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        export_data = {
            "case_id": validation.case_id,
            "original_data": case,
            "validation": validation_data
        }
        
        drive_export_url = drive_service.save_validation_data(export_data, export_filename)
    
    status = "validé" if validation.validation_source == "expert" else "confirmé"
    message = f"Diagnostic {status} par l'expert {validation.expert_id}"
    
    if not validation.expert_diagnosis == case["vision"]["prediction"]:
        message += f" (correction: {case['vision']['prediction']} → {validation.expert_diagnosis})"
    
    return ExpertValidationResponse(
        case_id=validation.case_id,
        saved=True,
        message=message,
        drive_export_url=drive_export_url
    )

@app.post("/validate-batch")
async def expert_validate_batch(validations: List[ExpertValidation]):
    """Validation en lot de plusieurs cas"""
    results = []
    for validation in validations:
        try:
            result = await expert_validate(validation)
            results.append({"case_id": validation.case_id, "status": "success"})
        except Exception as e:
            results.append({"case_id": validation.case_id, "status": "error", "error": str(e)})
    
    return {"total": len(validations), "results": results}

@app.get("/export/json/{case_id}")
async def export_case_json(case_id: str):
    """Exporter un cas spécifique en JSON"""
    if case_id not in case_store:
        raise HTTPException(status_code=404, detail=f"Cas {case_id} introuvable")
    
    content = json.dumps(case_store[case_id], ensure_ascii=False, indent=2, default=str)
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="case_{case_id}.json"'}
    )

@app.get("/export/all/json")
async def export_all_json(validated_only: bool = True):
    """Exporter tous les cas en JSON"""
    data = list(case_store.values())
    if validated_only:
        data = [c for c in data if c.get("validation") is not None]
    
    filename = f"korai_cases_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    content = json.dumps(data, ensure_ascii=False, indent=2, default=str)
    
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/export/all/csv")
async def export_all_csv(validated_only: bool = True):
    """Exporter tous les cas en CSV"""
    data = list(case_store.values())
    if validated_only:
        data = [c for c in data if c.get("validation") is not None]
    
    output = io.StringIO()
    fieldnames = [
        "case_id", "timestamp", "symptoms",
        "vision_prediction", "vision_confidence",
        "vision_top3",
        "rag_summary",
        "drive_image_url",
        "expert_diagnosis", "expert_comment", "expert_id", "validated_at"
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for case in data:
        v = case.get("validation") or {}
        writer.writerow({
            "case_id": case["case_id"],
            "timestamp": case["timestamp"],
            "symptoms": case["symptoms"],
            "vision_prediction": case["vision"]["prediction"],
            "vision_confidence": case["vision"]["confidence"],
            "vision_top3": json.dumps(case["vision"]["top3"]),
            "rag_summary": case["rag"]["summary"],
            "drive_image_url": case.get("drive_image_url", ""),
            "expert_diagnosis": v.get("expert_diagnosis", ""),
            "expert_comment": v.get("expert_comment", ""),
            "expert_id": v.get("expert_id", ""),
            "validated_at": v.get("validated_at", ""),
        })
    
    filename = f"korai_cases_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/cases")
async def list_cases(validated_only: bool = False):
    """Lister tous les cas"""
    data = list(case_store.values())
    if validated_only:
        data = [c for c in data if c.get("validation") is not None]
    
    # Version simplifiée pour l'affichage
    simplified = []
    for case in data:
        simplified.append({
            "case_id": case["case_id"],
            "timestamp": case["timestamp"],
            "vision_prediction": case["vision"]["prediction"],
            "vision_confidence": case["vision"]["confidence"],
            "validated": case.get("validation") is not None,
            "expert_diagnosis": case.get("validation", {}).get("expert_diagnosis") if case.get("validation") else None,
            "drive_image_url": case.get("drive_image_url")
        })
    
    return {"total": len(simplified), "cases": simplified}

@app.get("/statistics")
async def get_statistics():
    """Statistiques des validations"""
    total_cases = len(case_store)
    validated_cases = len([c for c in case_store.values() if c.get("validation")])
    
    # Comparaison vision vs expert
    vision_vs_expert = []
    for case in case_store.values():
        if case.get("validation"):
            vision_pred = case["vision"]["prediction"]
            expert_diag = case["validation"]["expert_diagnosis"]
            vision_vs_expert.append({
                "case_id": case["case_id"],
                "vision": vision_pred,
                "expert": expert_diag,
                "matches": vision_pred.lower() in expert_diag.lower() or expert_diag.lower() in vision_pred.lower()
            })
    
    matches = sum(1 for v in vision_vs_expert if v["matches"])
    accuracy = (matches / len(vision_vs_expert) * 100) if vision_vs_expert else 0
    
    return {
        "total_cases": total_cases,
        "validated_cases": validated_cases,
        "pending_validation": total_cases - validated_cases,
        "vision_accuracy": round(accuracy, 2),
        "comparisons": vision_vs_expert
    }


# =====================================================================
# SERVIR LE FRONTEND (pour ngrok / accès distant)
# =====================================================================
# Le dossier frontend/ est à la racine du projet, à côté de backend/
# __file__ = .../Version4/backend/utils/rag_api.py
# On remonte de 2 niveaux puis on entre dans frontend/
_FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
)

if os.path.isdir(_FRONTEND_DIR):
    app.mount("/app", StaticFiles(directory=_FRONTEND_DIR, html=True), name="frontend")
    print(f"✅ Frontend servi depuis: {_FRONTEND_DIR}")
else:
    print(f"⚠️ Dossier frontend introuvable: {_FRONTEND_DIR}")


if __name__ == "__main__":
    import uvicorn
    is_production = hasattr(sys, 'frozen')
    
    print(f"🚀 Démarrage KORAI ORL API v3")
    print(f"   Mode: {'Production (PyInstaller)' if is_production else 'Développement'}")
    print(f"   Host: {Config.API_HOST}")
    print(f"   Port: {Config.API_PORT}")
    print(f"   Google Drive: {'Activé' if Config.GOOGLE_DRIVE_ENABLED else 'Désactivé'}")
    
    uvicorn.run(
        app,
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=not is_production,
        log_level="info"
    )