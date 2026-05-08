import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI(title="COVID-19 X-Ray Classifier", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH="./model/model.mobilenet_v2.keras"
try:
    model=tf.keras.models.load_model(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
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
@app.post("/predict")
async def predict(file:UploadFile=File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an Image")
    content=await file.read()

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