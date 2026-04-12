

# KORAI — Application RAG (Backend + Frontend)

## Description

KORAI est une application basée sur une architecture **Retrieval-Augmented Generation (RAG)**.  
Elle permet d’interroger une base de connaissances à travers :

- un backend en **FastAPI** exposant une API REST,
    
- un frontend en **React Native (Expo)** pour l’interface utilisateur.
    

---

## Structure du projet

```
korai-app/
├── backend/      # API FastAPI (RAG)
├── frontend/     # Application React Native (Expo)
```

---

## Prérequis

### Système

- macOS (ou Linux)
    
- Python 3.10 ou supérieur
    
- Node.js 18 ou supérieur
    
- npm / npx
    

Vérification :

```bash
python3 --version
node --version
npm --version
```

---

## Installation des dépendances

### 1. Backend (Python)

#### Création de l’environnement virtuel

Depuis le dossier backend :

```bash
cd korai-app/backend
python3 -m venv venv
```

#### Activation

```bash
source venv/bin/activate
```

#### Installation des dépendances

Le projet doit contenir un fichier :

```
requirements.txt
```

Installer les dépendances avec :

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Gestion des versions des dépendances

Le fichier `requirements.txt` doit contenir **les versions exactes** des paquets pour garantir la reproductibilité.

Exemple :

```
fastapi==0.110.0
uvicorn==0.29.0
pydantic==2.6.4
langchain==0.1.16
faiss-cpu==1.7.4
```

#### Générer automatiquement ce fichier (si nécessaire)

Si vous êtes le développeur du projet :

```bash
pip freeze > requirements.txt
```

Cela capture toutes les versions installées dans l’environnement.

---

## Lancement du backend

```bash
cd korai-app/backend
source venv/bin/activate
uvicorn utils.rag_api:app --reload
```

API disponible sur :

```
http://127.0.0.1:8000
```

---

## Frontend (React Native avec Expo)

### Installation des dépendances

```bash
cd korai-app/frontend
npm install
```

### Lancement

```bash
npx expo start 
```

---

## Bonnes pratiques de reproductibilité

Pour garantir que le projet fonctionne sur n’importe quelle machine :

1. Toujours versionner :
    
    - `requirements.txt` (Python)
        
    - `package.json` et `package-lock.json` (Node.js)
        
2. Ne jamais installer de dépendances globalement
    
3. Toujours utiliser un environnement virtuel Python
    
4. Vérifier la cohérence des versions :
    
    - Python (ex : 3.10 vs 3.11)
        
    - Node.js
        

---

## Cas particulier : virtualenvwrapper

Ce projet peut également utiliser `virtualenvwrapper`, mais sur macOS/Linux il est recommandé d’utiliser directement :

```bash
python3 -m venv venv
```

Cela évite les problèmes de compatibilité entre systèmes.

---

## Résolution de problèmes

### Conflits de dépendances

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --no-cache-dir
```

---

### Problème de version Python

Créer un environnement avec une version spécifique :

```bash
python3.10 -m venv venv
```

---

### Reset complet de l’environnement

```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Démarrage rapide

```bash
# Backend
cd korai-app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn utils.rag_api:app --reload

# Frontend
cd korai-app/frontend
npm install
npx expo start --tunnel
```

---

## Technologies utilisées

- Backend : FastAPI, Uvicorn
    
- Frontend : React Native (Expo)
    
- Architecture : Retrieval-Augmented Generation (RAG)
    

---

## Remarques

- Le backend doit être lancé avant le frontend
    
- Vérifier l’URL de l’API utilisée côté frontend
    
- Adapter les variables d’environnement si nécessaire
    

---

