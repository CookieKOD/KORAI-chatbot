import torch
from torchvision import models, transforms
from PIL import Image

# ==============================
# Classes (IMPORTANT: même ordre que l'entraînement)
# ==============================

class_names = [
    'aspect post tympanoplastie',
    'bouchon de cerumen',
    'cholestéatome',
    'corps étrangers oreille',
    'myringosclerose',
    'otomycose',
    'otite moyenne aigue',
    'otite séromuqueuse',
    'perforation tympanique',
    'tympan normal'
]

# ==============================
# Chargement du modèle
# ==============================

def load_model(model_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = models.efficientnet_b0(weights=None)

    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(num_ftrs, len(class_names))

    model.load_state_dict(torch.load(model_path, map_location=device))

    model.to(device)
    model.eval()

    return model, device


# ==============================
# Transformations (UNE SEULE FOIS)
# ==============================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ==============================
# Prédiction (VERSION API CORRIGÉE)
# ==============================

def predict_image(model, image, device):
    """
    image: PIL Image (déjà ouverte)
    """

    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, 1)

    predicted_class = class_names[predicted.item()]
    confidence_score = round(confidence.item() * 100, 2)

    return predicted_class, confidence_score
