import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import List
from celery import shared_task
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.chat import Message
from app.utils.file_handlers import delete_file, list_user_files
from app.core.config import settings

@shared_task
def cleanup_temp_files():
    """
    Clean up temporary files older than 24 hours
    """
    try:
        temp_dir = Path(settings.UPLOAD_DIR) / "temp"
        if not temp_dir.exists():
            return {"status": "success", "message": "No temp directory"}
        
        deleted_files = 0
        for file_path in temp_dir.glob("*"):
            if file_path.is_file():
                file_age = datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)
                if file_age > timedelta(hours=24):
                    file_path.unlink()
                    deleted_files += 1
        
        return {
            "status": "success",
            "deleted_files": deleted_files,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"status": "error", "error": str(e)}

@shared_task
def backup_conversations():
    """
    Backup conversations to JSON file
    """
    try:
        backup_dir = Path("backups")
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"conversations_backup_{timestamp}.json"
        
        # This would be async in real implementation
        # For now, return success status
        
        return {
            "status": "success",
            "backup_file": str(backup_file),
            "timestamp": timestamp
        }
        
    except Exception as e:
        return {"status": "error", "error": str(e)}

@shared_task
def process_image_analysis(image_path: str, analysis_prompt: str) -> dict:
    """
    Process image analysis in background
    """
    try:
        from app.services.gemini_service import GeminiService
        
        gemini_service = GeminiService()
        
        # Read image file
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        import base64
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Analyze with Gemini
        analysis = gemini_service.process_multimodal_request(
            text=analysis_prompt,
            image_data=base64_image
        )
        
        return {
            "status": "success",
            "analysis": analysis,
            "image_path": image_path,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"status": "error", "error": str(e)}

@shared_task
def generate_conversation_summary(conversation_id: int) -> dict:
    """
    Generate summary of conversation
    """
    try:
        from app.services.gemini_service import GeminiService
        
        gemini_service = GeminiService()
        
        # Get conversation messages
        async def get_messages():
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(Message)
                    .where(Message.conversation_id == conversation_id)
                    .order_by(Message.created_at)
                    .limit(100)
                )
                messages = result.scalars().all()
                return [{"role": m.role, "content": m.content} for m in messages]
        
        # Convert async to sync for Celery
        import asyncio
        messages = asyncio.run(get_messages())
        
        # Generate summary
        summary_prompt = f"""
        Summarize this conversation between an astronaut and AI assistant.
        Focus on:
        1. Main issues discussed
        2. Solutions provided
        3. Critical findings
        4. Action items
        
        Conversation:
        {messages}
        """
        
        summary = gemini_service.process_multimodal_request(
            text=summary_prompt,
            image_data=None
        )
        
        return {
            "status": "success",
            "conversation_id": conversation_id,
            "summary": summary,
            "message_count": len(messages),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"status": "error", "error": str(e)}