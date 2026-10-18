"""Prediction and reference options Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class YieldInput(BaseModel):
    country: str = Field(..., description="Reporting country or territory", min_length=1)
    crop: str = Field(..., description="Crop type (e.g. Wheat, Maize, Potatoes)", min_length=1)
    year: int = Field(default=2013, ge=1960, le=2050, description="Crop harvest observation year")
    rainfall_mm: float = Field(..., ge=0.0, le=12000.0, description="Annual aggregate precipitation in mm")
    avg_temp_c: float = Field(..., ge=-30.0, le=60.0, description="Average annual temperature in Celsius")
    pesticides_tonnes: float = Field(default=100.0, ge=0.0, le=1000000.0, description="Pesticide application in metric tonnes")

class ConfidenceInterval(BaseModel):
    lower: float
    upper: float
    mean: float
    std: float

class ConformalInterval(BaseModel):
    lower_bound: float
    upper_bound: float
    nominal_coverage: float = 0.90
    method: str = "Conformalized Quantile Regression (CQR)"
    unit: str = "tonnes/ha"

class PredictionResponse(BaseModel):
    predicted_yield_hg_per_ha: float
    predicted_yield_tonnes_per_ha: float
    model_name: str
    model_test_r2: float
    model_test_rmse_hg_ha: float
    confidence_interval: ConfidenceInterval
    conformal_interval_90: ConformalInterval
    shap_values: Optional[List[float]] = None
    feature_names: Optional[List[str]] = None
    base_value: Optional[float] = None
    timestamp: str

class BatchPredictionRequest(BaseModel):
    items: List[YieldInput]

class BatchPredictionResponse(BaseModel):
    count: int
    predictions: List[PredictionResponse]

class OptionsResponse(BaseModel):
    countries: List[str]
    crops: List[str]
    year_range: Dict[str, int]
    default_input: Dict[str, Any]
