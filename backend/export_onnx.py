import torch
from pathlib import Path
from utils.orl_Inference_pipeline import load_model

# 1. On définit la base : le dossier où se trouve ce script (backend)
BASE_DIR = Path(__file__).parent

# 2. Correction du chemin : on ajoute 'utils' dans le parcours
MODEL_PATH = BASE_DIR / "utils" / "checkpoints" / "best_efficientNetB0_final_all_ds.pth"

# 3. Chemin de sortie (frontend/assets)
OUTPUT_PATH = BASE_DIR.parent / "frontend" / "assets" / "efficientnet.onnx"

# Sécurité : Créer le dossier assets s'il n'existe pas encore
OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

print(f"Tentative de chargement du modèle : {MODEL_PATH}")

if __name__ == "__main__":
    if not MODEL_PATH.exists():
        print(f"❌ ERREUR : Le fichier est toujours introuvable à l'adresse : {MODEL_PATH}")
    else:
        # Chargement
        model, device = load_model(str(MODEL_PATH))
        model.eval()
        
        # Input fictif pour l'export ONNX
        dummy_input = torch.randn(1, 3, 224, 224).to(device)

        print("Export en cours...")
        torch.onnx.export(
            model, dummy_input, str(OUTPUT_PATH),
            export_params=True, 
            opset_version=12,
            input_names=["input"], 
            output_names=["output"]
        )
        print(f"✅ Succès ! Modèle exporté ici : {OUTPUT_PATH}")