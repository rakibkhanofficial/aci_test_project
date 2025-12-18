from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from app.core.security_utils import SecurityUtils  # Import from new module

router = APIRouter()

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None

@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        print(f"🔐 Attempting to register user: {user_data.username}")
        
        # Validate password
        is_valid, message = SecurityUtils.validate_password(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Check if user exists
        existing = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing:
            if existing.email == user_data.email:
                raise HTTPException(status_code=400, detail="Email already registered")
            else:
                raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create user with hashed password
        hashed_password = SecurityUtils.get_password_hash(user_data.password)
        
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ User registered successfully: {user.username}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return access token"""
    try:
        # Find user
        user = db.query(User).filter(
            (User.username == login_data.username) | 
            (User.email == login_data.username)
        ).first()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )
        
        # Verify password
        if not SecurityUtils.verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )
        
        # Create token
        access_token = SecurityUtils.create_access_token(
            data={"sub": user.username, "user_id": user.id}
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(SecurityUtils.get_current_user)
):
    """Get current user information"""
    return current_user