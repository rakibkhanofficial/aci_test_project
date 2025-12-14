from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FileUploadResponse(BaseModel):
    filename: str
    filepath: str
    size: int
    mime_type: str
    uploaded_at: datetime
    url: str

class ImageAnalysisRequest(BaseModel):
    image_url: str
    analysis_prompt: Optional[str] = "Analyze this image"

class ImageAnalysisResponse(BaseModel):
    analysis: str
    confidence: float
    details: dict
    timestamp: datetime