from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=50)  # Limit to 50 chars
    
    @validator('password')
    def validate_password_length(cls, v):
        # Check byte length for bcrypt (72 bytes max)
        byte_length = len(v.encode('utf-8'))
        if byte_length > 72:
            # Suggest truncation or shorter password
            max_chars = 50  # Safe limit for UTF-8
            if len(v) > max_chars:
                raise ValueError(f'Password is too long. Maximum is {max_chars} characters.')
            else:
                raise ValueError('Password contains too many multi-byte characters. Please use a simpler password.')
        return v
    
    @validator('password')
    def validate_password_strength(cls, v):
        # Basic password strength validation
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        # Optional: Add more strength checks
        # if not any(char.isdigit() for char in v):
        #     raise ValueError('Password must contain at least one number')
        # if not any(char.isupper() for char in v):
        #     raise ValueError('Password must contain at least one uppercase letter')
        # if not any(char.islower() for char in v):
        #     raise ValueError('Password must contain at least one lowercase letter')
        
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8, max_length=50)
    
    @validator('password')
    def validate_password_length(cls, v):
        if v is not None:
            byte_length = len(v.encode('utf-8'))
            if byte_length > 72:
                raise ValueError('Password is too long. Maximum is 72 bytes.')
        return v

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    access_token: str
    token_type: str = "bearer"

# For login requests
class LoginRequest(BaseModel):
    username: str
    password: str
    
    @validator('password')
    def validate_password_length(cls, v):
        byte_length = len(v.encode('utf-8'))
        if byte_length > 72:
            # For login, we'll truncate but warn
            print(f"Warning: Login password too long ({byte_length} bytes)")
        return v

# For database representation
class UserInDB(UserResponse):
    hashed_password: str
    
    class Config:
        from_attributes = True