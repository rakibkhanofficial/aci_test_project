from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
import os
import uuid
from datetime import datetime
import imghdr  # Built-in Python module for image type detection
import mimetypes  # Built-in Python module for MIME type detection
from PIL import Image
import io
import hashlib

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.upload import FileUploadResponse, ImageAnalysisResponse
from app.utils.file_handlers import save_upload_file, validate_file_type

router = APIRouter()

def get_mime_type(file_content: bytes, filename: str) -> str:
    """
    Detect MIME type using only built-in Python libraries.
    Returns MIME type string or 'application/octet-stream' if unknown.
    """
    # First, try imghdr for image detection (most reliable for images)
    image_type = imghdr.what(None, h=file_content)
    if image_type:
        # imghdr returns simple type names like 'jpeg', 'png', 'gif'
        type_map = {
            'jpeg': 'image/jpeg',
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'tiff': 'image/tiff',
        }
        return type_map.get(image_type, f'image/{image_type}')
    
    # Second, try mimetypes based on filename extension
    mime_type, encoding = mimetypes.guess_type(filename)
    if mime_type:
        return mime_type
    
    # Third, check common image extensions manually
    ext = os.path.splitext(filename)[1].lower()
    extension_map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    }
    
    return extension_map.get(ext, 'application/octet-stream')

def validate_image_content(file_content: bytes, mime_type: str) -> bool:
    """
    Validate that the file content actually matches the claimed MIME type.
    Returns True if valid, False otherwise.
    """
    try:
        # Try to open with PIL to verify it's a valid image
        img = Image.open(io.BytesIO(file_content))
        img.verify()  # Verify without loading
        img.close()
        
        # Additional checks based on MIME type
        if mime_type == 'image/jpeg':
            # JPEG files should start with FF D8 and end with FF D9
            return file_content[:2] == b'\xff\xd8'
        elif mime_type == 'image/png':
            # PNG files should start with PNG signature
            return file_content[:8] == b'\x89PNG\r\n\x1a\n'
        elif mime_type == 'image/gif':
            # GIF files should start with GIF87a or GIF89a
            return file_content[:6] in [b'GIF87a', b'GIF89a']
        
        return True  # For other types, PIL verification is enough
    except Exception:
        return False

def get_file_hash(file_content: bytes) -> str:
    """Generate SHA256 hash of file content."""
    return hashlib.sha256(file_content).hexdigest()

def create_thumbnail(image_content: bytes, output_path: str, max_size: tuple = (200, 200)) -> bool:
    """
    Create a thumbnail from image content.
    Returns True if successful, False otherwise.
    """
    try:
        img = Image.open(io.BytesIO(image_content))
        
        # Convert to RGB if necessary (for PNG with transparency)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Create thumbnail
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save as JPEG for consistency
        img.save(output_path, 'JPEG', quality=85)
        return True
    except Exception as e:
        print(f"Thumbnail creation failed: {e}")
        return False

