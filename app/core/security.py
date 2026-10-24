"""Security utilities: Argon2id password hashing and JWT access token handling with resilient fallbacks."""
from __future__ import annotations

import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import importlib
import json
import logging
import os
import secrets
from typing import Any, Dict, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

logger = logging.getLogger(__name__)

# Try Argon2 dynamically to avoid static analyzer unresolved-import errors
_hasher = None
HAS_ARGON2 = False
try:
    _argon2_mod = importlib.import_module("argon2")
    _hasher = _argon2_mod.PasswordHasher(
        time_cost=3,
        memory_cost=65536,
        parallelism=4,
        hash_len=32,
        type=getattr(_argon2_mod.Type, "ID", 2)
    )
    HAS_ARGON2 = True
except (ImportError, Exception):
    logger.info("argon2-cffi not installed; using standard pbkdf2_hmac password hashing fallback.")

# Try python-jose dynamically
jwt = None
HAS_JOSE = False
try:
    _jose_mod = importlib.import_module("jose")
    jwt = getattr(_jose_mod, "jwt", None)
    JWTError = getattr(_jose_mod, "JWTError", Exception)
    HAS_JOSE = jwt is not None
except (ImportError, Exception):
    class JWTError(Exception):
        pass
    logger.info("python-jose not installed; using standard hmac/sha256 JWT fallback.")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def hash_password(password: str) -> str:
    """Hash password using Argon2id, falling back to PBKDF2-HMAC-SHA256."""
    if HAS_ARGON2 and _hasher is not None:
        return _hasher.hash(password)
    
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"pbkdf2:sha256:100000${salt}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash (Argon2id, PBKDF2, or passlib fallback)."""
    if hashed_password.startswith("pbkdf2:sha256:"):
        try:
            parts = hashed_password.split("$")
            if len(parts) == 3:
                salt, expected_hex = parts[1], parts[2]
                dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000)
                return hmac.compare_digest(dk.hex(), expected_hex)
        except Exception:
            return False

    if HAS_ARGON2 and _hasher is not None:
        try:
            return _hasher.verify(hashed_password, plain_password)
        except Exception:
            pass

    # Fallback check for bcrypt/pbkdf2 if legacy hash encountered
    try:
        _passlib_mod = importlib.import_module("passlib.context")
        _CryptContext = getattr(_passlib_mod, "CryptContext")
        pwd_context = _CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64url_decode(data_str: str) -> bytes:
    padding = "=" * (-len(data_str) % 4)
    return base64.urlsafe_b64decode(data_str + padding)

def create_access_token(subject: str | Any, extra_claims: Optional[Dict[str, Any]] = None, expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp())
    }
    if extra_claims:
        to_encode.update(extra_claims)
    
    if HAS_JOSE and jwt is not None:
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    # Resilient standard library HMAC-SHA256 JWT
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(to_encode, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(settings.JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT access token."""
    if HAS_JOSE and jwt is not None:
        try:
            return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired credentials: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Resilient standard library decode
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Token must have 3 segments")
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(settings.JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Signature verification failed")
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            raise ValueError("Token has expired")
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
