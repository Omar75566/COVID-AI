import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(title="COVID-19 X-Ray Classifier", version="1.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://YOUR_APP.vercel.app"
).split(",")


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

MODEL_PATH="./model.mobilenet_v2.keras"
try:
    model=tf.keras.models.load_model(MODEL_PATH)
    logger.info("Model loaded successfully")
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    logger.error(f"Error loading model: {e}")

    model = None

def preprocess_images(image_bytes:bytes)->np.ndarray:
    img=Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((128, 128))
    img_array = np.array(img, dtype=np.float32)
    ##img_array = (img_array / 127.5) - 1.0  
    img_array = np.expand_dims(img_array, axis=0)  
    return img_array

@app.get("/")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

@app.post("/predict")
async def predict(file:UploadFile=File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
        status_code=400,
        detail="Invalid file type. Only JPEG, PNG, and WEBP are accepted."
    )
    content=await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 5MB."
        )    
    logger.info(f"Predicting: {file.filename} ({file.content_type})")
    
    try:
        img_array=preprocess_images(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not Preprocess image! {str(e)}")

    raw_score = float(model.predict(img_array, verbose=0)[0][0])
    predicted_class = "PNEUMONIA" if raw_score >= 0.5 else "NORMAL"
    confidence = raw_score if raw_score >= 0.5 else 1.0 - raw_score
    
    return {
        "prediction": predicted_class,
        "confidence": round(confidence * 100, 2), 
        "raw_score": round(raw_score, 4),
        "threshold_used": 0.5
    }
'''
@app.post("/debug")
async def debug(file: UploadFile = File(...)):
    contents = await file.read()
    img_array = preprocess_images(contents)
    raw = float(model.predict(img_array, verbose=0)[0][0])
    return {
        "raw_score": raw,
        "img_shape": list(img_array.shape),
        "img_min": float(img_array.min()),
        "img_max": float(img_array.max()),
        "img_mean": float(img_array.mean()),
    }
    '''