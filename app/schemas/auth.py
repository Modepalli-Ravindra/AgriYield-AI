"""Authentication Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128, description="User password (min 6 chars)")
    full_name: Optional[str] = Field(None, max_length=100)
    organization: Optional[str] = Field(None, max_length=100)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    organization: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
