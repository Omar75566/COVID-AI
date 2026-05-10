# 🫁 Chest X-Ray Classifier

A full-stack AI web application that classifies chest X-ray images as **Normal** or **Pneumonia** using Transfer Learning with MobileNetV2 — trained, deployed, and production-ready.

> ⚠️ For educational purposes only. Not a substitute for professional medical diagnosis.

---

## 🔴 Live Demo

| | Link |
|---|---|
| **Frontend** | [covid-ai.vercel.app](https://covid-ai.vercel.app) |
| **API** | [omar75566-xray-classifier-api.hf.space/docs](https://omar75566-xray-classifier-api.hf.space/docs) |

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
| Best Checkpoint | Epoch 17 |

---

## 🧠 How It Works

```
Upload X-Ray
     ↓
Convert to RGB + Resize to 128×128
     ↓
Feed raw pixels [0-255] to model
     ↓
Model rescales internally to [-1, 1]
     ↓
MobileNetV2 feature extraction (frozen ImageNet weights)
     ↓
GlobalAveragePooling → Dropout(0.2) → Dense(1, sigmoid)
     ↓
score ≥ 0.5 → PNEUMONIA
score < 0.5 → NORMAL
```

---

## 🛠️ Stack

| Layer | Technology |
|-------|-----------|
| Model | TensorFlow 2.19 · Keras 3.10 · MobileNetV2 |
| Backend | FastAPI · Python 3.11 · Uvicorn |
| Frontend | React · TypeScript · Vite · Tailwind CSS |
| Containerization | Docker · Docker Compose |
| Backend Deploy | Hugging Face Spaces (free) |
| Frontend Deploy | Vercel (free) |

---

## 📁 Project Structure

```
COVID-AI/
├── backend/
│   ├── main.py              # FastAPI app + /predict endpoint
│   ├── requirements.txt
│   ├── Dockerfile
│   └── model/
│       └── model.mobilenet_v2.keras
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main UI — upload, predict, display result
│   │   └── index.css        # Tailwind directives
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
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
uvicorn main:app --reload
# → http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### With Docker Compose

```bash
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
```

---

## 🔌 API Reference

### `GET /`
Health check

```json
{
  "status": "ok",
  "model_loaded": true
}
```

### `POST /predict`

**Request:** `multipart/form-data` with `file` field (PNG · JPG · WEBP · max 5MB)

**Response:**
```json
{
  "prediction": "NORMAL",
  "confidence": 97.50,
  "raw_score": 0.9750,
  "threshold_used": 0.5
}
```

**Error codes:** `400` invalid file · `413` too large · `503` model not loaded

---

## 🧪 Model Details

**Architecture:**
- Base: MobileNetV2 pretrained on ImageNet (weights frozen)
- Custom head: GlobalAveragePooling2D → Dropout(0.2) → Dense(1, sigmoid)
- Preprocessing built into model: Rescaling to [-1, 1]

**Training:**
- Optimizer: Adam (lr=0.001, β1=0.9, β2=0.999)
- Loss: Binary Crossentropy
- Callbacks: ModelCheckpoint + ReduceLROnPlateau + EarlyStopping (patience=5)

**Augmentation (built into model):**
- RandomRotation ±5%
- RandomZoom 10%
- RandomTranslation 10%
- RandomContrast 10%

**Dataset:**
- Source: [COVID-19 X-Ray Dataset](https://www.kaggle.com/datasets/khoongweihao/covid19-xray-dataset-train-test-sets)
- Classes: NORMAL · PNEUMONIA (perfectly balanced 50/50)
- Train: 119 · Validation: 29 · Test: 40

---

## 🏆 Achievements
- 97.5% test accuracy on held-out test set
- Production-ready API with validation, CORS, logging
- Full CI/CD — push to GitHub → auto deploy

---

## 👤 Author

**Omar Ahmed** 

- GitHub: [@Omar75566](https://github.com/Omar75566)
- LinkedIn: [omar-ahmed-981811324](https://linkedin.com/in/omar-ahmed-981811324)
- Email: omar.ahmed75566@gmail.com
- Hugging Face: [Omar75566](https://huggingface.co/Omar75566)