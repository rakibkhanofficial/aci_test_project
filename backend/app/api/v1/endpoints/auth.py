from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from typing import Any

from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from app.services.auth_service import AuthService
from app.core.config import settings
from app.core.dependencies import get_current_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Register new user
    """
    # Debug: Check if db is AsyncSession
    print(f"DB type in register: {type(db)}")
    
    auth_service = AuthService(db)
    
    try:
        user = await auth_service.create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Add more detailed error for debugging
        print(f"Unexpected error in register: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    
@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    auth_service = AuthService(db)
    
    user = await auth_service.authenticate_user(
        username=login_data.username,
        password=login_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    tokens = await auth_service.generate_tokens(user)
    return tokens

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Refresh access token using refresh token
    """
    auth_service = AuthService(db)
    
    tokens = await auth_service.refresh_access_token(refresh_token)
    
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return tokens

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: UserResponse = Depends(get_current_user)
) -> Any:
    """
    Get current user information
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_update: dict,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update current user information
    """
    auth_service = AuthService(db)
    
    updated_user = await auth_service.update_user(current_user.id, user_update)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user

@router.post("/logout")
async def logout() -> Any:
    """
    Logout user (client should discard tokens)
    """
    return {"message": "Successfully logged out"}