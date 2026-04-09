# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.image import router as image_router
from routes.report import router as report_router

app = FastAPI(title="KORAI Backend")

# CORS – autorise ton app Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/auth")
app.include_router(chat_router, prefix="/api")
app.include_router(image_router, prefix="/api")
app.include_router(report_router, prefix="/api")

@app.get("/")
def root():
    return {"msg": "KORAI Backend Ready – Tout fonctionne !"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "chatbot_ready": True
    }

# ENDPOINT OTOSCOPIE – INJECTE LE DIAGNOSTIC DANS LE RAG
# backend/main.py (extrait modifié)
@app.post("/analyze_and_store")
async def analyze_and_store():
    from utils.rag_context import add_to_rag_context
    
    # SIMULATION (remplacez par votre vrai modèle d'analyse d'image)
    diagnosis = "Otite moyenne aiguë"
    confidence = 94
    findings = ["Tympan bombé", "Rougeur intense", "Perte du cône lumineux"]
    
    context_text = (
        f"📋 RÉSULTAT OTOSCOPIQUE DU {datetime.now().strftime('%d/%m/%Y à %H:%M')} :\n"
        f"• Diagnostic : {diagnosis}\n"
        f"• Fiabilité : {confidence}%\n"
        f"• Signes cliniques : {', '.join(findings)}"
    )
    
    # Injection dans le RAG (user_id=1 par défaut)
    add_to_rag_context(1, context_text)
    
    return {
        "success": True,
        "diagnosis": diagnosis,
        "confidence": confidence,
        "findings": findings,
        "message": "✅ Diagnostic injecté dans le RAG avec succès"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)