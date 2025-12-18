from fastapi import APIRouter
from app.api.v1.endpoints import auth, chat, upload

api_router = APIRouter()

api_router.include_router(auth.router, tags=["authentication"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(upload.router, tags=["upload"])
