"""Authentication endpoints: Register, Login (Zero-OTP), and Current User."""
from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    oauth2_scheme,
    verify_password,
)
from app.db.database import db
from app.schemas.auth import (
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserLoginRequest,
    UserProfile,
    UserRegisterRequest,
)

router = APIRouter()


def _build_token_response(user: Dict[str, Any]) -> TokenResponse:
    """Helper to issue a signed access token and construct UserProfile."""
    access_token = create_access_token(
        subject=user["id"],
        extra_claims={"email": user["email"], "org": user.get("organization")},
    )
    profile = UserProfile(
        id=user["id"],
        email=user["email"],
        full_name=user.get("full_name"),
        organization=user.get("organization"),
        created_at=user["created_at"],
    )
    return TokenResponse(access_token=access_token, token_type="bearer", user=profile)


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[dict]:
    """Extract authenticated user if token present, else return None without raising."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.get_user_by_id(user_id)
    except Exception:
        return None


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Strict authentication dependency rejecting unauthorized requests."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found")
    return user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest):
    """Register a new researcher account using email and password with immediate JWT issuance."""
    existing = db.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    hashed_pw = hash_password(payload.password)
    user = db.create_user(
        email=payload.email,
        hashed_password=hashed_pw,
        full_name=payload.full_name,
        organization=payload.organization,
    )
    return _build_token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest):
    """Authenticate using email and password and return a signed JWT access token."""
    user = db.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _build_token_response(user)


@router.get("/me", response_model=UserProfile)
def get_me(current_user: dict = Depends(get_current_user)):
    """Fetch current authenticated user profile."""
    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user.get("full_name"),
        organization=current_user.get("organization"),
        created_at=current_user["created_at"],
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest):
    """Reset user password directly using verified email and new compliant password."""
    user = db.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registered account found with this email address.",
        )

    hashed_pw = hash_password(payload.new_password)
    updated = db.update_user_password(payload.email, hashed_pw)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password. Please try again.",
        )

    return MessageResponse(
        message="Your password has been reset successfully. You can now sign in with your new password."
    )
