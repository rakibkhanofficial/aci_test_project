from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class MessageBase(BaseModel):
    role: str
    content: str
    image_path: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageCreate(MessageBase):
    conversation_id: int

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: str = Field(..., max_length=200)

class ConversationCreate(ConversationBase):
    user_id: int

class ConversationResponse(ConversationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    image_data: Optional[str] = None  # Base64 encoded image

class ChatResponse(BaseModel):
    message: MessageResponse
    conversation_id: int