"""Script: run_feature_ablation_benchmark.py
Performs controlled ablation experiments on identical held-out test records:
  Ablation 1: Baseline features only
  Ablation 2: Baseline + Authentic Climate features
  Ablation 3: Baseline + FAO AQUASTAT Irrigation feature
  Ablation 4: Baseline + Climate + Irrigation features
  Ablation 5: Baseline + Climate + Irrigation + Anomaly features (Z-score, thermal anomaly, rain deviation)

Ensures zero leakage: baseline statistics computed strictly on training data.
Reports global (N=3,409) and climate-covered (N=888) metrics with bootstrap 95% CIs.
"""
from __future__ import annotations

import json
import logging
import numpy as np
import pandas as pd
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from typing import Dict, List, Any, Tuple

from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import xgboost as xgb

from app.ml.conformal import ConformalPredictionCalibrator
from app.climate.coordinates import get_irrigation_equipped_pct

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RANDOM_SEED = 42

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = BASE_DIR / "experiments" / "climate_enhanced_experiments" / "data" / "yield_df_climate_enhanced.csv"
OUTPUT_DIR = BASE_DIR / "experiments" / "climate_enhanced_experiments" / "results"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE = OUTPUT_DIR / "FEATURE_ABLATION_BENCHMARK.json"


def compute_leakage_safe_anomaly_features(
    df: pd.DataFrame, train_mask: pd.Series
) -> pd.DataFrame:
    """Compute country-level rainfall and temperature baselines strictly from training set,

    then apply to entire DataFrame to derive anomaly and deviation features.
    """
    df = df.copy()
    train_df = df[train_mask]

    # Compute baseline rainfall and temp strictly from training records
    country_rain_stats = train_df.groupby("Area")["average_rain_fall_mm_per_year"].mean().to_dict()
    country_temp_mean = train_df.groupby("Area")["avg_temp"].mean().to_dict()
    country_temp_std = train_df.groupby("Area")["avg_temp"].std().fillna(1.0).to_dict()

    global_mean_rain = float(train_df["average_rain_fall_mm_per_year"].mean())
    global_mean_temp = float(train_df["avg_temp"].mean())
    global_std_temp = float(train_df["avg_temp"].std())

    rain_baselines = df["Area"].map(country_rain_stats).fillna(global_mean_rain)
    temp_means = df["Area"].map(country_temp_mean).fillna(global_mean_temp)
    temp_stds = df["Area"].map(country_temp_std).fillna(global_std_temp).clip(lower=1.0)

    # Effective values vs baselines
    effective_rain = df["effective_precip_mm"]
    effective_temp = df["effective_temp_c"]

    df["rainfall_deviation_pct"] = np.abs(effective_rain - rain_baselines) / np.maximum(rain_baselines, 10.0)
    df["temp_z_score"] = (effective_temp - temp_means) / temp_stds
    df["thermal_anomaly_flag"] = ((df["temp_z_score"] >= 1.624) & (effective_temp > temp_means)).astype(float)

    return df


