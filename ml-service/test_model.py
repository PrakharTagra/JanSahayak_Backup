import torch
import torch.nn as nn
from torchvision import datasets, transforms, models

checkpoint = torch.load('model.pth', map_location='cpu')
CATEGORIES = checkpoint['classes']

model = models.mobilenet_v2(weights=None)
model.classifier[1] = nn.Linear(model.last_channel, len(CATEGORIES))
model.load_state_dict(checkpoint['model_state'])
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

dataset = datasets.ImageFolder('dataset/', transform=transform)
loader  = torch.utils.data.DataLoader(dataset, batch_size=16)

correct = 0
total   = 0
per_class_correct = {c: 0 for c in CATEGORIES}
per_class_total   = {c: 0 for c in CATEGORIES}

with torch.no_grad():
    for images, labels in loader:
        outputs = model(images)
        preds   = outputs.argmax(1)
        for pred, label in zip(preds, labels):
            cat = CATEGORIES[label.item()]
            per_class_total[cat]   += 1
            if pred == label:
                per_class_correct[cat] += 1
                correct += 1
            total += 1

print(f"\n Overall accuracy: {correct/total*100:.1f}%  ({correct}/{total} images)\n")
print(f"{'Category':<20} {'Correct':<10} {'Total':<10} {'Accuracy'}")
print("-" * 55)
for cat in CATEGORIES:
    acc = per_class_correct[cat] / max(per_class_total[cat], 1) * 100
    print(f"{cat:<20} {per_class_correct[cat]:<10} {per_class_total[cat]:<10} {acc:.1f}%")