"""FastAPI Application Entrypoint for Research-Grade Crop Yield Platform."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.api import api_router
from app.services.prediction_service import prediction_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("crop_yield_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan lifecycle: load model artifacts and reference datasets."""
    logger.info("Initializing %s v%s", settings.PROJECT_NAME, settings.VERSION)
    prediction_service._load_artifacts()
    yield
    logger.info("Shutting down %s", settings.PROJECT_NAME)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors with Uncertainty Estimation and Robustness Evaluation.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount primary API router under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)
# Mount also without prefix for backward compatibility with existing tests/clients
app.include_router(api_router, prefix="")

@app.get("/health", tags=["System Status"])
def health_check():
    """System health check and loaded artifact status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model_loaded": prediction_service.model is not None,
        "metadata_loaded": prediction_service.metadata is not None,
        "reference_data_loaded": prediction_service.ref_data is not None,
        "conformal_calibrator_loaded": prediction_service.conformal_calibrator is not None and prediction_service.conformal_calibrator.quantile_q is not None,
        "ref_data_rows": len(prediction_service.ref_data) if prediction_service.ref_data is not None else 0,
        "test_r2": prediction_service.metadata.get("test_r2", 0.0) if prediction_service.metadata else 0.0
    }

@app.get("/", tags=["System Status"])
def root():
    """Root redirect / welcoming endpoint."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "documentation": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
