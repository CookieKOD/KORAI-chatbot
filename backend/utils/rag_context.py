# backend/utils/rag_context.py
import json
import os
from datetime import datetime

RAG_FILE = "data/rag_contexts.json"

def ensure_rag_file():
    """Crée le fichier RAG s'il n'existe pas"""
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(RAG_FILE):
        with open(RAG_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

def add_rag_context(user_id: int, context_text: str):
    """Ajoute un contexte médical au RAG d'un utilisateur"""
    ensure_rag_file()
    
    with open(RAG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    user_key = str(user_id)
    if user_key not in data:
        data[user_key] = []
    
    data[user_key].append({
        "timestamp": datetime.now().isoformat(),
        "content": context_text
    })
    
    # Garde seulement les 10 derniers contextes
    data[user_key] = data[user_key][-10:]
    
    with open(RAG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_rag_context(user_id: int) -> str:
    """Récupère tout le contexte RAG d'un utilisateur"""
    ensure_rag_file()
    
    with open(RAG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    user_key = str(user_id)
    if user_key not in data or not data[user_key]:
        return "Aucun examen otoscopique récent."
    
    contexts = data[user_key]
    formatted = "\n\n".join([ctx["content"] for ctx in contexts])
    return f"HISTORIQUE MÉDICAL DU PATIENT :\n\n{formatted}"