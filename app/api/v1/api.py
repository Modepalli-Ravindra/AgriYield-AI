"""API v1 router aggregator."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    predict,
    explain,
    models_compare,
    robustness,
    history
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication (Zero-OTP)"])
api_router.include_router(predict.router, prefix="", tags=["Predictions & Options"])
api_router.include_router(explain.router, prefix="", tags=["Explainability & What-If"])
api_router.include_router(models_compare.router, prefix="/models", tags=["Model Comparisons"])
api_router.include_router(robustness.router, prefix="/robustness", tags=["Robustness Benchmarking"])
api_router.include_router(history.router, prefix="", tags=["Prediction History (Protected)"])
