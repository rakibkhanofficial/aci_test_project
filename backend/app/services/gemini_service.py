import google.generativeai as genai
import base64
from typing import Optional, List, Dict, Any
from app.core.config import settings

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    async def process_multimodal_request(
        self,
        text: str,
        image_data: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Process text with optional image using Gemini API
        """
        try:
            # Prepare content
            content_parts = []
            
            # Add image if present
            if image_data:
                image_part = {
                    "mime_type": "image/jpeg",
                    "data": image_data
                }
                content_parts.append(image_part)
            
            # Add text
            content_parts.append(text)
            
            # Prepare chat history
            if history:
                chat = self.model.start_chat(history=history)
                response = await chat.send_message_async(content_parts)
            else:
                response = await self.model.generate_content_async(content_parts)
            
            return response.text
            
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    def format_history(self, messages: List[Dict]) -> List[Dict[str, str]]:
        """
        Format conversation history for Gemini API
        """
        formatted_history = []
        
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            formatted_history.append({
                "role": role,
                "parts": [msg["content"]]
            })
        
        return formatted_history