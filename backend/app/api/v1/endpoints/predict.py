"""Prediction endpoints for crop yield modeling and options."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.v1.endpoints.auth import get_current_user_optional
from app.schemas.prediction import (
    YieldInput, 
    PredictionResponse, 
    BatchPredictionRequest, 
    BatchPredictionResponse, 
    OptionsResponse,
    RegionalReliabilityResponse
)
from app.services.prediction_service import prediction_service

router = APIRouter()

@router.get("/options", response_model=OptionsResponse)
def get_options():
    """Retrieve supported countries, crop species, and default environmental values."""
    return prediction_service.get_options()

@router.post("/predict", response_model=PredictionResponse)
def predict_crop_yield(
    payload: YieldInput,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Predict crop yield from environmental factors using DL-ML Ensemble.
    Returns point estimate, nominal 90% conformal prediction interval, and SHAP impacts.
    """
    if prediction_service.model is None:
        raise HTTPException(status_code=503, detail="Prediction service unavailable: model artifact is not loaded.")
    try:
        user_id = current_user["id"] if current_user else None
        return prediction_service.predict(payload, user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/predict/batch", response_model=BatchPredictionResponse)
def batch_predict(
    payload: BatchPredictionRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Batch prediction across multiple scenarios or regional zones."""
    if prediction_service.model is None:
        raise HTTPException(status_code=503, detail="Prediction service unavailable: model artifact is not loaded.")
    user_id = current_user["id"] if current_user else None
    predictions = [prediction_service.predict(item, user_id=user_id) for item in payload.items]
    return BatchPredictionResponse(count=len(predictions), predictions=predictions)

@router.get("/reference-data")
def get_reference_data(limit: int = Query(default=20, ge=1, le=100)):
    """Return reference sample rows and summary statistics from the clean FAOSTAT dataset."""
    if prediction_service.ref_data is None:
        raise HTTPException(status_code=404, detail="Reference dataset not loaded.")
        
    df = prediction_service.ref_data
    sample = df.head(limit).to_dict(orient="records")
    summary = {
        "total_records": len(df),
        "total_countries": int(df["Area"].nunique()),
        "total_crops": int(df["Item"].nunique()),
        "year_min": int(df["Year"].min()),
        "year_max": int(df["Year"].max()),
        "mean_yield_tonnes": round(float(df["hg/ha_yield"].mean()) / 10000.0, 3),
        "mean_rainfall_mm": round(float(df["average_rain_fall_mm_per_year"].mean()), 1),
        "mean_temp_c": round(float(df["avg_temp"].mean()), 1)
    }
    return {"summary": summary, "sample_records": sample}
 
@router.get("/regional-reliability/{country}", response_model=RegionalReliabilityResponse)
def get_regional_reliability(country: str):
    """Retrieve verified regional climatology baselines, supported crops, and reliability tier."""
    profile = prediction_service.get_regional_profile(country)
    if profile is None:
        raise HTTPException(
            status_code=404, 
            detail=f"Country '{country}' not found in Terraflect historical database."
        )
    return profile


from app.services.weather_service import WeatherService

@router.get("/climate/live")
def get_live_climate(
    country: str = Query(..., description="Country name"),
    year: int = Query(default=2026, description="Forecast target year")
):
    """Retrieve authentic live and seasonal climate parameters from Open-Meteo API."""
    return WeatherService.get_live_climate(country=country, target_year=year)