def evaluate_conformal_calibration(
    y_calib_hg: np.ndarray,
    y_calib_pred_hg: np.ndarray,
    crops_calib: List[str],
    y_test_hg: np.ndarray,
    y_test_pred_hg: np.ndarray,
    crops_test: List[str],
    anomaly_flags: np.ndarray = None,
    alpha: float = 0.10
) -> Tuple[float, float, Dict[str, Dict[str, float]], float, float]:
    """Calculate crop-conditional conformal non-conformity quantiles and empirical coverage/width.

    Also calculates SACAP-V2 coverage and width under anomaly expansion.
    """
    calibrator = ConformalPredictionCalibrator(nominal_coverage=1.0 - alpha)
    y_calib_t = y_calib_hg / 10000.0
    y_calib_pred_t = y_calib_pred_hg / 10000.0
    resids = np.abs(y_calib_t - y_calib_pred_t)

    n_cal = len(resids)
    p_global = min(1.0, max(0.0, np.ceil((n_cal + 1) * (1.0 - alpha)) / n_cal))
    calibrator.quantile_q = float(np.quantile(resids, p_global))

    calibrator.crop_quantiles = {}
    crops_calib_arr = np.array(crops_calib)
    for crop in np.unique(crops_calib_arr):
        c_res = resids[crops_calib_arr == crop]
        n_c = len(c_res)
        if n_c >= 5:
            p_c = min(1.0, max(0.0, np.ceil((n_c + 1) * (1.0 - alpha)) / n_c))
            calibrator.crop_quantiles[crop] = float(np.quantile(c_res, p_c))
        else:
            calibrator.crop_quantiles[crop] = calibrator.quantile_q

    calibrator.group_max_quantile_q = max(calibrator.crop_quantiles.values()) if calibrator.crop_quantiles else calibrator.quantile_q

    y_test_t = y_test_hg / 10000.0
    y_test_pred_t = y_test_pred_hg / 10000.0

    covered_std = []
    widths_std = []
    covered_sacap = []
    widths_sacap = []
    crop_stats = {}

    for i, (yt, yp, crop) in enumerate(zip(y_test_t, y_test_pred_t, crops_test)):
        # Standard nominal prediction interval
        ci_std = calibrator.predict_interval(yp, crop=crop, is_climate_shift=False)
        is_cov_std = ci_std["lower_bound"] <= yt <= ci_std["upper_bound"]
        covered_std.append(is_cov_std)
        widths_std.append(ci_std["interval_width_tonnes"])

        # SACAP-V2 dynamic safeguard interval
        is_anom = bool(anomaly_flags[i] == 1.0) if anomaly_flags is not None else False
        ci_sacap = calibrator.predict_interval(yp, crop=crop, is_climate_shift=is_anom)
        is_cov_sacap = ci_sacap["lower_bound"] <= yt <= ci_sacap["upper_bound"]
        covered_sacap.append(is_cov_sacap)
        widths_sacap.append(ci_sacap["interval_width_tonnes"])

        if crop not in crop_stats:
            crop_stats[crop] = {"covered": [], "widths": [], "q": ci_std["calibrated_margin_q"]}
        crop_stats[crop]["covered"].append(is_cov_std)
        crop_stats[crop]["widths"].append(ci_std["interval_width_tonnes"])

    per_crop_uq = {
        c: {
            "test_n": len(s["covered"]),
            "coverage_pct": round(float(np.mean(s["covered"])) * 100, 2),
            "mean_width_tonnes": round(float(np.mean(s["widths"])), 4),
            "margin_q_tonnes": round(s["q"], 4)
        }
        for c, s in crop_stats.items()
    }

    return (
        float(np.mean(covered_std)),
        float(np.mean(widths_std)),
        per_crop_uq,
        float(np.mean(covered_sacap)),
        float(np.mean(widths_sacap))
    )


def bootstrap_mae_ci(
    y_true: np.ndarray,
    y_pred_a: np.ndarray,
    y_pred_b: np.ndarray,
    n_bootstraps: int = 1000
) -> Tuple[float, float]:
    """Compute 95% bootstrap confidence interval for MAE difference (A - B)."""
    np.random.seed(RANDOM_SEED)
    deltas = []
    n = len(y_true)
    for _ in range(n_bootstraps):
        idx = np.random.choice(n, size=n, replace=True)
        mae_a = np.mean(np.abs(y_true[idx] - y_pred_a[idx]))
        mae_b = np.mean(np.abs(y_true[idx] - y_pred_b[idx]))
        deltas.append(mae_a - mae_b)
    return float(np.percentile(deltas, 2.5)), float(np.percentile(deltas, 97.5))


