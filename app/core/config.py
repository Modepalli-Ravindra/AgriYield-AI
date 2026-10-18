"""Core configuration settings for Crop Yield Prediction Research Platform."""
from __future__ import annotations

import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "AI-Driven DL-ML Crop Yield Research Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-crop-yield-research-key-change-in-prod-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
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
