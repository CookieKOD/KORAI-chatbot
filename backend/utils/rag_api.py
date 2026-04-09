"""
Backend API FastAPI pour KORAI ORL
Chatbot RAG + Diagnostic image
"""

import os
import io
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict

import torch
from PIL import Image
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ================= PIPELINE IMAGE =================
from utils.orl_Inference_pipeline import load_model, predict_image

# ================= LANGCHAIN / RAG =================
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    DirectoryLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma

from langchain_mistralai import ChatMistralAI
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate


# ================= CONFIG =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "checkpoints",
    "best_efficientNetB0_final_all_ds.pth"
)

model = None
device = None


class Config:
    PROJECT_DIR = "KORAI-APP"
    DOCS_DIR = "./knowledge_pdfs"
    CHROMA_DIR = f"{PROJECT_DIR}/chroma_db"
    EMBEDDING_MODEL = "almanach/camembert-bio-base"
    LLM_MODEL = "open-mistral-7b"
    MISTRAL_API_KEY = os.getenv(
        "MISTRAL_API_KEY",
        "p1U0kec05V1W5Lck10Ecoz7naQzJcoIp"
    )


# ================= PYDANTIC =================
class ChatRequest(BaseModel):
    message: str
    show_sources: bool = False
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[Dict]] = None
    conversation_id: str
    timestamp: str


# ================= CHATBOT =================
class ORLChatbot:
    def __init__(self):
        self.vectorstore = None
        self.qa_chain = None
        self._init_rag()

    def _init_rag(self):
        os.environ["MISTRAL_API_KEY"] = Config.MISTRAL_API_KEY

        embeddings = HuggingFaceEmbeddings(
            model_name=Config.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"}
        )

        persist_dir = f"{Config.CHROMA_DIR}/orl_knowledge_base"

        if not os.path.exists(persist_dir):
            raise RuntimeError(f"Chroma DB introuvable : {persist_dir}")

        self.vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings
        )

        prompt = PromptTemplate(
            template="""Tu es un assistant médical ORL.

RÈGLES STRICTES :
- Réponds UNIQUEMENT sous forme de résumé clinique.
- Maximum 120 mots.
- Pas de références scientifiques.
- Pas d'introduction académique.
- Langage clair et synthétique.

FORMAT OBLIGATOIRE :
1. Causes probables
2. Signes associés
3. Quand consulter

CONTEXTE MÉDICAL :
{context}

QUESTION DU PATIENT :
{question}

RÉSUMÉ :
"""
,
            input_variables=["context", "question"]
        )

        llm = ChatMistralAI(
            model=Config.LLM_MODEL,
            temperature=0.1,
            max_tokens=300
        )

        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 4}),
            chain_type="stuff",
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True
        )

        print("✅ Chatbot ORL initialisé")

    def chat(self, message: str, show_sources: bool) -> Dict:
        result = self.qa_chain.invoke({"query": message})

        answer = (
            result["result"]
            .replace("*", "")
            .replace("_", "")
            .strip()
        )

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

        return {"response": answer, "sources": sources}


# ================= FASTAPI =================
app = FastAPI(title="KORAI ORL API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot: ORLChatbot | None = None


# ================= STARTUP =================
@app.on_event("startup")
async def startup():
    global chatbot, model, device

    print("🚀 Démarrage KORAI ORL")

    chatbot = ORLChatbot()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, device = load_model(MODEL_PATH)

    print(f"✅ Modèle image chargé sur {device}")


# ================= ROUTES =================
@app.get("/")
async def root():
    return {"status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if chatbot is None:
        raise HTTPException(status_code=503, detail="Chatbot non prêt")

    conv_id = req.conversation_id or datetime.now().strftime("%Y%m%d_%H%M%S")

    result = chatbot.chat(req.message, req.show_sources)

    return ChatResponse(
        response=result["response"],
        sources=result["sources"],
        conversation_id=conv_id,
        timestamp=datetime.now().isoformat()
    )


# ================= PREDICT IMAGE =================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global model, device

    if model is None:
        raise HTTPException(status_code=503, detail="Modèle non chargé")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image requise")

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    prediction, confidence = predict_image(model, image, device)

    return {
        "prediction": prediction,
        "confidence": float(confidence)
    }


# ================= MAIN =================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "utils.rag_api:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