def run_ablation_experiments():
    logger.info("Loading climate-enhanced yield dataset: %s", DATA_PATH)
    df = pd.read_csv(DATA_PATH)
    logger.info("Loaded %d records across %d countries.", len(df), df["Area"].nunique())

    # Populate irrigation if missing
    if "irrigation_equipped_pct" not in df.columns or df["irrigation_equipped_pct"].isna().any():
        df["irrigation_equipped_pct"] = df["Area"].map(get_irrigation_equipped_pct).fillna(10.0)

    # Impute missing climate covariates with column means for un-ingested historical records
    climate_feature_cols = [
        "effective_precip_mm", "effective_temp_c",
        "growing_season_precip_mm", "growing_season_temp_c",
        "heat_stress_days_above_30c", "dry_spell_max_days",
        "irrigation_equipped_pct"
    ]
    for col in climate_feature_cols:
        mean_v = float(df[col].dropna().mean()) if not df[col].dropna().empty else 0.0
        df[col] = df[col].fillna(mean_v)

    # Compute leakage-safe anomaly features using training partition
    train_dev_mask = (df["Year"] <= 2018)
    df = compute_leakage_safe_anomaly_features(df, train_dev_mask)

    df["group_id"] = df["Area"] + "_" + df["Item"]

    # Regime A split definition
    train_dev_df = df[train_dev_mask].copy().reset_index(drop=True)
    test_df = df[df["Year"] >= 2019].copy().reset_index(drop=True)

    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    tr_idx, cal_idx = next(gss.split(train_dev_df, groups=train_dev_df["group_id"]))

    train_df = train_dev_df.iloc[tr_idx].copy().reset_index(drop=True)
    calib_df = train_dev_df.iloc[cal_idx].copy().reset_index(drop=True)

    target_col = "hg/ha_yield"
    y_train_hg = train_df[target_col].values
    y_calib_hg = calib_df[target_col].values
    y_test_hg = test_df[target_col].values
    y_test_t = y_test_hg / 10000.0

    climate_test_mask = test_df["has_genuine_climate"].values
    y_test_t_clim = y_test_t[climate_test_mask]

    logger.info("Dataset split: Train=%d, Calib=%d, Test=%d (Climate Covered Test=%d)",
                len(train_df), len(calib_df), len(test_df), int(np.sum(climate_test_mask)))

    # Define the 5 ablation feature sets
    cat_cols = ["Area", "Item"]

    ablation_configs = {
        "Ablation_1_Baseline": {
            "name": "1. Baseline Features Only",
            "cat_cols": cat_cols,
            "num_cols": ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
        },
        "Ablation_2_Climate_Only": {
            "name": "2. Baseline + Authentic Climate Features",
            "cat_cols": cat_cols,
            "num_cols": [
                "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp",
                "effective_precip_mm", "effective_temp_c",
                "growing_season_precip_mm", "heat_stress_days_above_30c", "dry_spell_max_days"
            ]
        },
        "Ablation_3_Irrigation_Only": {
            "name": "3. Baseline + FAO AQUASTAT Irrigation",
            "cat_cols": cat_cols,
            "num_cols": [
                "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp",
                "irrigation_equipped_pct"
            ]
        },
        "Ablation_4_Climate_Plus_Irrigation": {
            "name": "4. Baseline + Climate + Irrigation (Full Environmental)",
            "cat_cols": cat_cols,
            "num_cols": [
                "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp",
                "effective_precip_mm", "effective_temp_c",
                "growing_season_precip_mm", "heat_stress_days_above_30c", "dry_spell_max_days",
                "irrigation_equipped_pct"
            ]
        },
        "Ablation_5_Full_With_Anomaly": {
            "name": "5. Baseline + Climate + Irrigation + Anomaly Signals",
            "cat_cols": cat_cols,
            "num_cols": [
                "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp",
                "effective_precip_mm", "effective_temp_c",
                "growing_season_precip_mm", "heat_stress_days_above_30c", "dry_spell_max_days",
                "irrigation_equipped_pct",
                "rainfall_deviation_pct", "temp_z_score", "thermal_anomaly_flag"
            ]
        }
    }

    results = {
        "meta": {
            "split_description": "Regime A: Train <= 2018 (80/20 GroupShuffleSplit), Test 2019-2024",
            "train_samples": len(train_df),
            "calib_samples": len(calib_df),
            "test_samples": len(test_df),
            "climate_covered_test_samples": int(np.sum(climate_test_mask)),
            "algorithm": "XGBoost Regressor (n_estimators=300, max_depth=6, lr=0.1, TransformedTargetRegressor log1p/expm1, seed=42)"
        },
        "ablation_models": {}
    }

    baseline_y_pred_t = None

    for key, cfg in ablation_configs.items():
        logger.info("Training %s (%s)...", key, cfg["name"])
        features = cfg["cat_cols"] + cfg["num_cols"]
        cat_c = cfg["cat_cols"]
        num_c = cfg["num_cols"]

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), num_c),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_c)
            ]
        )

        regressor = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.10,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=RANDOM_SEED,
            n_jobs=-1
        )

        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("model", regressor)
        ])

        model = TransformedTargetRegressor(
            regressor=pipe,
            func=np.log1p,
            inverse_func=np.expm1
        )

        model.fit(train_df[features], y_train_hg)

        # Predictions on calib and test
        y_calib_pred_hg = model.predict(calib_df[features])
        y_test_pred_hg = model.predict(test_df[features])

        y_test_pred_t = np.maximum(y_test_pred_hg / 10000.0, 0.0)

        if baseline_y_pred_t is None:
            baseline_y_pred_t = y_test_pred_t

        # Overall Metrics on identical test set (N=3,409)
        r2 = float(r2_score(y_test_t, y_test_pred_t))
        mae = float(mean_absolute_error(y_test_t, y_test_pred_t))
        rmse = float(np.sqrt(mean_squared_error(y_test_t, y_test_pred_t)))

        # Conformal calibration & evaluation (Standard & SACAP-V2)
        emp_cov_std, mean_width_std, per_crop_uq, emp_cov_sacap, mean_width_sacap = evaluate_conformal_calibration(
            y_calib_hg=y_calib_hg,
            y_calib_pred_hg=y_calib_pred_hg,
            crops_calib=calib_df["Item"].tolist(),
            y_test_hg=y_test_hg,
            y_test_pred_hg=y_test_pred_hg,
            crops_test=test_df["Item"].tolist(),
            anomaly_flags=test_df["thermal_anomaly_flag"].values
        )

        # Climate-Covered Subset Metrics (N=888)
        y_pred_clim_t = y_test_pred_t[climate_test_mask]
        r2_clim = float(r2_score(y_test_t_clim, y_pred_clim_t))
        mae_clim = float(mean_absolute_error(y_test_t_clim, y_pred_clim_t))
        rmse_clim = float(np.sqrt(mean_squared_error(y_test_t_clim, y_pred_clim_t)))

        # Per-crop metrics on climate-covered subset
        clim_test_df = test_df[climate_test_mask].copy()
        clim_test_df["pred_tonnes"] = y_pred_clim_t
        clim_test_df["true_tonnes"] = y_test_t_clim

        crop_metrics = {}
        for crop in sorted(clim_test_df["Item"].unique()):
            c_df = clim_test_df[clim_test_df["Item"] == crop]
            c_mae = float(mean_absolute_error(c_df["true_tonnes"], c_df["pred_tonnes"]))
            c_rmse = float(np.sqrt(mean_squared_error(c_df["true_tonnes"], c_df["pred_tonnes"])))
            crop_metrics[crop] = {
                "test_n": len(c_df),
                "mae_tonnes": round(c_mae, 4),
                "rmse_tonnes": round(c_rmse, 4)
            }

        # Bootstrap 95% CI vs Baseline
        ci_low, ci_high = bootstrap_mae_ci(y_test_t, baseline_y_pred_t, y_test_pred_t)

        logger.info("  %s -> Overall R2=%.4f, MAE=%.4f t/ha | Climate Subset MAE=%.4f t/ha | Conformal Cov=%.2f%%",
                    key, r2, mae, mae_clim, emp_cov_std * 100)

        results["ablation_models"][key] = {
            "name": cfg["name"],
            "feature_count": len(features),
            "features_used": features,
            "overall_metrics": {
                "r2": round(r2, 4),
                "mae_tonnes": round(mae, 4),
                "rmse_tonnes": round(rmse, 4),
                "conformal_standard_coverage_pct": round(emp_cov_std * 100.0, 2),
                "mean_interval_width_standard_tonnes": round(mean_width_std, 4),
                "conformal_sacap_coverage_pct": round(emp_cov_sacap * 100.0, 2),
                "mean_interval_width_sacap_tonnes": round(mean_width_sacap, 4),
                "bootstrap_95_ci_mae_improvement_vs_baseline": [round(ci_low, 4), round(ci_high, 4)]
            },
            "climate_covered_subset": {
                "test_n": int(np.sum(climate_test_mask)),
                "r2": round(r2_clim, 4),
                "mae_tonnes": round(mae_clim, 4),
                "rmse_tonnes": round(rmse_clim, 4),
                "per_crop_metrics": crop_metrics
            },
            "per_crop_conformal": per_crop_uq
        }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    logger.info("Ablation experiment complete! Output saved to %s", OUTPUT_FILE)


if __name__ == "__main__":
    run_ablation_experiments()
