# Chest X-Ray Classifier

A full-stack AI web application that classifies chest X-ray images as **Normal** or **Pneumonia** using Transfer Learning with MobileNetV2.

> ⚠️ For educational purposes only. Not a substitute for professional medical diagnosis.

---

## 🔴 Live Demo

- **Frontend:** [xray-classifier.vercel.app](https://xray-classifier.vercel.app) ← update this
- **API:** [xray-api.up.railway.app](https://xray-api.up.railway.app) ← update this

---

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| Test Accuracy | **97.50%** |
| NORMAL Precision | 0.95 |
| NORMAL Recall | 1.00 |
| PNEUMONIA Precision | 1.00 |
| PNEUMONIA Recall | 0.95 |
| Training Epochs | 22 (early stopping) |


---

## 🧠 Model Architecture

- **Base Model:** MobileNetV2 pretrained on ImageNet (frozen weights)
- **Input Size:** 128×128 RGB
- **Preprocessing:** Rescaling to [-1, 1] range (built into model)
- **Custom Head:** GlobalAveragePooling2D → Dropout(0.2) → Dense(1, sigmoid)
- **Optimizer:** Adam (lr=0.001, β1=0.9, β2=0.999)
- **Loss:** Binary Crossentropy

**Data Augmentation (built into model):**
- RandomRotation (±5%)
- RandomZoom (10%)
- RandomTranslation (10%)
- RandomContrast (10%)

**Callbacks:**
- ModelCheckpoint (save best val_loss)
- ReduceLROnPlateau (factor=0.5, patience=5)
- EarlyStopping (patience=5)

---

## 📁 Dataset

- **Source:** [COVID-19 X-Ray Dataset](https://www.kaggle.com/datasets/khoongweihao/covid19-xray-dataset-train-test-sets)
- **Classes:** NORMAL (0), PNEUMONIA (1)
- **Train:** 119 images (80/20 split)
- **Validation:** 29 images
- **Test:** 40 images
- **Class Balance:** Perfectly balanced (50/50)

---

## 🛠️ Stack

| Layer | Technology |
|-------|-----------|
| Model | TensorFlow/Keras · MobileNetV2 |
| Backend | FastAPI · Python |
| Frontend | React · TypeScript · Vite · Tailwind CSS |
| Containerization | Docker · Docker Compose |
| Backend Deploy | Railway |
| Frontend Deploy | Vercel |

---

## 📂 Project Structure

```
COVID-AI/
├── backend/
│   ├── main.py              # FastAPI app + /predict endpoint
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile
│   └── model/
│       └── model.mobilenet_v2.keras   # ← model weights (not in git)
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main UI component
│   │   └── index.css        # Tailwind directives
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .env                 # VITE_API_URL (not in git)
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Run Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker + Docker Compose

### Without Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
# Place model.mobilenet_v2.keras in backend/model/
uvicorn main:app --reload
# Runs on http://localhost:8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### With Docker

```bash
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
```

---

## 🔌 API

### `GET /`
Health check

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true
}
```

### `POST /predict`
Classify a chest X-ray image

**Request:** `multipart/form-data` with `file` field (PNG, JPG, WEBP — max 5MB)

**Response:**
```json
{
  "prediction": "NORMAL",
  "confidence": 97.50,
  "raw_score": 0.9750,
  "threshold_used": 0.5
}
```

**Error responses:**
- `400` — Invalid file type or corrupted image
- `413` — File too large (>5MB)
- `503` — Model not loaded

---

## ⚙️ Environment Variables

**Frontend (`.env`):**
```
VITE_API_URL=http://localhost:8000
```

**Backend (Railway dashboard):**
```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 🧪 How Prediction Works

```
Upload X-Ray image
      ↓
Convert to RGB
      ↓
Resize to 128×128
      ↓
Feed raw pixels [0-255] to model
      ↓
Model rescales to [-1, 1] internally
      ↓
MobileNetV2 feature extraction
      ↓
Sigmoid output → single score [0, 1]
      ↓
score ≥ 0.5 → PNEUMONIA
score < 0.5 → NORMAL
```

---

## 📝 Key Technical Decisions

**Why MobileNetV2?**
Lightweight architecture designed for resource-constrained environments. Fast inference on CPU — no GPU needed for serving.

**Why preprocessing inside the model?**
Rescaling is built into the model graph so the API receives raw pixels and the model handles normalization internally. This eliminates preprocessing mismatch bugs between training and serving.

**Why threshold 0.5?**
The official test accuracy of 97.5% was measured using 0.5 as the decision boundary. This is the threshold the model was actually evaluated against.

---

## 🏆 Achievements
- 97.5% test accuracy on held-out test set
- Production-ready API with input validation, CORS, and logging
- Fully containerized with Docker Compose

---

## 👤 Author

**Omar Ahmed**
- GitHub: [@Omar75566](https://github.com/Omar75566)
- LinkedIn: [omar-ahmed-981811324](https://linkedin.com/in/omar-ahmed-981811324)
- Email: omar.ahmed75566@gmail.com