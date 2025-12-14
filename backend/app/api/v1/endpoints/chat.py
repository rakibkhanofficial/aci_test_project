from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
import base64
import json

from app.schemas.chat import ChatRequest, ChatResponse, ConversationResponse
from app.services.chat_service import ChatService
from app.services.gemini_service import GeminiService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def process_chat(
    message: str = Form(...),
    image: Optional[UploadFile] = File(None),
    conversation_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Process multimodal chat message with optional image upload
    """
    try:
        chat_service = ChatService(current_user.id)
        gemini_service = GeminiService()
        
        # Handle image upload if present
        image_data = None
        if image and image.content_type.startswith('image/'):
            image_content = await image.read()
            image_data = base64.b64encode(image_content).decode('utf-8')
        
        # Get or create conversation
        conversation = await chat_service.get_or_create_conversation(
            conversation_id=conversation_id,
            initial_message=message[:100]
        )
        
        # Save user message
        user_message = await chat_service.save_message(
            conversation_id=conversation.id,
            role="user",
            content=message,
            image_path=image.filename if image else None,
            metadata={"has_image": bool(image)}
        )
        
        # Get conversation history
        history = await chat_service.get_conversation_history(conversation.id)
        
        # Process with Gemini
        gemini_response = await gemini_service.process_multimodal_request(
            text=message,
            image_data=image_data,
            history=history
        )
        
        # Save assistant response
        assistant_message = await chat_service.save_message(
            conversation_id=conversation.id,
            role="assistant",
            content=gemini_response,
            metadata={"model": "gemini-pro-vision"}
        )
        
        return ChatResponse(
            message=assistant_message,
            conversation_id=conversation.id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """
    Get user's conversation history
    """
    chat_service = ChatService(current_user.id)
    conversations = await chat_service.get_user_conversations(skip, limit)
    return conversations

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get specific conversation with all messages
    """
    chat_service = ChatService(current_user.id)
    conversation = await chat_service.get_conversation(conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return conversation