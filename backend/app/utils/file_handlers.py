import os
import shutil
import hashlib
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
import aiofiles
from app.core.config import settings

def ensure_upload_dirs():
    """Create necessary upload directories"""
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(exist_ok=True)
    
    # Create user directories
    for i in range(10):  # Create 10 subdirectories for sharding
        (upload_path / str(i)).mkdir(exist_ok=True)

def get_user_upload_dir(user_id: int) -> Path:
    """Get user-specific upload directory"""
    # Shard by user_id to avoid too many files in one directory
    shard = str(user_id % 10)
    user_dir = Path(settings.UPLOAD_DIR) / shard / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    
    # Create thumbnails directory
    thumb_dir = user_dir / "thumbnails"
    thumb_dir.mkdir(exist_ok=True)
    
    return user_dir

async def save_upload_file(
    file: UploadFile, 
    user_id: int, 
    filename: Optional[str] = None
) -> str:
    """Save uploaded file and return filepath"""
    if filename is None:
        filename = file.filename
    
    user_dir = get_user_upload_dir(user_id)
    file_path = user_dir / filename
    
    async with aiofiles.open(file_path, 'wb') as buffer:
        content = await file.read()
        await buffer.write(content)
    
    return str(file_path)

def validate_file_type(file_content: bytes, allowed_types: list) -> bool:
    """Validate file type using magic numbers"""
    import magic
    
    mime_type = magic.from_buffer(file_content, mime=True)
    return mime_type in allowed_types

def get_file_hash(file_content: bytes) -> str:
    """Calculate SHA256 hash of file content"""
    return hashlib.sha256(file_content).hexdigest()

def delete_file(filepath: str) -> bool:
    """Delete file from filesystem"""
    try:
        path = Path(filepath)
        if path.exists():
            path.unlink()
            return True
        return False
    except Exception:
        return False

def get_file_size(filepath: str) -> Optional[int]:
    """Get file size in bytes"""
    try:
        return os.path.getsize(filepath)
    except Exception:
        return None

def list_user_files(user_id: int) -> list:
    """List all files for a user"""
    user_dir = get_user_upload_dir(user_id)
    files = []
    
    for file_path in user_dir.glob("*"):
        if file_path.is_file() and not file_path.name.startswith("thumb_"):
            files.append({
                "name": file_path.name,
                "size": file_path.stat().st_size,
                "path": str(file_path)
            })
    
    return files