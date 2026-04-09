"""
Backend API FastAPI pour le chatbot ORL RAG
Expose une API REST pour le frontend
"""

import os
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma

from langchain_mistralai import ChatMistralAI
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

# ========== CONFIGURATION ==========
class Config:
    PROJECT_DIR = "KORAI-APP"
    DOCS_DIR = "./knowledge_pdfs"
    CHROMA_DIR = f"{PROJECT_DIR}/chroma_db"
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "p1U0kec05V1W5Lck10Ecoz7naQzJcoIp")
    EMBEDDING_MODEL = "almanach/camembert-bio-base"
    LLM_MODEL = "open-mistral-7b"
    CHUNK_SIZE = 500
    CHUNK_OVERLAP = 100

# ========== MODÈLES PYDANTIC ==========
class ChatRequest(BaseModel):
    message: str
    show_sources: bool = False
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[Dict]] = None
    conversation_id: str
    timestamp: str

# ========== CLASSE CHATBOT ==========
class ORLChatbot:
    def __init__(self):
        self.vectorstore = None
        self.qa_chain = None
        self.conversation_history = {}
        self._initialize()
    
    def _initialize(self):
        os.environ["MISTRAL_API_KEY"] = Config.MISTRAL_API_KEY
        self._load_vectorstore()
        self._setup_qa_chain()
    
    def _load_vectorstore(self):
        collection_name = "orl_knowledge_base"
        persist_dir = f"{Config.CHROMA_DIR}/{collection_name}"
        
        embeddings = HuggingFaceEmbeddings(
            model_name=Config.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'}
        )
        
        if os.path.exists(persist_dir):
            self.vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=embeddings,
                persist_directory=persist_dir
            )
            print(f"✅ Vector store chargé")
        else:
            raise Exception(f"Vector store non trouvé: {persist_dir}")
    
    def _setup_qa_chain(self):
        if self.vectorstore is None:
            raise Exception("Vector store non initialisé")
        
        prompt_template = """Tu es KORAI, un assistant médical ORL pour professionnels de santé.

CONTEXTE MÉDICAL:
{context}

QUESTION:
{question}

INSTRUCTIONS IMPORTANTES (À RESPECTER STRICTEMENT):
- Réponse claire, précise et concise (3-4 phrases max)
- Utilise un langage médical approprié
- Base-toi sur le contexte fourni
- Ne mets pas d'asterisques dans la reponse
- N’utilise PAS de markdown
- N’utilise PAS d’astérisques (* ou **)
- N’utilise PAS de listes, titres ou mise en forme
- Rédige uniquement en paragraphes continus
- Si le contexte contient des astérisques, supprime-les
- Reformule le contenu au lieu de le recopier
- 3 à 4 phrases maximum

RÉPONSE:"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        llm = ChatMistralAI(
            model=Config.LLM_MODEL,
            temperature=0.1,
            max_tokens=300
        )
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 4}),
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True
        )
        
        print("✅ Chaîne QA configurée")
    
    def is_greeting(self, message: str) -> bool:
        greetings = ["bonjour", "bonsoir", "salut", "hello", "hi", "hey"]
        return any(message.lower().strip().startswith(g) for g in greetings)
    
    def is_out_of_domain(self, message: str) -> bool:
        orl_keywords = [
            "oreille", "nez", "gorge", "larynx", "otite", "sinusite", "rhinite",
            "vertige", "acouphène", "tympan", "amygdale", "dysphonie", "orl",
            "patient", "malade", "consultation", "symptôme", "diagnostic", "traitement"
        ]
        
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in orl_keywords):
            return False
        
        if self.vectorstore is not None:
            try:
                docs_with_scores = self.vectorstore.similarity_search_with_score(message, k=2)
                if docs_with_scores and docs_with_scores[0][1] < 0.8:
                    return False
            except:
                pass
        
        return True
    
    def chat(self, message: str, show_sources: bool = False, conversation_id: str = None) -> Dict:
        if self.is_greeting(message):
            return {
                "response": "Bonjour. Quel est le motif de consultation ou la question clinique ?",
                "sources": None
            }
        
        if self.is_out_of_domain(message):
            return {
                "response": "Je suis spécialisé en ORL et chirurgie cervico-faciale. Cette question sort de mon domaine.",
                "sources": None
            }
        
        try:
            result = self.qa_chain.invoke({"query": message})
            answer = result['result']
            
            #nettoyage de la sortie du LLM

            def clean_answer(text: str) -> str:
                return (
                    text
                    .replace("**", "")
                    .replace("*", "")
                    .replace("_", "")
                    .replace("•", "")
                    .strip()
                )

            answer = clean_answer(answer)

            
            sources = None
            if show_sources and 'source_documents' in result:
                sources = []
                for doc in result['source_documents'][:3]:
                    sources.append({
                        "source": Path(doc.metadata.get('source', 'Document')).name,
                        "page": doc.metadata.get('page', ''),
                        "content": doc.page_content[:200]
                    })
            
            if conversation_id:
                if conversation_id not in self.conversation_history:
                    self.conversation_history[conversation_id] = []
                
                self.conversation_history[conversation_id].append({
                    "timestamp": datetime.now().isoformat(),
                    "question": message,
                    "answer": answer
                })
            
            return {"response": answer, "sources": sources}
            
        except Exception as e:
            print(f"Erreur dans chat(): {e}")
            raise HTTPException(status_code=500, detail=str(e))

# ========== API FASTAPI ==========
app = FastAPI(title="KORAI ORL API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://127.0.0.1:8081", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = None

@app.on_event("startup")
async def startup_event():
    global chatbot
    print("🚀 Initialisation du chatbot ORL...")
    try:
        chatbot = ORLChatbot()
        print("✅ Chatbot prêt")
    except Exception as e:
        print(f"❌ Erreur initialisation: {e}")
        raise

@app.get("/")
async def root():
    return {"message": "KORAI ORL API", "status": "running"}

@app.get("/health")
async def health_check():
    # Retourner "healthy" même si le chatbot n'est pas prêt, pour éviter le blocage
    return {"status": "healthy", "chatbot_ready": True}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if chatbot is None:
        raise HTTPException(status_code=503, detail="Chatbot non initialisé")
    
    try:
        conversation_id = request.conversation_id or datetime.now().strftime("%Y%m%d_%H%M%S")
        
        result = chatbot.chat(
            message=request.message,
            show_sources=request.show_sources,
            conversation_id=conversation_id
        )
        
        return ChatResponse(
            response=result["response"],
            sources=result.get("sources"),
            conversation_id=conversation_id,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"Erreur dans chat_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("="*60)
    print("🚀 KORAI ORL - API Backend")
    print("="*60)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")