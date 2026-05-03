import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import chromadb


load_dotenv()

def process_pdfs(pdf_folder=r"C:\Users\hp\Desktop\DiCentre_Project\korai-app\knowledge_pdfs"):
    # Charger tous les PDFs
    docs = []
    for file in os.listdir(pdf_folder):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(pdf_folder, file))
            docs.extend(loader.load())

    # Découper les textes en chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )
    splits = text_splitter.split_documents(docs)

    # Créer les embeddings (CamemBERT)
    embeddings = HuggingFaceEmbeddings(
        model_name="camembert-base",
        model_kwargs={"device": "cpu"}  # changer en 'cuda' si GPU
    )

    # Stocker dans ChromaDB
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )

    vectorstore.persist()
    print("✅ PDFs processed and stored in ChromaDB!")
    return vectorstore


if __name__ == "__main__":
    process_pdfs()
