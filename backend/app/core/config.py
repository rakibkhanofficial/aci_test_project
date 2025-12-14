from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Project Chimera"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database - Use sync URL (postgresql:// not postgresql+asyncpg://)
    DATABASE_URL: str = "postgresql://chimera:chimera_secure_pass@postgres:5432/chimera_db"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Gemini AI
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-pro-vision"
    
    # File uploads
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif"]
    UPLOAD_DIR: str = "uploads"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()