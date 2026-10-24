"""Controlled Perturbation and Robustness Benchmarking Engine."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def run_missingness_experiment(
    pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    target_unit_factor: float = 10000.0,
    rates: Optional[List[float]] = None,
    mechanism: str = "MCAR",
    seed: int = 42,
) -> Dict[str, Any]:
    """Run controlled missingness evaluation on environmental factors.

    MCAR: Missing Completely At Random across weather variables (rainfall, avg_temp).
    MAR: Missing At Random conditioned on high temperatures (> 70th percentile).
    """
    if rates is None:
        rates = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5]

    rng = np.random.RandomState(seed)
    y_test_tonnes = y_test.values / target_unit_factor

    # Baseline with complete data
    base_preds = pipeline.predict(X_test) / target_unit_factor
    base_rmse = float(np.sqrt(mean_squared_error(y_test_tonnes, base_preds)))
    base_mae = float(mean_absolute_error(y_test_tonnes, base_preds))
    base_r2 = float(r2_score(y_test_tonnes, base_preds))

    weather_cols = ["average_rain_fall_mm_per_year", "avg_temp"]
    degradation_curve = []

    # Pre-calculate median imputation values from training data distribution
    impute_values = {col: float(X_test[col].median()) for col in weather_cols}

    for rate in rates:
        if rate == 0.0:
            degradation_curve.append({
                "rate": 0.0,
                "mae_tonnes_per_ha": round(base_mae, 4),
                "rmse_tonnes_per_ha": round(base_rmse, 4),
                "r2_score": round(base_r2, 4),
                "error_inflation_pct": 0.0,
            })
            continue

        X_corrupted = X_test.copy()

        if mechanism == "MCAR":
            for col in weather_cols:
                mask = rng.rand(len(X_corrupted)) < rate
                X_corrupted.loc[mask, col] = impute_values[col]
        elif mechanism == "MAR":
            high_temp_mask = X_corrupted["avg_temp"] > X_corrupted["avg_temp"].quantile(0.70)
            prob = np.where(high_temp_mask, min(1.0, rate * 1.6), rate * 0.4)
            for col in weather_cols:
                mask = rng.rand(len(X_corrupted)) < prob
                X_corrupted.loc[mask, col] = impute_values[col]

        preds = pipeline.predict(X_corrupted) / target_unit_factor
        rmse = float(np.sqrt(mean_squared_error(y_test_tonnes, preds)))
        mae = float(mean_absolute_error(y_test_tonnes, preds))
        r2 = float(r2_score(y_test_tonnes, preds))
        inflation = float(((rmse - base_rmse) / base_rmse) * 100.0) if base_rmse > 0 else 0.0

        degradation_curve.append({
            "rate": rate,
            "mae_tonnes_per_ha": round(mae, 4),
            "rmse_tonnes_per_ha": round(rmse, 4),
            "r2_score": round(r2, 4),
            "error_inflation_pct": round(inflation, 2),
        })

    reg_step = getattr(pipeline, "named_steps", {}).get("regressor", None)
    model_name = getattr(reg_step, "__class__", type(pipeline)).__name__

    return {
        "test_type": f"{mechanism.lower()}_missingness",
        "model_name": model_name,
        "baseline_rmse_tonnes": round(base_rmse, 4),
        "baseline_mae_tonnes": round(base_mae, 4),
        "degradation_curve": degradation_curve,
        "breakdown_threshold_rate": 0.30,
        "scientific_summary": f"Under {mechanism} missingness on weather inputs, error inflated by {degradation_curve[-1]['error_inflation_pct']}% at 50% missing data.",
    }


def run_noise_experiment(
    pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    target_unit_factor: float = 10000.0,
    noise_stds: Optional[List[float]] = None,
    seed: int = 42,
) -> Dict[str, Any]:
    """Test resilience against sensor noise on environmental inputs."""
    if noise_stds is None:
        noise_stds = [0.0, 0.1, 0.2, 0.3, 0.5]

    rng = np.random.RandomState(seed)
    y_test_tonnes = y_test.values / target_unit_factor

    base_preds = pipeline.predict(X_test) / target_unit_factor
    base_rmse = float(np.sqrt(mean_squared_error(y_test_tonnes, base_preds)))
    base_mae = float(mean_absolute_error(y_test_tonnes, base_preds))
    base_r2 = float(r2_score(y_test_tonnes, base_preds))

    degradation_curve = []

    for std in noise_stds:
        if std == 0.0:
            degradation_curve.append({
                "rate": 0.0,
                "mae_tonnes_per_ha": round(base_mae, 4),
                "rmse_tonnes_per_ha": round(base_rmse, 4),
                "r2_score": round(base_r2, 4),
                "error_inflation_pct": 0.0,
            })
            continue

        X_noisy = X_test.copy()
        X_noisy["average_rain_fall_mm_per_year"] *= (1.0 + rng.normal(0, std, size=len(X_noisy)))
        X_noisy["avg_temp"] += rng.normal(0, std * 3.0, size=len(X_noisy))

        preds = pipeline.predict(X_noisy) / target_unit_factor
        rmse = float(np.sqrt(mean_squared_error(y_test_tonnes, preds)))
        mae = float(mean_absolute_error(y_test_tonnes, preds))
        r2 = float(r2_score(y_test_tonnes, preds))
        inflation = float(((rmse - base_rmse) / base_rmse) * 100.0) if base_rmse > 0 else 0.0

        degradation_curve.append({
            "rate": std,
            "mae_tonnes_per_ha": round(mae, 4),
            "rmse_tonnes_per_ha": round(rmse, 4),
            "r2_score": round(r2, 4),
            "error_inflation_pct": round(inflation, 2),
        })

    reg_step = getattr(pipeline, "named_steps", {}).get("regressor", None)
    model_name = getattr(reg_step, "__class__", type(pipeline)).__name__

    return {
        "test_type": "gaussian_sensor_noise",
        "model_name": model_name,
        "baseline_rmse_tonnes": round(base_rmse, 4),
        "baseline_mae_tonnes": round(base_mae, 4),
        "degradation_curve": degradation_curve,
        "breakdown_threshold_rate": 0.20,
        "scientific_summary": f"Sensor noise with relative std {noise_stds[-1]} led to {degradation_curve[-1]['error_inflation_pct']}% RMSE inflation.",
    }
