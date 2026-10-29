"""Authentication Pydantic schemas with resilient email validation."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Optional, Annotated
from pydantic import BaseModel, Field, field_validator, AfterValidator

# Resilient email validation that doesn't crash when optional email-validator package is absent
try:
    from pydantic import EmailStr
    from pydantic.networks import import_email_validator
    import_email_validator()
except (ImportError, Exception):
    EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    def _validate_email(v: str) -> str:
        if not isinstance(v, str) or not EMAIL_REGEX.match(v.strip()):
            raise ValueError("value is not a valid email address")
        return v.strip().lower()
    EmailStr = Annotated[str, AfterValidator(_validate_email)]

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="User password (min 8 chars, uppercase, lowercase)")
    full_name: Optional[str] = Field(None, max_length=100)
    organization: Optional[str] = Field(None, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter (A-Z).")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter (a-z).")
        return v

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=8, max_length=128, description="New password (min 8 chars, uppercase, lowercase)")

    @field_validator("new_password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter (A-Z).")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter (a-z).")
        return v

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

class MessageResponse(BaseModel):
    message: str
