"""Robustness testing and model comparison schemas."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class DegradationPoint(BaseModel):
    rate: float
    mae_tonnes_per_ha: float
    rmse_tonnes_per_ha: float
    r2_score: float
    error_inflation_pct: float

class StressTestResult(BaseModel):
    test_type: str  # "mcar_missingness" | "mar_missingness" | "gaussian_noise" | "climate_shock"
    model_name: str
    baseline_rmse_tonnes: float
    baseline_mae_tonnes: float
    degradation_curve: List[DegradationPoint]
    breakdown_threshold_rate: float
    scientific_summary: str

class ModelBenchmarkMetric(BaseModel):
    model_name: str
    model_family: str  # "ML Baseline" | "Deep Learning" | "Stacking Ensemble"
    r2_random_split: float
    rmse_random_split_tonnes: float
    mae_random_split_tonnes: float
    r2_temporal_split: float
    rmse_temporal_split_tonnes: float
    mae_temporal_split_tonnes: float
    training_time_seconds: float
    parameter_count: int

class ModelComparisonResponse(BaseModel):
    dataset_version: str
    total_samples: int
    train_samples: int
    test_samples: int
    models: List[ModelBenchmarkMetric]
    best_overall_model: str
    dl_vs_ml_empirical_gain: str
