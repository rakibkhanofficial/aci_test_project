from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base_class import Base
from app.utils.file_handlers import ensure_upload_dirs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Project Chimera Backend")
    ensure_upload_dirs()
    
    # Create database tables - use sync context manager
    with engine.begin() as conn:  # Changed from async with to with
        Base.metadata.create_all(conn)  # No await needed
    
    yield
    
    # Shutdown
    logger.info("Shutting down Project Chimera Backend")

app = FastAPI(
    title="Project Chimera API",
    description="Deep-space communication system for astronaut assistance",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "operational", "system": "Project Chimera"}