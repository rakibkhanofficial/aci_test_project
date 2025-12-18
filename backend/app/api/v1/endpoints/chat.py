from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
import base64
import os

from app.db.session import get_db
from app.models.user import User
from app.models.chat import Conversation, Message
from app.schemas.chat import ChatResponse, ConversationResponse, MessageResponse
from app.services.gemini_service import GeminiService
from app.core.security import SecurityUtils

router = APIRouter()

# Helper function to get current user
async def get_current_user_db(
    token: str = Depends(SecurityUtils.get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from token"""
    payload = SecurityUtils.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User is inactive")
    
    return user

@router.post("/chat", response_model=ChatResponse)
async def process_chat(
    message: str = Form(...),
    image: Optional[UploadFile] = File(None),
    conversation_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    """
    Process multimodal chat message with optional image upload
    """
    try:
        print(f"💬 Processing chat for user: {current_user.username}")
        
        # Handle image upload if present
        image_data = None
        image_path = None
        
        if image and image.content_type.startswith('image/'):
            # Save image to uploads directory
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            import uuid
            filename = f"{uuid.uuid4()}_{image.filename}"
            image_path = os.path.join(upload_dir, filename)
            
            # Save file
            with open(image_path, "wb") as buffer:
                content = await image.read()
                buffer.write(content)
            
            # Encode image for Gemini
            image_data = base64.b64encode(content).decode('utf-8')
            print(f"📸 Image uploaded: {filename}")
        
        # Get or create conversation
        conversation = None
        if conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id
            ).first()
        
        if not conversation:
            # Create new conversation
            title = message[:50] + "..." if len(message) > 50 else message
            conversation = Conversation(
                user_id=current_user.id,
                title=title,
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            print(f"📝 Created new conversation: {conversation.id}")
        
        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=message,
            image_path=image_path,
            message_metadata={
                "has_image": bool(image),
                "image_type": image.content_type if image else None
            }
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # Get conversation history
        messages = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.asc()).all()
        
        # Prepare history for Gemini
        history = []
        for msg in messages:
            history.append({
                "role": msg.role,
                "content": msg.content,
                "image_data": image_data if msg.id == user_message.id else None
            })
        
        # Process with Gemini
        gemini_service = GeminiService()
        gemini_response = await gemini_service.process_multimodal_request(
            text=message,
            image_data=image_data,
            history=history
        )
        
        # Save assistant response
        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=gemini_response,
            message_metadata={"model": "gemini-pro-vision"}
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        
        # Update conversation title if it's the first message
        if len(messages) == 1:  # Only user message so far
            conversation.title = message[:100] + "..." if len(message) > 100 else message
            db.commit()
        
        print(f"✅ Chat processed successfully")
        
        return ChatResponse(
            message=MessageResponse(
                id=assistant_message.id,
                role=assistant_message.role,
                content=assistant_message.content,
                created_at=assistant_message.created_at
            ),
            conversation_id=conversation.id
        )
        
    except Exception as e:
        print(f"❌ Chat processing error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    """
    Get user's conversation history
    """
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == current_user.id
        ).order_by(Conversation.updated_at.desc()).offset(skip).limit(limit).all()
        
        return conversations
        
    except Exception as e:
        print(f"❌ Get conversations error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get conversations")

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    """
    Get specific conversation with all messages
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Load messages
        conversation.messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Get conversation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get conversation")

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    """
    Delete a conversation
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Delete conversation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")