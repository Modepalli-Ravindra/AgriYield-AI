"""
Phase 4: Controlled Research Benchmark Experiment (1990-2024 Dataset)

Evaluates:
- XGBoost Regressor
- Random Forest Regressor
- LightGBM Regressor
- PyTorch Tabular Neural Network (MLP)

Across two rigorous evaluation regimes:
1. Chronological Split (Train: 1990-2018, Test: 2019-2024)
2. Grouped Disjoint Split (GroupShuffleSplit on Area_Item, 80/20)

Includes:
- Direct comparison with existing production model baseline on 2019-2024 data
- Per-crop MAE, RMSE, R2 breakdowns
- Crop-conditional conformal prediction calibration (90% nominal coverage)
- Exact TreeSHAP additivity verification

All experimental models and artifacts are saved exclusively in:
experiments/phase4_retraining_1990_2024/
No production files or models are modified.
"""
from __future__ import annotations

import os
import sys
import time
import json
import joblib
import hashlib
from pathlib import Path

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure project root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import torch
import shap

from app.ml.dl_model import train_dl_mlp, predict_dl_mlp, TabularCropYieldMLP
from app.ml.conformal import ConformalPredictionCalibrator

# Set random seeds for strict reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)

DATA_PATH = BASE_DIR / "data" / "yield_df_1990_2024.csv"
OUTPUT_DIR = BASE_DIR / "experiments" / "phase4_retraining_1990_2024"
MODELS_OUT = OUTPUT_DIR / "models"
REPORTS_OUT = OUTPUT_DIR / "reports"

MODELS_OUT.mkdir(parents=True, exist_ok=True)
REPORTS_OUT.mkdir(parents=True, exist_ok=True)

HG_TO_TONNES = 1.0 / 10000.0

feature_cols = ["Area", "Item", "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
categorical_cols = ["Area", "Item"]
numerical_cols = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]

def build_preprocessor():
    """Construct ColumnTransformer with strict leakage-safe transformations."""
    return ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
            ("num", StandardScaler(), numerical_cols)
        ]
    )

def evaluate_predictions(y_true_tonnes, y_pred_tonnes):
    """Compute standard regression metrics in tonnes/ha."""
    r2 = float(r2_score(y_true_tonnes, y_pred_tonnes))
    rmse = float(np.sqrt(mean_squared_error(y_true_tonnes, y_pred_tonnes)))
    mae = float(mean_absolute_error(y_true_tonnes, y_pred_tonnes))
    return {"r2": round(r2, 4), "rmse_tonnes": round(rmse, 4), "mae_tonnes": round(mae, 4)}

def evaluate_per_crop(df_test, y_true_tonnes, y_pred_tonnes):
    """Compute per-crop performance metrics."""
    crop_metrics = {}
    df_eval = df_test.copy()
    df_eval["y_true"] = y_true_tonnes
    df_eval["y_pred"] = y_pred_tonnes
    
    for crop in sorted(df_eval["Item"].unique()):
        sub = df_eval[df_eval["Item"] == crop]
        if len(sub) > 1:
            r2 = float(r2_score(sub["y_true"], sub["y_pred"]))
            rmse = float(np.sqrt(mean_squared_error(sub["y_true"], sub["y_pred"])))
            mae = float(mean_absolute_error(sub["y_true"], sub["y_pred"]))
            crop_metrics[crop] = {
                "samples": len(sub),
                "r2": round(r2, 4),
                "rmse_tonnes": round(rmse, 4),
                "mae_tonnes": round(mae, 4),
                "mean_yield_tonnes": round(float(sub["y_true"].mean()), 2)
            }
    return crop_metrics

