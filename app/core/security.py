"""Security utilities: Argon2id password hashing and JWT access token handling."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import argon2
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# Initialize Argon2 Password Hasher (Argon2id default)
_hasher = argon2.PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    type=argon2.Type.ID
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return _hasher.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against Argon2id hash with graceful fallback."""
    try:
        return _hasher.verify(hashed_password, plain_password)
    except (argon2.exceptions.VerifyMismatchError, argon2.exceptions.VerificationError, argon2.exceptions.InvalidHashError):
        # Fallback check for bcrypt/pbkdf2 if legacy hash encountered
        try:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False

def create_access_token(subject: str | Any, extra_claims: Optional[Dict[str, Any]] = None, expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    if extra_claims:
        to_encode.update(extra_claims)
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
