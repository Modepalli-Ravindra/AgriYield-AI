"""Prediction and reference options Pydantic schemas."""
from __future__ import annotations

import math
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, ValidationInfo

class YieldInput(BaseModel):
    country: str = Field(..., description="Reporting country or territory", min_length=1)
    crop: str = Field(..., description="Crop type (e.g. Wheat, Maize, Potatoes)", min_length=1)
    year: int = Field(default=2013, ge=1900, le=2100, description="Crop harvest observation year")
    rainfall_mm: float = Field(..., ge=0.0, le=12000.0, description="Annual aggregate precipitation in mm")
    avg_temp_c: float = Field(..., ge=-50.0, le=60.0, description="Average annual temperature in Celsius")
    pesticides_tonnes: float = Field(default=100.0, ge=0.0, le=1000000.0, description="Pesticide application in metric tonnes")

    @field_validator("rainfall_mm", "avg_temp_c", "pesticides_tonnes")
    @classmethod
    def validate_finite_numbers(cls, v: float, info: ValidationInfo) -> float:
        if v is None or math.isnan(v) or math.isinf(v):
            raise ValueError(f"Field '{info.field_name}' must be a finite real number; received malformed/non-finite value: {v}")
        return v

    @field_validator("country", "crop")
    @classmethod
    def validate_non_empty_strings(cls, v: str, info: ValidationInfo) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError(f"Field '{info.field_name}' must be a non-empty string.")
        return v.strip()

class ConfidenceInterval(BaseModel):
    lower: float
    upper: float
    mean: float
    std: float

class ConformalInterval(BaseModel):
    lower_bound: float
    upper_bound: float
    interval_width_tonnes: float = 0.0
    nominal_coverage: float = 0.90
    calibrated_margin_q: float = 0.0
    calibration_crop: Optional[str] = None
    method: str = "Crop-Conditional Conformal Quantile Calibration"
    unit: str = "tonnes/ha"
    climate_shift_safeguard_active: bool = False
    coverage_disclaimer: str = (
        "Reported 90% coverage is marginal across eligible groups; "
        "does not guarantee 90% on every individual crop or future distribution shift."
    )

class PredictionResponse(BaseModel):
    predicted_yield_hg_per_ha: float
    predicted_yield_tonnes_per_ha: float
    model_name: str
    deployed_estimator: str = "xgboost.sklearn.XGBRegressor"
    model_test_r2: float
    model_test_rmse_hg_ha: float
    confidence_interval: ConfidenceInterval
    conformal_interval_90: ConformalInterval
    shap_values: Optional[List[float]] = None
    feature_names: Optional[List[str]] = None
    base_value: Optional[float] = None
    attribution_method: str = "Exact TreeSHAP (shap.TreeExplainer)"
    climate_shift_detected: bool = False
    climate_anomaly_z: Optional[float] = None
    regional_climate_baseline: Optional[Dict[str, Any]] = None
    regional_reliability_tier: str = "High Confidence (Nominal Climatology)"
    used_pilot_model: bool = False
    has_authentic_climate: bool = False
    climate_coverage_status: str = "FAO National Climatology Fallback"
    climate_features_used: Optional[Dict[str, Any]] = None
    warnings: List[str] = Field(default_factory=list, description="Advisory data validation and distribution shift warnings")
    timestamp: str

class BatchPredictionRequest(BaseModel):
    items: List[YieldInput] = Field(..., min_length=1, max_length=500, description="Batch list of crop yield inputs (max 500)")

class BatchPredictionResponse(BaseModel):
    count: int
    predictions: List[PredictionResponse]

class OptionsResponse(BaseModel):
    countries: List[str]
    crops: List[str]
    year_range: Dict[str, int]
    default_input: Dict[str, Any]

class RegionalReliabilityResponse(BaseModel):
    country: str
    rainfall_baseline_mm: float
    temp_mean_c: float
    temp_std_c: float
    supported_crops: List[str]
    records_count: int
    historical_years: List[int]
    climatology_type: str
    reliability_tier: str
    coverage_disclaimer: str