@router.post("/upload/image", response_model=FileUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload image file with validation using only built-in libraries.
    """
    try:
        # Read file content once
        file_content = await file.read()
        
        # Validate file size
        file_size = len(file_content)
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
            )
        
        # Detect MIME type
        mime_type = get_mime_type(file_content, file.filename)
        
        # Validate it's an allowed image type
        if mime_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type '{mime_type}' not allowed. Allowed types: {settings.ALLOWED_IMAGE_TYPES}"
            )
        
        # Validate image content matches claimed type
        if not validate_image_content(file_content, mime_type):
            raise HTTPException(
                status_code=400,
                detail="Invalid image file or file content doesn't match claimed type"
            )
        
        # Generate unique filename preserving extension
        file_ext = os.path.splitext(file.filename)[1]
        if not file_ext:
            # Add extension based on MIME type
            ext_map = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/webp': '.webp',
            }
            file_ext = ext_map.get(mime_type, '.jpg')
        
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Save file (reset file object with content)
        file.file = io.BytesIO(file_content)
        file_path = await save_upload_file(
            file=file,
            user_id=current_user.id,
            filename=unique_filename
        )
        
        # Generate file hash for integrity check
        file_hash = get_file_hash(file_content)
        
        # Create thumbnail
        thumbnail_path = None
        thumbnail_success = False
        
        # Only create thumbnails for supported formats
        if mime_type in ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']:
            thumbnail_filename = f"thumb_{unique_filename}"
            thumbnail_path = os.path.join(
                settings.UPLOAD_DIR,
                str(current_user.id),
                "thumbnails",
                thumbnail_filename
            )
            
            os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
            thumbnail_success = create_thumbnail(file_content, thumbnail_path)
        
        # Return file info
        return FileUploadResponse(
            filename=unique_filename,
            filepath=file_path,
            size=file_size,
            mime_type=mime_type,
            uploaded_at=datetime.utcnow(),
            url=f"/uploads/{current_user.id}/{unique_filename}",
            metadata={
                "original_name": file.filename,
                "hash": file_hash,
                "description": description,
                "thumbnail": thumbnail_path.replace(settings.UPLOAD_DIR + "/", "") if thumbnail_success else None,
                "thumbnail_created": thumbnail_success
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/analyze/image")
async def analyze_image(
    image_url: str = Form(...),
    prompt: Optional[str] = Form("Analyze this image"),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze uploaded image with Gemini AI
    """
    try:
        from app.services.gemini_service import GeminiService
        
        gemini_service = GeminiService()
        
        # Download image
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch image")
            
            image_data = response.content
        
        # Validate downloaded image
        mime_type = get_mime_type(image_data, "image.jpg")
        if mime_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Downloaded image type '{mime_type}' not allowed"
            )
        
        if not validate_image_content(image_data, mime_type):
            raise HTTPException(status_code=400, detail="Downloaded image is invalid")
        
        # Convert to base64
        import base64
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Analyze with Gemini
        analysis = await gemini_service.process_multimodal_request(
            text=prompt,
            image_data=base64_image
        )
        
        return ImageAnalysisResponse(
            analysis=analysis,
            confidence=0.95,  # Placeholder - could be calculated from AI response
            details={
                "model": settings.GEMINI_MODEL,
                "prompt": prompt,
                "image_size": len(image_data),
                "image_type": mime_type,
                "timestamp": datetime.utcnow().isoformat()
            },
            timestamp=datetime.utcnow()
        )
        
    except ImportError:
        raise HTTPException(status_code=500, detail="Gemini service not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/uploads/list")
async def list_uploads(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """
    List user's uploaded files
    """
    try:
        user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
        
        if not os.path.exists(user_upload_dir):
            return []
        
        files = []
        for filename in os.listdir(user_upload_dir):
            if filename.startswith('thumb_'):
                continue
                
            filepath = os.path.join(user_upload_dir, filename)
            if os.path.isfile(filepath):
                stat = os.stat(filepath)
                
                # Try to get MIME type from extension
                mime_type, _ = mimetypes.guess_type(filename)
                if not mime_type:
                    mime_type = 'application/octet-stream'
                
                files.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "mime_type": mime_type,
                    "modified": datetime.fromtimestamp(stat.st_mtime),
                    "url": f"/uploads/{current_user.id}/{filename}"
                })
        
        # Sort by modified time, newest first
        files.sort(key=lambda x: x["modified"], reverse=True)
        
        return files[skip:skip + limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")

@router.delete("/uploads/{filename}")
async def delete_upload(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user's uploaded file
    """
    try:
        # Security check: prevent path traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        filepath = os.path.join(settings.UPLOAD_DIR, str(current_user.id), filename)
        thumbpath = os.path.join(settings.UPLOAD_DIR, str(current_user.id), "thumbnails", f"thumb_{filename}")
        
        deleted_files = []
        
        # Delete main file
        if os.path.exists(filepath):
            os.remove(filepath)
            deleted_files.append(filename)
        
        # Delete thumbnail if exists
        if os.path.exists(thumbpath):
            os.remove(thumbpath)
            deleted_files.append(f"thumb_{filename}")
        
        return {
            "deleted": deleted_files,
            "message": f"Deleted {len(deleted_files)} file(s)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")