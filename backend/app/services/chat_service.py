from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
import json

from app.models.chat import Conversation, Message
from app.models.user import User
from app.schemas.chat import MessageCreate, ConversationCreate

class ChatService:
    def __init__(self, db: AsyncSession, user_id: int):
        self.db = db
        self.user_id = user_id
    
    async def get_or_create_conversation(
        self, 
        conversation_id: Optional[int] = None,
        initial_message: str = "New Conversation"
    ) -> Conversation:
        """Get existing conversation or create new one"""
        if conversation_id:
            result = await self.db.execute(
                select(Conversation)
                .where(
                    Conversation.id == conversation_id,
                    Conversation.user_id == self.user_id
                )
                .options(selectinload(Conversation.messages))
            )
            conversation = result.scalar_one_or_none()
            
            if conversation:
                return conversation
        
        # Create new conversation
        conversation = Conversation(
            user_id=self.user_id,
            title=initial_message[:100] + ("..." if len(initial_message) > 100 else "")
        )
        
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)
        
        return conversation
    
    async def save_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
        image_path: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Message:
        """Save message to database"""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            image_path=image_path,
            metadata=metadata or {}
        )
        
        self.db.add(message)
        
        # Update conversation timestamp
        await self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        
        await self.db.commit()
        await self.db.refresh(message)
        
        return message
    
    async def get_conversation_history(
        self, 
        conversation_id: int,
        limit: int = 50
    ) -> List[Dict[str, str]]:
        """Get conversation history formatted for LLM"""
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
            .limit(limit)
        )
        
        messages = result.scalars().all()
        
        return [
            {
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    
    async def get_user_conversations(
        self, 
        skip: int = 0, 
        limit: int = 50
    ) -> List[Conversation]:
        """Get all conversations for user"""
        result = await self.db.execute(
            select(Conversation)
            .where(Conversation.user_id == self.user_id)
            .order_by(desc(Conversation.updated_at))
            .offset(skip)
            .limit(limit)
            .options(selectinload(Conversation.messages))
        )
        
        return result.scalars().all()
    
    async def get_conversation(self, conversation_id: int) -> Optional[Conversation]:
        """Get specific conversation with messages"""
        result = await self.db.execute(
            select(Conversation)
            .where(
                Conversation.id == conversation_id,
                Conversation.user_id == self.user_id
            )
            .options(selectinload(Conversation.messages))
        )
        
        return result.scalar_one_or_none()
    
    async def delete_conversation(self, conversation_id: int) -> bool:
        """Delete conversation and all its messages"""
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == self.user_id
            )
        )
        
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            return False
        
        await self.db.delete(conversation)
        await self.db.commit()
        
        return True
    
    async def update_conversation_title(
        self, 
        conversation_id: int, 
        title: str
    ) -> Optional[Conversation]:
        """Update conversation title"""
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == self.user_id
            )
        )
        
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            return None
        
        conversation.title = title[:200]
        conversation.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(conversation)
        
        return conversation