from flask import Flask, request, jsonify
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io

app = Flask(__name__)

# Load model
checkpoint = torch.load('model.pth', map_location='cpu')
CATEGORIES = checkpoint['classes']

model = models.mobilenet_v2(weights=None)
model.classifier[1] = nn.Linear(model.last_channel, len(CATEGORIES))
model.load_state_dict(checkpoint['model_state'])
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    img = Image.open(io.BytesIO(request.files['image'].read())).convert('RGB')
    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)[0]

    category = CATEGORIES[probs.argmax().item()]
    confidence = round(probs.max().item() * 100, 2)

    return jsonify({
        'category': category,
        'confidence': confidence,
        'all_scores': {c: round(p.item()*100, 2)
                       for c, p in zip(CATEGORIES, probs)}
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)