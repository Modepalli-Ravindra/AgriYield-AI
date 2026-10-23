"""Evaluate Baseline vs. Climate-Enhanced XGBoost model on identical chronological test split."""
from __future__ import annotations

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import TransformedTargetRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.ml.conformal import ConformalPredictionCalibrator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RESULTS_DIR = BASE_DIR / "experiments" / "climate_enhanced_experiments" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def train_and_eval_pipeline(
    X_train: pd.DataFrame,
    y_train: np.ndarray,
    X_calib: pd.DataFrame,
    y_calib: np.ndarray,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    cat_cols: List[str],
    num_cols: List[str],
    model_name: str
) -> Dict[str, Any]:
    """Train Log1p XGBoost model and evaluate with crop-conditional conformal prediction."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
            ("num", StandardScaler(), num_cols)
        ]
    )

    xgb_inner = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )

    model = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", TransformedTargetRegressor(
            regressor=xgb_inner,
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ])

    logger.info("Fitting %s...", model_name)
    model.fit(X_train, y_train)

    # Predictions in hg/ha and tonnes/ha
    y_test_pred_hg = np.maximum(0.0, model.predict(X_test))
    y_calib_pred_hg = np.maximum(0.0, model.predict(X_calib))

    y_test_t = y_test / 10000.0
    y_test_pred_t = y_test_pred_hg / 10000.0

    r2 = float(r2_score(y_test_t, y_test_pred_t))
    mae_t = float(mean_absolute_error(y_test_t, y_test_pred_t))
    rmse_t = float(np.sqrt(mean_squared_error(y_test_t, y_test_pred_t)))

    mae_hg = float(mean_absolute_error(y_test, y_test_pred_hg))
    rmse_hg = float(np.sqrt(mean_squared_error(y_test, y_test_pred_hg)))

    # Calibrate conformal intervals
    calibrator = ConformalPredictionCalibrator(nominal_coverage=0.90)
    calibrator.fit(y_true_hg=y_calib, y_pred_hg=y_calib_pred_hg)

    # Compute crop-conditional quantiles on calibration residuals
    y_calib_t = y_calib / 10000.0
    y_pred_calib_t = y_calib_pred_hg / 10000.0
    resids = np.abs(y_calib_t - y_pred_calib_t)
    crops_calib = X_calib["Item"].values
    calibrator.crop_quantiles = {}
    for crop in np.unique(crops_calib):
        mask = (crops_calib == crop)
        c_res = resids[mask]
        n_c = len(c_res)
        p_c = min(1.0, max(0.0, np.ceil((n_c + 1) * 0.90) / n_c))
        calibrator.crop_quantiles[crop] = float(np.quantile(c_res, p_c))
    calibrator.group_max_quantile_q = max(calibrator.crop_quantiles.values())

    # Evaluate test intervals
    covered = []
    widths = []
    for actual_t, pred_t, crop in zip(y_test_t, y_test_pred_t, X_test["Item"].tolist()):
        ci = calibrator.predict_interval(pred_t, crop=crop)
        covered.append(ci["lower_bound"] <= actual_t <= ci["upper_bound"])
        widths.append(ci["interval_width_tonnes"])

    emp_cov = float(np.mean(covered))
    mean_width = float(np.mean(widths))

    logger.info("%s Test Results: R2=%.4f, MAE=%.4f t/ha, RMSE=%.4f t/ha, Cov=%.2f%%, Width=%.2f t/ha",
                model_name, r2, mae_t, rmse_t, emp_cov * 100, mean_width)

    return {
        "model_name": model_name,
        "r2": round(r2, 4),
        "mae_tonnes": round(mae_t, 4),
        "rmse_tonnes": round(rmse_t, 4),
        "mae_hg": round(mae_hg, 1),
        "rmse_hg": round(rmse_hg, 1),
        "conformal_empirical_coverage": round(emp_cov, 4),
        "mean_interval_width_tonnes": round(mean_width, 4),
        "y_test_pred_t": y_test_pred_t
    }


def run_experiment():
    dataset_path = BASE_DIR / "experiments" / "climate_enhanced_experiments" / "data" / "yield_df_climate_enhanced.csv"
    if not dataset_path.exists():
        raise FileNotFoundError(f"Enhanced dataset not found: {dataset_path}")

    df = pd.read_csv(dataset_path)

    # Chronological splits (strictly disjoint)
    train_mask = (df["Year"] >= 1990) & (df["Year"] <= 2013)
    calib_mask = (df["Year"] >= 2014) & (df["Year"] <= 2018)
    test_mask = (df["Year"] >= 2019) & (df["Year"] <= 2024)

    df_train = df[train_mask].copy()
    df_calib = df[calib_mask].copy()
    df_test = df[test_mask].copy()

    y_train = df_train["hg/ha_yield"].values
    y_calib = df_calib["hg/ha_yield"].values
    y_test = df_test["hg/ha_yield"].values

    # 1. Baseline Model (Legacy Features: static rainfall and national temp)
    baseline_cat = ["Area", "Item"]
    baseline_num = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]

    res_baseline = train_and_eval_pipeline(
        X_train=df_train[baseline_cat + baseline_num],
        y_train=y_train,
        X_calib=df_calib[baseline_cat + baseline_num],
        y_calib=y_calib,
        X_test=df_test[baseline_cat + baseline_num],
        y_test=y_test,
        cat_cols=baseline_cat,
        num_cols=baseline_num,
        model_name="Baseline (Static AQUASTAT Rain)"
    )

    # 2. Climate-Enhanced Model (Measured ERA5-Land Climate Features)
    enhanced_cat = ["Area", "Item"]
    enhanced_num = [
        "Year", "pesticides_tonnes",
        "effective_precip_mm", "effective_temp_c",
        "growing_season_precip_mm", "growing_season_temp_c",
        "heat_stress_days_above_30c", "dry_spell_max_days"
    ]
    # Impute missing growing season features with column means for un-ingested legacy years
    for col in ["growing_season_precip_mm", "growing_season_temp_c", "heat_stress_days_above_30c", "dry_spell_max_days"]:
        mean_val = float(df_train[col].dropna().mean()) if not df_train[col].dropna().empty else 0.0
        df_train[col] = df_train[col].fillna(mean_val)
        df_calib[col] = df_calib[col].fillna(mean_val)
        df_test[col] = df_test[col].fillna(mean_val)

    res_enhanced = train_and_eval_pipeline(
        X_train=df_train[enhanced_cat + enhanced_num],
        y_train=y_train,
        X_calib=df_calib[enhanced_cat + enhanced_num],
        y_calib=y_calib,
        X_test=df_test[enhanced_cat + enhanced_num],
        y_test=y_test,
        cat_cols=enhanced_cat,
        num_cols=enhanced_num,
        model_name="Climate-Enhanced (Measured ERA5-Land)"
    )

    # 3. Sub-analysis on Climate-Covered Test Records (where genuine climate data exists)
    climate_covered_mask = df_test["has_genuine_climate"].values
    y_test_t = y_test / 10000.0
    
    sub_y_test = y_test_t[climate_covered_mask]
    sub_pred_base = res_baseline["y_test_pred_t"][climate_covered_mask]
    sub_pred_enh = res_enhanced["y_test_pred_t"][climate_covered_mask]

    r2_base_sub = float(r2_score(sub_y_test, sub_pred_base))
    r2_enh_sub = float(r2_score(sub_y_test, sub_pred_enh))
    mae_base_sub = float(mean_absolute_error(sub_y_test, sub_pred_base))
    mae_enh_sub = float(mean_absolute_error(sub_y_test, sub_pred_enh))
    rmse_base_sub = float(np.sqrt(mean_squared_error(sub_y_test, sub_pred_base)))
    rmse_enh_sub = float(np.sqrt(mean_squared_error(sub_y_test, sub_pred_enh)))

    logger.info("--- Subset with Genuine Climate Data (N=%d) ---", len(sub_y_test))
    logger.info("Baseline:  R2=%.4f, MAE=%.4f, RMSE=%.4f", r2_base_sub, mae_base_sub, rmse_base_sub)
    logger.info("Enhanced:  R2=%.4f, MAE=%.4f, RMSE=%.4f", r2_enh_sub, mae_enh_sub, rmse_enh_sub)

    # Per-crop performance on climate-covered subset
    df_sub = df_test[climate_covered_mask].copy()
    df_sub["actual_t"] = sub_y_test
    df_sub["pred_base_t"] = sub_pred_base
    df_sub["pred_enh_t"] = sub_pred_enh

    crop_breakdown = {}
    for crop, grp in df_sub.groupby("Item"):
        if len(grp) >= 10:
            c_r2_b = float(r2_score(grp["actual_t"], grp["pred_base_t"])) if len(grp) > 1 else 0.0
            c_r2_e = float(r2_score(grp["actual_t"], grp["pred_enh_t"])) if len(grp) > 1 else 0.0
            c_mae_b = float(mean_absolute_error(grp["actual_t"], grp["pred_base_t"]))
            c_mae_e = float(mean_absolute_error(grp["actual_t"], grp["pred_enh_t"]))
            crop_breakdown[crop] = {
                "sample_count": len(grp),
                "baseline_r2": round(c_r2_b, 4),
                "enhanced_r2": round(c_r2_e, 4),
                "baseline_mae_t": round(c_mae_b, 4),
                "enhanced_mae_t": round(c_mae_e, 4),
                "mae_improvement_pct": round(((c_mae_b - c_mae_e) / c_mae_b) * 100, 2) if c_mae_b > 0 else 0.0
            }

    # Per-country performance
    country_breakdown = {}
    for country, grp in df_sub.groupby("Area"):
        c_mae_b = float(mean_absolute_error(grp["actual_t"], grp["pred_base_t"]))
        c_mae_e = float(mean_absolute_error(grp["actual_t"], grp["pred_enh_t"]))
        c_r2_b = float(r2_score(grp["actual_t"], grp["pred_base_t"])) if len(grp) > 2 else 0.0
        c_r2_e = float(r2_score(grp["actual_t"], grp["pred_enh_t"])) if len(grp) > 2 else 0.0
        country_breakdown[country] = {
            "sample_count": len(grp),
            "baseline_mae_t": round(c_mae_b, 4),
            "enhanced_mae_t": round(c_mae_e, 4),
            "mae_improvement_pct": round(((c_mae_b - c_mae_e) / c_mae_b) * 100, 2) if c_mae_b > 0 else 0.0,
            "baseline_r2": round(c_r2_b, 4),
            "enhanced_r2": round(c_r2_e, 4)
        }

    # Clean predictions from serializing dict
    del res_baseline["y_test_pred_t"]
    del res_enhanced["y_test_pred_t"]

    results_summary = {
        "evaluation_protocol": "Disjoint Chronological Split (Train: 1990-2013, Calib: 2014-2018, Test: 2019-2024)",
        "full_test_metrics": {
            "sample_count": len(df_test),
            "baseline_model": res_baseline,
            "climate_enhanced_model": res_enhanced,
            "overall_delta_mae_t": round(res_enhanced["mae_tonnes"] - res_baseline["mae_tonnes"], 4),
            "overall_delta_r2": round(res_enhanced["r2"] - res_baseline["r2"], 4)
        },
        "climate_covered_subset_metrics": {
            "sample_count": len(sub_y_test),
            "baseline": {
                "r2": round(r2_base_sub, 4),
                "mae_tonnes": round(mae_base_sub, 4),
                "rmse_tonnes": round(rmse_base_sub, 4)
            },
            "enhanced": {
                "r2": round(r2_enh_sub, 4),
                "mae_tonnes": round(mae_enh_sub, 4),
                "rmse_tonnes": round(rmse_enh_sub, 4)
            },
            "mae_improvement_pct": round(((mae_base_sub - mae_enh_sub) / mae_base_sub) * 100, 2),
            "rmse_improvement_pct": round(((rmse_base_sub - rmse_enh_sub) / rmse_base_sub) * 100, 2)
        },
        "per_crop_breakdown": crop_breakdown,
        "per_country_breakdown": country_breakdown
    }

    out_json = RESULTS_DIR / "CLIMATE_MODEL_BENCHMARK_RESULTS.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)

    logger.info("Evaluation complete! Benchmark report saved to %s", out_json)
    return results_summary


if __name__ == "__main__":
    run_experiment()
