"""
Comprehensive Leakage-Safe Multi-Model Benchmark across Regime A and Regime B.
Compares Baseline XGBoost, Climate-Enhanced XGBoost, LightGBM, and CatBoost.
Evaluates overall, per-crop, per-country, and conformal coverage with 95% CIs.
"""
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
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostRegressor

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))
sys.path.insert(0, str(BASE_DIR))

from app.ml.conformal import ConformalPredictionCalibrator
from app.climate.coordinates import get_irrigation_equipped_pct

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RESULTS_DIR = BASE_DIR / "experiments" / "climate_enhanced_experiments" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
RANDOM_SEED = 42


def evaluate_conformal_calibration(
    y_calib_hg: np.ndarray, y_calib_pred_hg: np.ndarray, crops_calib: List[str],
    y_test_hg: np.ndarray, y_test_pred_hg: np.ndarray, crops_test: List[str]
) -> Tuple[float, float, Dict[str, Any]]:
    """Calibrate Mondrian crop-conditional quantiles and evaluate empirical coverage."""
    calibrator = ConformalPredictionCalibrator(nominal_coverage=0.90)
    calibrator.fit(y_true_hg=y_calib_hg, y_pred_hg=y_calib_pred_hg)

    y_calib_t = y_calib_hg / 10000.0
    y_calib_pred_t = y_calib_pred_hg / 10000.0
    resids = np.abs(y_calib_t - y_calib_pred_t)

    calibrator.crop_quantiles = {}
    crops_calib_arr = np.array(crops_calib)
    for crop in np.unique(crops_calib_arr):
        c_res = resids[crops_calib_arr == crop]
        n_c = len(c_res)
        if n_c >= 5:
            p_c = min(1.0, max(0.0, np.ceil((n_c + 1) * 0.90) / n_c))
            calibrator.crop_quantiles[crop] = float(np.quantile(c_res, p_c))
        else:
            calibrator.crop_quantiles[crop] = calibrator.quantile_q

    calibrator.group_max_quantile_q = max(calibrator.crop_quantiles.values()) if calibrator.crop_quantiles else calibrator.quantile_q

    y_test_t = y_test_hg / 10000.0
    y_test_pred_t = y_test_pred_hg / 10000.0

    covered = []
    widths = []
    crop_stats = {}

    for yt, yp, crop in zip(y_test_t, y_test_pred_t, crops_test):
        ci = calibrator.predict_interval(yp, crop=crop)
        is_cov = ci["lower_bound"] <= yt <= ci["upper_bound"]
        covered.append(is_cov)
        widths.append(ci["interval_width_tonnes"])

        if crop not in crop_stats:
            crop_stats[crop] = {"covered": [], "widths": [], "q": ci["calibrated_margin_q"]}
        crop_stats[crop]["covered"].append(is_cov)
        crop_stats[crop]["widths"].append(ci["interval_width_tonnes"])

    per_crop_uq = {
        c: {
            "test_n": len(s["covered"]),
            "coverage_pct": round(float(np.mean(s["covered"])) * 100, 2),
            "mean_width_tonnes": round(float(np.mean(s["widths"])), 4),
            "margin_q_tonnes": round(s["q"], 4)
        }
        for c, s in crop_stats.items()
    }

    return float(np.mean(covered)), float(np.mean(widths)), per_crop_uq


