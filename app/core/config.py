"""Core configuration settings for Crop Yield Prediction Research Platform."""
from __future__ import annotations

import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# Load .env file for InsForge PostgreSQL and production configuration
load_dotenv(BASE_DIR / ".env")

def _get_default_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS")
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    return [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

class Settings(BaseModel):
    PROJECT_NAME: str = "Terraflect — Crop Yield Intelligence Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-crop-yield-research-key-change-in-prod-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS (Strict origin list without wildcard to comply with W3C allow-credentials policy)
    CORS_ORIGINS: List[str] = Field(default_factory=_get_default_cors_origins)
    
    # Data & Model Paths
    DATA_PATH: Path = BASE_DIR / "data" / "yield_df.csv"
    MODELS_DIR: Path = BASE_DIR / "models"
    MODEL_PATH: Path = BASE_DIR / "models" / "crop_yield_model.pkl"
    METADATA_PATH: Path = BASE_DIR / "models" / "model_metadata.pkl"
    DL_MODEL_PATH: Path = BASE_DIR / "models" / "dl_mlp_model.pt"
    CONFORMAL_PATH: Path = BASE_DIR / "models" / "conformal_calibrator.pkl"
    
    # Database (InsForge PostgreSQL or Local SQLite fallback)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'crop_yield_platform.db'}"
    )

settings = Settings()
