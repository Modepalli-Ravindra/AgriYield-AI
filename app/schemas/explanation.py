"""XAI, Sensitivity, and What-If comparison schemas."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.prediction import YieldInput

class FeatureContribution(BaseModel):
    feature: str
    shap_value: float
    impact: str  # "positive" | "negative" | "neutral"
    percentage_contribution: float

class ExplainResponse(BaseModel):
    prediction_tonnes_per_ha: float
    base_value: float
    feature_contributions: List[FeatureContribution]
    summary_text: str

class SensitivityRequest(BaseModel):
    input_data: YieldInput
    parameter: str = Field(..., description="Parameter to vary: rainfall_mm, avg_temp_c, pesticides_tonnes, year")
    points: int = Field(default=15, ge=5, le=50)

class SensitivityResponse(BaseModel):
    parameter: str
    values: List[float]
    predictions_tonnes_per_ha: List[float]
    baseline_value: float
    baseline_prediction_tonnes_per_ha: float
    elasticity_summary: str

class WhatIfScenario(BaseModel):
    scenario_name: str
    inputs: YieldInput

class WhatIfRequest(BaseModel):
    scenarios: List[WhatIfScenario] = Field(..., min_length=2)

class WhatIfResponse(BaseModel):
    baseline_scenario: str
    comparisons: List[Dict[str, Any]]
