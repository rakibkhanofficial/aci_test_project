# app/core/config.py
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

# Get the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Adjust if needed

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Retail Vision AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # YOLO
    YOLO_MODEL: str = "yolov8n.pt"
    CONFIDENCE_THRESHOLD: float = 0.25
    IOU_THRESHOLD: float = 0.45
    
    # Gemini
    GEMINI_API_KEY: str = ""
    
    # File Upload - CHANGE THIS TO PROJECT PATH
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")  # Now: /home/rakib-khan/Downloads/retail-vision-ai/backend/uploads
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]

    # Torch
    TORCH_WEIGHTS_ONLY: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

# Create a settings instance
settings = Settings()

# Print for debugging
print(f"📁 Project BASE_DIR: {BASE_DIR}")
print(f"📁 UPLOAD_DIR will be: {settings.UPLOAD_DIR}")