def main():
    print("=" * 80)
    print("PHASE 4: EXPERIMENTAL BENCHMARK EVALUATION (1990-2024 DATASET)")
    print("=" * 80)
    print(f"Dataset path: {DATA_PATH}")
    print(f"Output directory: {OUTPUT_DIR}")
    
    # 1. Load Dataset
    df = pd.read_csv(DATA_PATH)
    total_samples = len(df)
    df["yield_tonnes_per_ha"] = df["hg/ha_yield"] * HG_TO_TONNES
    df["group_id"] = df["Area"] + "_" + df["Item"]
    print(f"Loaded {total_samples} verified clean records spanning {df['Year'].min()} to {df['Year'].max()}")
    print(f"Total countries: {df['Area'].nunique()} | Total crops: {df['Item'].nunique()}")
    
    benchmark_results = {
        "experiment_name": "Phase 4 - Multi-Model Retraining Benchmark (1990-2024)",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_path": str(DATA_PATH.relative_to(BASE_DIR)),
        "dataset_rows": total_samples,
        "random_seed": RANDOM_SEED,
        "chronological_split": {},
        "grouped_split": {},
        "production_baseline_comparison": {},
        "conformal_calibration": {}
    }
    
    # =========================================================================
    # REGIME A: CHRONOLOGICAL EVALUATION (Train: 1990-2018, Test: 2019-2024)
    # =========================================================================
    print("\n" + "=" * 80)
    print("REGIME A: CHRONOLOGICAL FORWARD GENERALIZATION (Train <= 2018, Test 2019-2024)")
    print("=" * 80)
    
    train_dev = df[df["Year"] <= 2018].copy().reset_index(drop=True)
    test_time = df[df["Year"] >= 2019].copy().reset_index(drop=True)
    
    # Split train_dev into 80% train and 20% calibration (for Conformal UQ)
    gss_calib = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    train_idx, calib_idx = next(gss_calib.split(train_dev, groups=train_dev["group_id"]))
    
    train_df = train_dev.iloc[train_idx].copy().reset_index(drop=True)
    calib_df = train_dev.iloc[calib_idx].copy().reset_index(drop=True)
    
    print(f"Chronological Splits:")
    print(f"  Training Split (1990-2018):    {len(train_df)} samples ({train_df['Area'].nunique()} countries)")
    print(f"  Calibration Split (1990-2018): {len(calib_df)} samples")
    print(f"  Held-Out Test Set (2019-2024): {len(test_time)} samples ({test_time['Area'].nunique()} countries)")
    
    X_train = train_df[feature_cols]
    y_train = train_df["yield_tonnes_per_ha"].values
    
    X_calib = calib_df[feature_cols]
    y_calib = calib_df["yield_tonnes_per_ha"].values
    
    X_test = test_time[feature_cols]
    y_test = test_time["yield_tonnes_per_ha"].values
    
    # Fit preprocessor on X_train only (Strict Leakage Prevention)
    preprocessor = build_preprocessor()
    X_train_proc = preprocessor.fit_transform(X_train)
    X_calib_proc = preprocessor.transform(X_calib)
    X_test_proc = preprocessor.transform(X_test)
    
    # Models to train
    models_config = {
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=16, random_state=RANDOM_SEED, n_jobs=-1),
        "XGBoost": xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1),
        "LightGBM": lgb.LGBMRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1, verbose=-1)
    }
    
    chrono_metrics = {}
    chrono_per_crop = {}
    fitted_pipelines = {}
    
    for name, est in models_config.items():
        print(f"\n--- Training {name} ---")
        t0 = time.time()
        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", est)
        ])
        pipe.fit(X_train, y_train)
        fit_time = time.time() - t0
        
        y_pred = pipe.predict(X_test)
        metrics = evaluate_predictions(y_test, y_pred)
        metrics["fit_time_seconds"] = round(fit_time, 2)
        chrono_metrics[name] = metrics
        
        per_crop = evaluate_per_crop(test_time, y_test, y_pred)
        chrono_per_crop[name] = per_crop
        fitted_pipelines[name] = pipe
        
        # Save experimental pipeline
        model_save_path = MODELS_OUT / f"{name.lower().replace(' ', '_')}_experiment.pkl"
        joblib.dump(pipe, model_save_path)
        print(f"  {name:15s} | R2: {metrics['r2']:.4f} | RMSE: {metrics['rmse_tonnes']:.4f} t/ha | MAE: {metrics['mae_tonnes']:.4f} t/ha ({fit_time:.2f}s)")
        print(f"  Saved artifact: {model_save_path.name}")
        
    # PyTorch MLP
    print("\n--- Training PyTorch Tabular MLP ---")
    t0 = time.time()
    mlp_save_path = MODELS_OUT / "pytorch_mlp_experiment.pt"
    # Target in hg/ha for train_dl_mlp helper
    y_train_hg = train_df["hg/ha_yield"].values
    y_calib_hg = calib_df["hg/ha_yield"].values
    y_test_hg = test_time["hg/ha_yield"].values
    
    mlp_model, mlp_history = train_dl_mlp(
        X_train_proc, y_train_hg,
        X_val=X_calib_proc, y_val=y_calib_hg,
        epochs=30, batch_size=128, lr=0.003,
        save_path=mlp_save_path
    )
    mlp_fit_time = time.time() - t0
    mlp_preds_hg = predict_dl_mlp(mlp_model, X_test_proc)
    mlp_preds_tonnes = mlp_preds_hg * HG_TO_TONNES
    
    mlp_metrics = evaluate_predictions(y_test, mlp_preds_tonnes)
    mlp_metrics["fit_time_seconds"] = round(mlp_fit_time, 2)
    chrono_metrics["PyTorch MLP"] = mlp_metrics
    chrono_per_crop["PyTorch MLP"] = evaluate_per_crop(test_time, y_test, mlp_preds_tonnes)
    print(f"  PyTorch MLP     | R2: {mlp_metrics['r2']:.4f} | RMSE: {mlp_metrics['rmse_tonnes']:.4f} t/ha | MAE: {mlp_metrics['mae_tonnes']:.4f} t/ha ({mlp_fit_time:.2f}s)")
    print(f"  Saved artifact: {mlp_save_path.name}")
    
    # -------------------------------------------------------------------------
    # Evaluation of Existing Production Model on 2019-2024 Test Data
    # -------------------------------------------------------------------------
    print("\n--- Evaluating Existing Production Model Baseline on 2019-2024 Test Set ---")
    prod_model_path = BASE_DIR / "models" / "crop_yield_model.pkl"
    if prod_model_path.exists():
        prod_pipe = joblib.load(prod_model_path)
        # Production model predicts in hg/ha
        prod_preds_raw = prod_pipe.predict(X_test)
        prod_preds_tonnes = prod_preds_raw * HG_TO_TONNES
        prod_metrics = evaluate_predictions(y_test, prod_preds_tonnes)
        prod_per_crop = evaluate_per_crop(test_time, y_test, prod_preds_tonnes)
        print(f"  Existing Prod Model (1990-2013 train) | R2: {prod_metrics['r2']:.4f} | RMSE: {prod_metrics['rmse_tonnes']:.4f} t/ha | MAE: {prod_metrics['mae_tonnes']:.4f} t/ha")
        benchmark_results["production_baseline_comparison"] = {
            "model_path": str(prod_model_path.relative_to(BASE_DIR)),
            "training_period": "1990-2013 (unaggregated baseline)",
            "test_period": "2019-2024 (held-out)",
            "metrics": prod_metrics,
            "per_crop_metrics": prod_per_crop
        }
    else:
        print("  Warning: Production model artifact not found.")
        
    benchmark_results["chronological_split"] = {
        "train_samples": len(train_df),
        "calibration_samples": len(calib_df),
        "test_samples": len(test_time),
        "train_years": [int(train_df["Year"].min()), int(train_df["Year"].max())],
        "test_years": [int(test_time["Year"].min()), int(test_time["Year"].max())],
        "metrics": chrono_metrics,
        "per_crop_metrics": chrono_per_crop
    }
    
    # -------------------------------------------------------------------------
    # Conformal Prediction Calibration on Retrained XGBoost
    # -------------------------------------------------------------------------
    print("\n--- Calibrating Crop-Conditional Conformal Prediction Intervals ---")
    xgb_pipe = fitted_pipelines["XGBoost"]
    calib_preds = xgb_pipe.predict(X_calib)
    test_preds = xgb_pipe.predict(X_test)
    
    conformal_calibrator = ConformalPredictionCalibrator(nominal_coverage=0.90)
    conformal_calibrator.fit(y_calib, calib_preds)
    
    # Calculate crop-conditional non-conformity quantiles
    calib_eval_df = calib_df.copy()
    calib_eval_df["residual"] = np.abs(y_calib - calib_preds)
    
    crop_quantiles = {}
    crop_conformal_results = {}
    
    for crop in sorted(test_time["Item"].unique()):
        sub_c = calib_eval_df[calib_eval_df["Item"] == crop]
        if len(sub_c) >= 10:
            q_c = float(np.quantile(sub_c["residual"], 0.90))
        else:
            q_c = float(conformal_calibrator.conformal_quantile_q)
        crop_quantiles[crop] = round(q_c, 4)
        
        # Test coverage on test_time
        sub_test = test_time[test_time["Item"] == crop].copy()
        test_sub_preds = xgb_pipe.predict(sub_test[feature_cols])
        y_sub_true = sub_test["yield_tonnes_per_ha"].values
        
        lower_bound = np.maximum(0.0, test_sub_preds - q_c)
        upper_bound = test_sub_preds + q_c
        covered = (y_sub_true >= lower_bound) & (y_sub_true <= upper_bound)
        
        crop_conformal_results[crop] = {
            "test_samples": len(sub_test),
            "quantile_q_tonnes": round(q_c, 4),
            "empirical_coverage": round(float(covered.mean()), 4),
            "mean_interval_width_tonnes": round(float((upper_bound - lower_bound).mean()), 4)
        }
        print(f"  {crop:<22} | Q: {q_c:.4f} t/ha | Coverage: {covered.mean()*100:.2f}% | Mean Width: {(upper_bound - lower_bound).mean():.3f} t/ha")
        
    conformal_calibrator.crop_quantiles = crop_quantiles
    conformal_calibrator.quantile_q = round(float(np.quantile(calib_eval_df["residual"], 0.90)), 4)
    conformal_calibrator.group_max_quantile_q = round(float(max(crop_quantiles.values())), 4)
    
    conformal_save_path = MODELS_OUT / "conformal_calibrator_experiment.pkl"
    conformal_calibrator.save(conformal_save_path)
    print(f"  Saved experimental conformal calibrator: {conformal_save_path.name}")
    
    benchmark_results["conformal_calibration"] = {
        "nominal_coverage": 0.90,
        "global_q_tonnes": round(conformal_calibrator.quantile_q, 4),
        "group_max_q_tonnes": round(conformal_calibrator.group_max_quantile_q, 4),
        "crop_conditional_coverage": crop_conformal_results
    }
    
    # -------------------------------------------------------------------------
    # Exact TreeSHAP Additivity Verification on Retrained XGBoost
    # -------------------------------------------------------------------------
    print("\n--- Verifying Exact TreeSHAP Additivity on Retrained XGBoost ---")
    raw_xgb = xgb_pipe.named_steps["regressor"]
    raw_prep = xgb_pipe.named_steps["preprocessor"]
    
    sample_sample = X_test.iloc[:5]
    transformed_sample = raw_prep.transform(sample_sample)
    
    explainer = shap.TreeExplainer(raw_xgb)
    shap_vals = explainer(transformed_sample)
    
    base_val = float(explainer.expected_value)
    additivity_errors = []
    
    for i in range(len(sample_sample)):
        pred_i = float(raw_xgb.predict(transformed_sample[i:i+1])[0])
        recon_i = base_val + float(np.sum(shap_vals.values[i]))
        err_i = abs(pred_i - recon_i)
        additivity_errors.append(err_i)
        
    max_additivity_err = max(additivity_errors)
    print(f"  Max TreeSHAP Additivity Discrepancy: {max_additivity_err:.2e} t/ha")
    assert max_additivity_err < 1e-4, "TreeSHAP additivity check failed!"
    print(f"  [OK] Exact TreeSHAP Additivity Verified (tolerance < 1e-4)")
    
    benchmark_results["treeshap_verification"] = {
        "method": "Exact TreeSHAP (shap.TreeExplainer)",
        "base_value_tonnes": round(base_val, 4),
        "max_additivity_error_tonnes": float(max_additivity_err),
        "additivity_verified": True
    }
    
    # =========================================================================
    # REGIME B: GROUPED LEAKAGE-AWARE SPLIT (80% Train, 20% Test on Area_Item)
    # =========================================================================
    print("\n" + "=" * 80)
    print("REGIME B: GROUPED DISJOINT SPLIT (GroupShuffleSplit on Area_Item, 80/20)")
    print("=" * 80)
    
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    train_g_idx, test_g_idx = next(gss.split(df, groups=df["group_id"]))
    
    train_g = df.iloc[train_g_idx].copy().reset_index(drop=True)
    test_g = df.iloc[test_g_idx].copy().reset_index(drop=True)
    
    print(f"Grouped Splits:")
    print(f"  Train: {len(train_g)} samples ({train_g['group_id'].nunique()} Area-Item groups)")
    print(f"  Test:  {len(test_g)} samples ({test_g['group_id'].nunique()} Area-Item groups)")
    
    X_train_g = train_g[feature_cols]
    y_train_g = train_g["yield_tonnes_per_ha"].values
    X_test_g = test_g[feature_cols]
    y_test_g = test_g["yield_tonnes_per_ha"].values
    
    prep_g = build_preprocessor()
    X_train_g_proc = prep_g.fit_transform(X_train_g)
    X_test_g_proc = prep_g.transform(X_test_g)
    
    grouped_metrics = {}
    for name, est_cls in [
        ("Random Forest", lambda: RandomForestRegressor(n_estimators=100, max_depth=16, random_state=RANDOM_SEED, n_jobs=-1)),
        ("XGBoost", lambda: xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1)),
        ("LightGBM", lambda: lgb.LGBMRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1, verbose=-1))
    ]:
        pipe_g = Pipeline([("preprocessor", prep_g), ("regressor", est_cls())])
        t0 = time.time()
        pipe_g.fit(X_train_g, y_train_g)
        fit_t = time.time() - t0
        y_pred_g = pipe_g.predict(X_test_g)
        m = evaluate_predictions(y_test_g, y_pred_g)
        m["fit_time_seconds"] = round(fit_t, 2)
        grouped_metrics[name] = m
        print(f"  {name:15s} | R2: {m['r2']:.4f} | RMSE: {m['rmse_tonnes']:.4f} t/ha | MAE: {m['mae_tonnes']:.4f} t/ha ({fit_t:.2f}s)")
        
    benchmark_results["grouped_split"] = {
        "train_samples": len(train_g),
        "test_samples": len(test_g),
        "train_groups": int(train_g["group_id"].nunique()),
        "test_groups": int(test_g["group_id"].nunique()),
        "group_overlap": 0,
        "metrics": grouped_metrics
    }
    
    # Save complete JSON report
    report_json_path = REPORTS_OUT / "BENCHMARK_EVALUATION_REPORT.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(benchmark_results, f, indent=2)
    print(f"\n[OK] Benchmark metrics saved to: {report_json_path}")
    print("\n" + "=" * 80)
    print("PHASE 4 EXPERIMENTS COMPLETED SUCCESSFULLY")
    print("=" * 80)

if __name__ == "__main__":
    main()