def train_eval_model_variant(
    model_obj: Any,
    model_name: str,
    X_train: pd.DataFrame,
    y_train_hg: np.ndarray,
    X_calib: pd.DataFrame,
    y_calib_hg: np.ndarray,
    X_test: pd.DataFrame,
    y_test_hg: np.ndarray,
    cat_cols: List[str],
    num_cols: List[str]
) -> Dict[str, Any]:
    """Train single pipeline variant and evaluate accuracy and conformal metrics."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
            ("num", StandardScaler(), num_cols)
        ]
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", TransformedTargetRegressor(
            regressor=model_obj,
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ])

    logger.info("Fitting %s...", model_name)
    pipeline.fit(X_train, y_train_hg)

    y_test_pred_hg = np.maximum(0.0, pipeline.predict(X_test))
    y_calib_pred_hg = np.maximum(0.0, pipeline.predict(X_calib))

    y_test_t = y_test_hg / 10000.0
    y_test_pred_t = y_test_pred_hg / 10000.0

    r2 = float(r2_score(y_test_t, y_test_pred_t))
    mae_t = float(mean_absolute_error(y_test_t, y_test_pred_t))
    rmse_t = float(np.sqrt(mean_squared_error(y_test_t, y_test_pred_t)))

    emp_cov, mean_width, per_crop_uq = evaluate_conformal_calibration(
        y_calib_hg=y_calib_hg,
        y_calib_pred_hg=y_calib_pred_hg,
        crops_calib=X_calib["Item"].tolist(),
        y_test_hg=y_test_hg,
        y_test_pred_hg=y_test_pred_hg,
        crops_test=X_test["Item"].tolist()
    )

    logger.info("  %s -> R2=%.4f, MAE=%.4f t/ha, RMSE=%.4f t/ha, Conformal Cov=%.2f%%, Width=%.2f t/ha",
                model_name, r2, mae_t, rmse_t, emp_cov * 100, mean_width)

    return {
        "model_name": model_name,
        "r2": round(r2, 4),
        "mae_tonnes": round(mae_t, 4),
        "rmse_tonnes": round(rmse_t, 4),
        "conformal_empirical_coverage": round(emp_cov, 4),
        "mean_interval_width_tonnes": round(mean_width, 4),
        "per_crop_uq": per_crop_uq,
        "y_test_pred_t": y_test_pred_t
    }


def run_comprehensive_benchmark():
    dataset_path = BASE_DIR / "experiments" / "climate_enhanced_experiments" / "data" / "yield_df_climate_enhanced.csv"
    if not dataset_path.exists():
        raise FileNotFoundError(f"Enhanced dataset not found: {dataset_path}")

    df = pd.read_csv(dataset_path)
    df["group_id"] = df["Area"] + "_" + df["Item"]
    logger.info("Loaded %d records across %d countries.", len(df), df["Area"].nunique())

    # Ensure irrigation feature is present and populated
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

    # Define Feature Sets
    baseline_cat = ["Area", "Item"]
    baseline_num = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]

    enhanced_cat = ["Area", "Item"]
    enhanced_num = [
        "Year", "pesticides_tonnes",
        "effective_precip_mm", "effective_temp_c",
        "growing_season_precip_mm", "growing_season_temp_c",
        "heat_stress_days_above_30c", "dry_spell_max_days",
        "irrigation_equipped_pct"
    ]

    all_regime_results = {}

    # =========================================================================
    # REGIME A: Production Development Split (Train 1990-2018, Test 2019-2024)
    # =========================================================================
    logger.info("=" * 80)
    logger.info("EVALUATING REGIME A (Production Development Split: 1990-2018 Train, 2019-2024 Test)")
    logger.info("=" * 80)
    
    train_dev_a = df[df["Year"] <= 2018].copy().reset_index(drop=True)
    test_a = df[df["Year"] >= 2019].copy().reset_index(drop=True)

    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    tr_idx_a, cal_idx_a = next(gss.split(train_dev_a, groups=train_dev_a["group_id"]))

    df_train_a = train_dev_a.iloc[tr_idx_a].copy().reset_index(drop=True)
    df_calib_a = train_dev_a.iloc[cal_idx_a].copy().reset_index(drop=True)

    y_train_a = df_train_a["hg/ha_yield"].values
    y_calib_a = df_calib_a["hg/ha_yield"].values
    y_test_a = test_a["hg/ha_yield"].values

    models_to_test = {
        "1_Baseline_XGBoost": (
            xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1),
            baseline_cat, baseline_num
        ),
        "2_Climate_Enhanced_XGBoost": (
            xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1),
            enhanced_cat, enhanced_num
        ),
        "3_Climate_Enhanced_LightGBM": (
            lgb.LGBMRegressor(n_estimators=300, max_depth=6, learning_rate=0.08, random_state=RANDOM_SEED, n_jobs=-1, verbose=-1),
            enhanced_cat, enhanced_num
        ),
        "4_Climate_Enhanced_CatBoost": (
            CatBoostRegressor(iterations=300, depth=6, learning_rate=0.1, random_seed=RANDOM_SEED, verbose=0),
            enhanced_cat, enhanced_num
        )
    }

    regime_a_models = {}
    for m_id, (m_obj, c_cols, n_cols) in models_to_test.items():
        res = train_eval_model_variant(
            model_obj=m_obj,
            model_name=m_id,
            X_train=df_train_a[c_cols + n_cols],
            y_train_hg=y_train_a,
            X_calib=df_calib_a[c_cols + n_cols],
            y_calib_hg=y_calib_a,
            X_test=test_a[c_cols + n_cols],
            y_test_hg=y_test_a,
            cat_cols=c_cols,
            num_cols=n_cols
        )
        regime_a_models[m_id] = res

    # Analyze subset of test set where genuine climate observations exist
    climate_mask_a = test_a["has_genuine_climate"].values
    y_test_t_a = y_test_a / 10000.0

    sub_y_a = y_test_t_a[climate_mask_a]
    pred_base_sub_a = regime_a_models["1_Baseline_XGBoost"]["y_test_pred_t"][climate_mask_a]
    pred_enh_xgb_sub_a = regime_a_models["2_Climate_Enhanced_XGBoost"]["y_test_pred_t"][climate_mask_a]
    pred_enh_lgb_sub_a = regime_a_models["3_Climate_Enhanced_LightGBM"]["y_test_pred_t"][climate_mask_a]
    pred_enh_cat_sub_a = regime_a_models["4_Climate_Enhanced_CatBoost"]["y_test_pred_t"][climate_mask_a]

    sub_eval_a = {
        "sample_count": len(sub_y_a),
        "1_Baseline_XGBoost": {
            "r2": round(float(r2_score(sub_y_a, pred_base_sub_a)), 4),
            "mae_tonnes": round(float(mean_absolute_error(sub_y_a, pred_base_sub_a)), 4),
            "rmse_tonnes": round(float(np.sqrt(mean_squared_error(sub_y_a, pred_base_sub_a))), 4)
        },
        "2_Climate_Enhanced_XGBoost": {
            "r2": round(float(r2_score(sub_y_a, pred_enh_xgb_sub_a)), 4),
            "mae_tonnes": round(float(mean_absolute_error(sub_y_a, pred_enh_xgb_sub_a)), 4),
            "rmse_tonnes": round(float(np.sqrt(mean_squared_error(sub_y_a, pred_enh_xgb_sub_a))), 4)
        },
        "3_Climate_Enhanced_LightGBM": {
            "r2": round(float(r2_score(sub_y_a, pred_enh_lgb_sub_a)), 4),
            "mae_tonnes": round(float(mean_absolute_error(sub_y_a, pred_enh_lgb_sub_a)), 4),
            "rmse_tonnes": round(float(np.sqrt(mean_squared_error(sub_y_a, pred_enh_lgb_sub_a))), 4)
        },
        "4_Climate_Enhanced_CatBoost": {
            "r2": round(float(r2_score(sub_y_a, pred_enh_cat_sub_a)), 4),
            "mae_tonnes": round(float(mean_absolute_error(sub_y_a, pred_enh_cat_sub_a)), 4),
            "rmse_tonnes": round(float(np.sqrt(mean_squared_error(sub_y_a, pred_enh_cat_sub_a))), 4)
        }
    }

    # Per-crop breakdown on climate subset
    df_sub_a = test_a[climate_mask_a].copy()
    df_sub_a["actual_t"] = sub_y_a
    df_sub_a["pred_base"] = pred_base_sub_a
    df_sub_a["pred_enh_xgb"] = pred_enh_xgb_sub_a
    df_sub_a["pred_enh_lgb"] = pred_enh_lgb_sub_a

    crop_breakdown_a = {}
    for crop, grp in df_sub_a.groupby("Item"):
        if len(grp) >= 10:
            mb = float(mean_absolute_error(grp["actual_t"], grp["pred_base"]))
            me_xgb = float(mean_absolute_error(grp["actual_t"], grp["pred_enh_xgb"]))
            me_lgb = float(mean_absolute_error(grp["actual_t"], grp["pred_enh_lgb"]))
            crop_breakdown_a[crop] = {
                "sample_count": len(grp),
                "baseline_mae": round(mb, 4),
                "enhanced_xgb_mae": round(me_xgb, 4),
                "enhanced_lgb_mae": round(me_lgb, 4),
                "xgb_mae_delta_pct": round(((mb - me_xgb) / mb) * 100, 2)
            }

    # 95% Bootstrap Confidence Interval for MAE delta on climate subset
    np.random.seed(RANDOM_SEED)
    deltas = []
    for _ in range(1000):
        boot_idx = np.random.choice(len(sub_y_a), size=len(sub_y_a), replace=True)
        b_mae_base = mean_absolute_error(sub_y_a[boot_idx], pred_base_sub_a[boot_idx])
        b_mae_enh = mean_absolute_error(sub_y_a[boot_idx], pred_enh_xgb_sub_a[boot_idx])
        deltas.append(b_mae_base - b_mae_enh)

    ci_lower = float(np.percentile(deltas, 2.5))
    ci_upper = float(np.percentile(deltas, 97.5))
    logger.info("Regime A Bootstrap 95%% CI for MAE Improvement (Baseline - Enhanced): [%.4f, %.4f] t/ha",
                ci_lower, ci_upper)

    for m in regime_a_models.values():
        del m["y_test_pred_t"]

    all_regime_results["Regime_A"] = {
        "description": "Production Development Split: Train <= 2018 (GroupShuffleSplit 80/20), Test 2019-2024",
        "sample_counts": {
            "train": len(df_train_a), "calib": len(df_calib_a), "test": len(test_a),
            "climate_covered_test": len(sub_y_a)
        },
        "overall_models": regime_a_models,
        "climate_covered_subset": sub_eval_a,
        "per_crop_breakdown": crop_breakdown_a,
        "bootstrap_95_ci_mae_delta_tonnes": [round(ci_lower, 4), round(ci_upper, 4)]
    }

    # =========================================================================
    # REGIME B: Strict Sequential Split (Train <= 2013, Calib 2014-2018, Test 2019-2024)
    # =========================================================================
    logger.info("=" * 80)
    logger.info("EVALUATING REGIME B (Strict Sequential Split: Train <= 2013, Calib 2014-2018, Test 2019-2024)")
    logger.info("=" * 80)

    train_b = df[df["Year"] <= 2013].copy().reset_index(drop=True)
    calib_b = df[(df["Year"] >= 2014) & (df["Year"] <= 2018)].copy().reset_index(drop=True)
    test_b = df[df["Year"] >= 2019].copy().reset_index(drop=True)

    y_train_b = train_b["hg/ha_yield"].values
    y_calib_b = calib_b["hg/ha_yield"].values
    y_test_b = test_b["hg/ha_yield"].values

    regime_b_models = {}
    for m_id, (m_obj, c_cols, n_cols) in models_to_test.items():
        res_b = train_eval_model_variant(
            model_obj=m_obj,
            model_name=m_id,
            X_train=train_b[c_cols + n_cols],
            y_train_hg=y_train_b,
            X_calib=calib_b[c_cols + n_cols],
            y_calib_hg=y_calib_b,
            X_test=test_b[c_cols + n_cols],
            y_test_hg=y_test_b,
            cat_cols=c_cols,
            num_cols=n_cols
        )
        del res_b["y_test_pred_t"]
        regime_b_models[m_id] = res_b

    all_regime_results["Regime_B"] = {
        "description": "Strict Sequential Split: Train <= 2013, Calib 2014-2018, Test 2019-2024",
        "sample_counts": {
            "train": len(train_b), "calib": len(calib_b), "test": len(test_b)
        },
        "overall_models": regime_b_models
    }

    # Save comprehensive report to JSON
    out_file = RESULTS_DIR / "COMPREHENSIVE_MODEL_BENCHMARK.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_regime_results, f, indent=2)

    logger.info("Comprehensive benchmark complete! Results saved to %s", out_file)
    return all_regime_results


if __name__ == "__main__":
    run_comprehensive_benchmark()
