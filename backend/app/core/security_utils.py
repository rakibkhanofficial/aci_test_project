"""
Robust security utilities with fallback mechanisms
"""
from datetime import datetime, timedelta
from typing import Optional, Tuple
import hashlib
import secrets
from jose import JWTError, jwt
from passlib.hash import bcrypt, sha256_crypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

# Create OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class SecurityUtils:
    # Class variable to track bcrypt availability
    _bcrypt_available = True
    
    @classmethod
    def initialize(cls):
        """Initialize and test bcrypt availability"""
        try:
            # Test bcrypt
            test_hash = bcrypt.hash("test")
            test_verify = bcrypt.verify("test", test_hash)
            print(f"✅ Bcrypt initialized successfully")
            cls._bcrypt_available = True
        except Exception as e:
            print(f"⚠️ Bcrypt initialization failed: {e}, using SHA256 fallback")
            cls._bcrypt_available = False
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            # Check hash type
            if hashed_password.startswith("sha256$"):
                # SHA256 fallback verification
                stored_hash = hashed_password.split("$")[1]
                salt = settings.SECRET_KEY[:16].encode('utf-8')
                computed_hash = hashlib.sha256(salt + plain_password.encode('utf-8')).hexdigest()
                return secrets.compare_digest(stored_hash, computed_hash)
            else:
                # Bcrypt verification
                # Truncate password if too long
                password_bytes = plain_password.encode('utf-8')
                if len(password_bytes) > 72:
                    # Truncate safely
                    truncated = password_bytes[:72]
                    while truncated and (truncated[-1] & 0b11000000) == 0b10000000:
                        truncated = truncated[:-1]
                    plain_password = truncated.decode('utf-8', 'ignore')
                
                return bcrypt.verify(plain_password, hashed_password)
        except Exception as e:
            print(f"❌ Password verification error: {e}")
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Get password hash with bcrypt or SHA256 fallback"""
        # Clean password
        password = password.strip()
        
        if SecurityUtils._bcrypt_available:
            try:
                # Truncate if too long for bcrypt
                password_bytes = password.encode('utf-8')
                if len(password_bytes) > 72:
                    print(f"⚠️ Password too long ({len(password_bytes)} bytes), truncating for bcrypt")
                    truncated = password_bytes[:72]
                    while truncated and (truncated[-1] & 0b11000000) == 0b10000000:
                        truncated = truncated[:-1]
                    password = truncated.decode('utf-8', 'ignore')
                    print(f"🔧 Truncated to {len(password.encode('utf-8'))} bytes")
                
                return bcrypt.hash(password)
            except Exception as e:
                print(f"❌ Bcrypt hashing failed: {e}, falling back to SHA256")
                SecurityUtils._bcrypt_available = False
        
        # SHA256 fallback
        try:
            salt = settings.SECRET_KEY[:16].encode('utf-8')
            hashed = hashlib.sha256(salt + password.encode('utf-8')).hexdigest()
            print(f"🔧 Using SHA256 fallback hash")
            return f"sha256${hashed}"
        except Exception as e:
            print(f"❌ SHA256 hashing failed: {e}")
            raise ValueError("Password hashing failed")
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT refresh token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=7)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """Decode and verify a JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError as e:
            print(f"❌ Token decode error: {e}")
            return None
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, str]:
        """Validate password strength"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if len(password) > 50:
            return False, "Password must be less than 50 characters"
        
        # Check byte length
        byte_length = len(password.encode('utf-8'))
        if byte_length > 72:
            return False, "Password contains too many complex characters"
        
        return True, "Password is valid"
    
    @staticmethod
    async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
    ) -> User:
        """
        Get current user from JWT token
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        payload = SecurityUtils.decode_token(token)
        if payload is None:
            raise credentials_exception
        
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Get user from database
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            user = db.query(User).filter(User.email == username).first()
            if user is None:
                raise credentials_exception
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        return user

# Initialize on module import
SecurityUtils.initialize()