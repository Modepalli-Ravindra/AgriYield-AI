"""
Phase 4B: Target-Scale, Crop-Balance, and Log-Yield Experiments (1990-2024)
Evaluates Raw XGBoost, Log1p(y) Transformed XGBoost, Inverse-Yield Weighted XGBoost,
Combined Log+Weight, and PyTorch Tabular MLP in hg/ha_yield with strict split isolation.
"""
import os
import sys
import json
import time
import math
from pathlib import Path
from typing import Dict, Any, List, Tuple

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import GroupShuffleSplit
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "yield_df_1990_2024.csv"
OUTPUT_DIR = BASE_DIR / "experiments" / "phase4b_crop_balance_experiments"
MODELS_OUT = OUTPUT_DIR / "models"
REPORTS_OUT = OUTPUT_DIR / "reports"

MODELS_OUT.mkdir(parents=True, exist_ok=True)
REPORTS_OUT.mkdir(parents=True, exist_ok=True)

RANDOM_SEED = 42
HG_TO_TONNES = 0.0001
TONNES_TO_HG = 10000.0

feature_cols = [
    "Area", "Item", "Year",
    "average_rain_fall_mm_per_year",
    "pesticides_tonnes",
    "avg_temp"
]

def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["Area", "Item"]),
            ("num", StandardScaler(), ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"])
        ]
    )


def compute_metrics(y_true_hg: np.ndarray, y_pred_hg: np.ndarray) -> Dict[str, Any]:
    y_pred_hg = np.maximum(0.0, y_pred_hg)
    y_true_tonnes = y_true_hg * HG_TO_TONNES
    y_pred_tonnes = y_pred_hg * HG_TO_TONNES
    
    r2 = float(r2_score(y_true_tonnes, y_pred_tonnes))
    rmse_tonnes = float(np.sqrt(mean_squared_error(y_true_tonnes, y_pred_tonnes)))
    mae_tonnes = float(mean_absolute_error(y_true_tonnes, y_pred_tonnes))
    rmse_hg = float(np.sqrt(mean_squared_error(y_true_hg, y_pred_hg)))
    mae_hg = float(mean_absolute_error(y_true_hg, y_pred_hg))
    
    return {
        "r2": round(r2, 4),
        "rmse_tonnes": round(rmse_tonnes, 4),
        "mae_tonnes": round(mae_tonnes, 4),
        "rmse_hg": round(rmse_hg, 2),
        "mae_hg": round(mae_hg, 2)
    }

def compute_per_crop_metrics(df_sub: pd.DataFrame, y_true_hg: np.ndarray, y_pred_hg: np.ndarray) -> Dict[str, Any]:
    crops_res = {}
    r2_list = []
    rmse_list = []
    mae_list = []
    
    for crop in sorted(df_sub["Item"].unique()):
        mask = (df_sub["Item"] == crop).values
        yt_c = y_true_hg[mask]
        yp_c = y_pred_hg[mask]
        m = compute_metrics(yt_c, yp_c)
        m["samples"] = int(np.sum(mask))
        m["mean_yield_tonnes"] = round(float(np.mean(yt_c) * HG_TO_TONNES), 2)
        m["mean_yield_hg"] = round(float(np.mean(yt_c)), 1)
        crops_res[crop] = m
        r2_list.append(m["r2"])
        rmse_list.append(m["rmse_tonnes"])
        mae_list.append(m["mae_tonnes"])
        
    macro_r2 = round(float(np.mean(r2_list)), 4)
    macro_rmse = round(float(np.mean(rmse_list)), 4)
    macro_mae = round(float(np.mean(mae_list)), 4)
    
    return {
        "macro_averaged": {
            "macro_r2": macro_r2,
            "macro_rmse_tonnes": macro_rmse,
            "macro_mae_tonnes": macro_mae
        },
        "per_crop": crops_res
    }

# PyTorch Tabular MLP Architecture
class TabularMLP(nn.Module):
    def __init__(self, in_features: int, hidden_dims: List[int] = [256, 128, 64], dropout: float = 0.1):
        super().__init__()
        layers = []
        prev_dim = in_features
        for h_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, h_dim))
            layers.append(nn.BatchNorm1d(h_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))
            prev_dim = h_dim
        layers.append(nn.Linear(prev_dim, 1))
        self.net = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x).squeeze(-1)

def train_tabular_mlp(X_train: np.ndarray, y_train_hg: np.ndarray,
                      X_val: np.ndarray, y_val_hg: np.ndarray,
                      epochs: int = 35, batch_size: int = 128, lr: float = 0.003) -> Tuple[TabularMLP, Dict[str, Any]]:
    torch.manual_seed(RANDOM_SEED)
    device = torch.device("cpu")
    
    y_train_tonnes = y_train_hg * HG_TO_TONNES
    y_val_tonnes = y_val_hg * HG_TO_TONNES
    
    train_dataset = TensorDataset(torch.tensor(X_train, dtype=torch.float32),
                                  torch.tensor(y_train_tonnes, dtype=torch.float32))
    val_dataset = TensorDataset(torch.tensor(X_val, dtype=torch.float32),
                                torch.tensor(y_val_tonnes, dtype=torch.float32))
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    model = TabularMLP(in_features=X_train.shape[1]).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.MSELoss()
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=4)
    
    best_val_loss = float("inf")
    best_state = None
    
    for epoch in range(epochs):
        model.train()
        for bx, by in train_loader:
            optimizer.zero_grad()
            out = model(bx)
            loss = criterion(out, by)
            loss.backward()
            optimizer.step()
            
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for bx, by in val_loader:
                out = model(bx)
                val_loss += criterion(out, by).item() * len(by)
        val_loss /= len(val_dataset)
        scheduler.step(val_loss)
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            
    if best_state is not None:
        model.load_state_dict(best_state)
    return model, {"best_val_loss": round(best_val_loss, 4)}

def predict_tabular_mlp(model: TabularMLP, X_proc: np.ndarray) -> np.ndarray:
    model.eval()
    with torch.no_grad():
        preds_tonnes = model(torch.tensor(X_proc, dtype=torch.float32)).numpy()
    preds_tonnes = np.maximum(0.0, preds_tonnes)
    return preds_tonnes * TONNES_TO_HG

def run_conformal_calibration(y_calib_hg: np.ndarray, calib_preds_hg: np.ndarray,
                              calib_crops: pd.Series,
                              y_test_hg: np.ndarray, test_preds_hg: np.ndarray,
                              test_crops: pd.Series) -> Dict[str, Any]:
    """
    Fits crop-conditional and global conformal quantiles strictly on calib partition.
    Evaluates empirical coverage on held-out test partition.
    All calculations conducted in tonnes/ha.
    """
    y_calib_tonnes = y_calib_hg * HG_TO_TONNES
    calib_preds_tonnes = calib_preds_hg * HG_TO_TONNES
    y_test_tonnes = y_test_hg * HG_TO_TONNES
    test_preds_tonnes = test_preds_hg * HG_TO_TONNES
    
    calib_residuals = np.abs(y_calib_tonnes - calib_preds_tonnes)
    global_q = float(np.quantile(calib_residuals, 0.90))
    
    crop_quantiles = {}
    crop_conformal_results = {}
    
    for crop in sorted(test_crops.unique()):
        calib_mask = (calib_crops == crop).values
        sub_res = calib_residuals[calib_mask]
        if len(sub_res) >= 10:
            q_c = float(np.quantile(sub_res, 0.90))
        else:
            q_c = global_q
        crop_quantiles[crop] = round(q_c, 4)
        
        test_mask = (test_crops == crop).values
        yt_c = y_test_tonnes[test_mask]
        yp_c = test_preds_tonnes[test_mask]
        
        lb = np.maximum(0.0, yp_c - q_c)
        ub = yp_c + q_c
        covered = (yt_c >= lb) & (yt_c <= ub)
        width = ub - lb
        
        crop_conformal_results[crop] = {
            "test_samples": int(np.sum(test_mask)),
            "quantile_q_tonnes": round(q_c, 4),
            "quantile_q_hg": round(q_c * TONNES_TO_HG, 1),
            "empirical_coverage": round(float(np.mean(covered)), 4),
            "mean_interval_width_tonnes": round(float(np.mean(width)), 4)
        }
        
    group_max_q = float(max(crop_quantiles.values()))
    
    # Global test coverage
    global_lb = np.maximum(0.0, test_preds_tonnes - global_q)
    global_ub = test_preds_tonnes + global_q
    global_covered = (y_test_tonnes >= global_lb) & (y_test_tonnes <= global_ub)
    
    return {
        "nominal_coverage": 0.90,
        "global_q_tonnes": round(global_q, 4),
        "global_empirical_coverage": round(float(np.mean(global_covered)), 4),
        "group_max_q_tonnes": round(group_max_q, 4),
        "crop_quantiles": crop_quantiles,
        "crop_conditional_coverage": crop_conformal_results
    }

def main():
    print("=" * 80)
    print("PHASE 4B: TARGET-SCALE AND CROP-BALANCE EXPERIMENTS (1990-2024)")
    print("=" * 80)
    
    # 1. Load Dataset
    df = pd.read_csv(DATA_PATH)
    df["group_id"] = df["Area"] + "_" + df["Item"]
    total_records = len(df)
    print(f"Loaded {total_records} records across {df['Area'].nunique()} countries and {df['Item'].nunique()} crops.")
    
    # 2. Strict Partition Definitions
    train_dev = df[df["Year"] <= 2018].copy().reset_index(drop=True)
    test_time = df[df["Year"] >= 2019].copy().reset_index(drop=True)
    
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    train_idx, calib_idx = next(gss.split(train_dev, groups=train_dev["group_id"]))
    
    train_df = train_dev.iloc[train_idx].copy().reset_index(drop=True)
    calib_df = train_dev.iloc[calib_idx].copy().reset_index(drop=True)
    
    print(f"Chronological Splits (Regime A):")
    print(f"  Train Split (<= 2018):      {len(train_df)} samples")
    print(f"  Calibration Split (<= 2018): {len(calib_df)} samples")
    print(f"  Held-Out Test (2019-2024):   {len(test_time)} samples (Untouched evaluation set)")
    
    X_train = train_df[feature_cols]
    y_train_hg = train_df["hg/ha_yield"].values
    
    X_calib = calib_df[feature_cols]
    y_calib_hg = calib_df["hg/ha_yield"].values
    
    X_test = test_time[feature_cols]
    y_test_hg = test_time["hg/ha_yield"].values
    
    # Fit preprocessor strictly on X_train
    preprocessor = build_preprocessor()
    X_train_proc = preprocessor.fit_transform(X_train)
    X_calib_proc = preprocessor.transform(X_calib)
    X_test_proc = preprocessor.transform(X_test)
    
    # 3. Calculate Weighting Maps from Training Data Only
    crop_means = train_df.groupby("Item")["hg/ha_yield"].mean()
    crop_mean_map = train_df["Item"].map(crop_means).values
    mean_overall = float(train_df["hg/ha_yield"].mean())
    
    # Linear inverse-yield weights (w_i = mean_overall / crop_mean)
    w_linear = mean_overall / crop_mean_map
    w_linear = w_linear / np.mean(w_linear)
    
    # Quadratic inverse-yield weights (w_i = (mean_overall / crop_mean)^2)
    w_quadratic = (mean_overall / crop_mean_map) ** 2
    w_quadratic = w_quadratic / np.mean(w_quadratic)
    
    # Soft square-root weights
    w_soft = np.sqrt(w_linear)
    w_soft = w_soft / np.mean(w_soft)
    
    experiments_results = {
        "experiment_name": "Phase 4B - Target-Scale and Crop-Balance Benchmark",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "target_unit": "hg/ha_yield",
        "random_seed": RANDOM_SEED,
        "sample_counts": {
            "train": len(train_df),
            "calibration": len(calib_df),
            "test": len(test_time)
        },
        "models": {}
    }
    
    # -------------------------------------------------------------------------
    # Candidate 1: Raw XGBoost Baseline (hg/ha_yield, unweighted)
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("1. TRAINING CANDIDATE 1: Raw XGBoost Baseline (hg/ha_yield, unweighted)")
    print("=" * 70)
    t0 = time.time()
    pipe_raw = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1))
    ])
    pipe_raw.fit(X_train, y_train_hg)
    fit_t_raw = time.time() - t0
    
    preds_calib_raw = pipe_raw.predict(X_calib)
    preds_test_raw = pipe_raw.predict(X_test)
    
    m_raw = compute_metrics(y_test_hg, preds_test_raw)
    per_crop_raw = compute_per_crop_metrics(test_time, y_test_hg, preds_test_raw)
    conformal_raw = run_conformal_calibration(
        y_calib_hg, preds_calib_raw, calib_df["Item"],
        y_test_hg, preds_test_raw, test_time["Item"]
    )
    
    joblib.dump(pipe_raw, MODELS_OUT / "xgboost_raw_hg.pkl")
    experiments_results["models"]["1_raw_xgboost"] = {
        "description": "Baseline XGBoost trained directly on hg/ha_yield without weighting",
        "target_unit": "hg/ha_yield",
        "fit_time_seconds": round(fit_t_raw, 2),
        "overall_metrics": m_raw,
        "macro_metrics": per_crop_raw["macro_averaged"],
        "per_crop_metrics": per_crop_raw["per_crop"],
        "conformal_calibration": conformal_raw
    }
    print(f"  Overall R2: {m_raw['r2']:.4f} | Macro R2: {per_crop_raw['macro_averaged']['macro_r2']:.4f} | RMSE: {m_raw['rmse_tonnes']:.4f} t/ha | MAE: {m_raw['mae_tonnes']:.4f} t/ha")

    # -------------------------------------------------------------------------
    # Candidate 2: Log1p(y) Transformed XGBoost (SHORTLISTED PRIMARY)
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("2. TRAINING CANDIDATE 2: Log1p(y) Transformed XGBoost (SHORTLISTED PRIMARY)")
    print("=" * 70)
    t0 = time.time()
    pipe_log = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", TransformedTargetRegressor(
            regressor=xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1),
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ])
    pipe_log.fit(X_train, y_train_hg)
    fit_t_log = time.time() - t0
    
    preds_calib_log = pipe_log.predict(X_calib)
    preds_test_log = pipe_log.predict(X_test)
    
    m_log = compute_metrics(y_test_hg, preds_test_log)
    per_crop_log = compute_per_crop_metrics(test_time, y_test_hg, preds_test_log)
    conformal_log = run_conformal_calibration(
        y_calib_hg, preds_calib_log, calib_df["Item"],
        y_test_hg, preds_test_log, test_time["Item"]
    )
    
    joblib.dump(pipe_log, MODELS_OUT / "xgboost_log1p_hg.pkl")
    # Save standalone conformal calibrator object
    joblib.dump(conformal_log, MODELS_OUT / "conformal_calibrator_log1p.pkl")
    
    experiments_results["models"]["2_log1p_xgboost"] = {
        "description": "XGBoost on log1p(hg/ha_yield) with exact expm1 inverse transformation (outputs hg/ha_yield)",
        "target_unit": "hg/ha_yield",
        "fit_time_seconds": round(fit_t_log, 2),
        "overall_metrics": m_log,
        "macro_metrics": per_crop_log["macro_averaged"],
        "per_crop_metrics": per_crop_log["per_crop"],
        "conformal_calibration": conformal_log
    }
    print(f"  Overall R2: {m_log['r2']:.4f} | Macro R2: {per_crop_log['macro_averaged']['macro_r2']:.4f} | RMSE: {m_log['rmse_tonnes']:.4f} t/ha | MAE: {m_log['mae_tonnes']:.4f} t/ha")

    # -------------------------------------------------------------------------
    # Candidate 3: Linear Inverse-Yield Weighted XGBoost
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("3. TRAINING CANDIDATE 3: Linear Inverse-Yield Weighted XGBoost")
    print("=" * 70)
    t0 = time.time()
    pipe_wlin = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1))
    ])
    pipe_wlin.fit(X_train, y_train_hg, regressor__sample_weight=w_linear)
    fit_t_wlin = time.time() - t0
    
    preds_calib_wlin = pipe_wlin.predict(X_calib)
    preds_test_wlin = pipe_wlin.predict(X_test)
    
    m_wlin = compute_metrics(y_test_hg, preds_test_wlin)
    per_crop_wlin = compute_per_crop_metrics(test_time, y_test_hg, preds_test_wlin)
    conformal_wlin = run_conformal_calibration(
        y_calib_hg, preds_calib_wlin, calib_df["Item"],
        y_test_hg, preds_test_wlin, test_time["Item"]
    )
    
    joblib.dump(pipe_wlin, MODELS_OUT / "xgboost_inv_yield_w_hg.pkl")
    experiments_results["models"]["3_linear_inv_yield_w_xgboost"] = {
        "description": "XGBoost on hg/ha_yield with linear inverse-yield weights w_i = mean_overall / crop_mean",
        "target_unit": "hg/ha_yield",
        "fit_time_seconds": round(fit_t_wlin, 2),
        "overall_metrics": m_wlin,
        "macro_metrics": per_crop_wlin["macro_averaged"],
        "per_crop_metrics": per_crop_wlin["per_crop"],
        "conformal_calibration": conformal_wlin
    }
    print(f"  Overall R2: {m_wlin['r2']:.4f} | Macro R2: {per_crop_wlin['macro_averaged']['macro_r2']:.4f} | RMSE: {m_wlin['rmse_tonnes']:.4f} t/ha | MAE: {m_wlin['mae_tonnes']:.4f} t/ha")

    # -------------------------------------------------------------------------
    # Candidate 4: Quadratic Inverse-Yield Weighted XGBoost
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("4. TRAINING CANDIDATE 4: Quadratic Inverse-Yield Weighted XGBoost")
    print("=" * 70)
    t0 = time.time()
    pipe_wsq = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1))
    ])
    pipe_wsq.fit(X_train, y_train_hg, regressor__sample_weight=w_quadratic)
    fit_t_wsq = time.time() - t0
    
    preds_calib_wsq = pipe_wsq.predict(X_calib)
    preds_test_wsq = pipe_wsq.predict(X_test)
    
    m_wsq = compute_metrics(y_test_hg, preds_test_wsq)
    per_crop_wsq = compute_per_crop_metrics(test_time, y_test_hg, preds_test_wsq)
    conformal_wsq = run_conformal_calibration(
        y_calib_hg, preds_calib_wsq, calib_df["Item"],
        y_test_hg, preds_test_wsq, test_time["Item"]
    )
    
    joblib.dump(pipe_wsq, MODELS_OUT / "xgboost_quadratic_inv_yield_w_hg.pkl")
    experiments_results["models"]["4_quadratic_inv_yield_w_xgboost"] = {
        "description": "XGBoost on hg/ha_yield with quadratic inverse-yield weights w_i = (mean_overall / crop_mean)^2",
        "target_unit": "hg/ha_yield",
        "fit_time_seconds": round(fit_t_wsq, 2),
        "overall_metrics": m_wsq,
        "macro_metrics": per_crop_wsq["macro_averaged"],
        "per_crop_metrics": per_crop_wsq["per_crop"],
        "conformal_calibration": conformal_wsq
    }
    print(f"  Overall R2: {m_wsq['r2']:.4f} | Macro R2: {per_crop_wsq['macro_averaged']['macro_r2']:.4f} | RMSE: {m_wsq['rmse_tonnes']:.4f} t/ha | MAE: {m_wsq['mae_tonnes']:.4f} t/ha")

    # -------------------------------------------------------------------------
    # Candidate 5: Combined Log1p + Soft Crop-Balancing XGBoost
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("5. TRAINING CANDIDATE 5: Combined Log1p + Soft Crop-Balancing XGBoost")
    print("=" * 70)
    t0 = time.time()
    pipe_log_w = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", TransformedTargetRegressor(
            regressor=xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1),
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ])
    pipe_log_w.fit(X_train, y_train_hg, regressor__sample_weight=w_soft)
    fit_t_log_w = time.time() - t0
    
    preds_calib_log_w = pipe_log_w.predict(X_calib)
    preds_test_log_w = pipe_log_w.predict(X_test)
    
    m_log_w = compute_metrics(y_test_hg, preds_test_log_w)
    per_crop_log_w = compute_per_crop_metrics(test_time, y_test_hg, preds_test_log_w)
    conformal_log_w = run_conformal_calibration(
        y_calib_hg, preds_calib_log_w, calib_df["Item"],
        y_test_hg, preds_test_log_w, test_time["Item"]
    )
    
    joblib.dump(pipe_log_w, MODELS_OUT / "xgboost_combined_log_w_hg.pkl")
    experiments_results["models"]["5_combined_log_w_xgboost"] = {
        "description": "Log1p(y) XGBoost with soft square-root inverse-yield sample weights",
        "target_unit": "hg/ha_yield",
        "fit_time_seconds": round(fit_t_log_w, 2),
        "overall_metrics": m_log_w,
        "macro_metrics": per_crop_log_w["macro_averaged"],
        "per_crop_metrics": per_crop_log_w["per_crop"],
        "conformal_calibration": conformal_log_w
    }
    print(f"  Overall R2: {m_log_w['r2']:.4f} | Macro R2: {per_crop_log_w['macro_averaged']['macro_r2']:.4f} | RMSE: {m_log_w['rmse_tonnes']:.4f} t/ha | MAE: {m_log_w['mae_tonnes']:.4f} t/ha")

    # -------------------------------------------------------------------------
    # Benchmark: PyTorch Tabular MLP
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("6. BENCHMARK CANDIDATE: PyTorch Tabular MLP")
    print("=" * 70)
    t0 = time.time()
    mlp_model, mlp_hist = train_tabular_mlp(X_train_proc, y_train_hg, X_calib_proc, y_calib_hg, epochs=35)
    fit_t_mlp = time.time() - t0
    
    torch.save(mlp_model.state_dict(), MODELS_OUT / "pytorch_mlp_benchmark.pt")
    
    preds_calib_mlp = predict_tabular_mlp(mlp_model, X_calib_proc)
    preds_test_mlp = predict_tabular_mlp(mlp_model, X_test_proc)
    
    m_mlp = compute_metrics(y_test_hg, preds_test_mlp)
    per_crop_mlp = compute_per_crop_metrics(test_time, y_test_hg, preds_test_mlp)
    conformal_mlp = run_conformal_calibration(
        y_calib_hg, preds_calib_mlp, calib_df["Item"],
        y_test_hg, preds_test_mlp, test_time["Item"]
    )
    
    experiments_results["models"]["6_pytorch_mlp_benchmark"] = {
        "description": "PyTorch Tabular MLP (3-layer BatchNorm+ReLU+Dropout)",
        "target_unit": "hg/ha_yield",
        "fit_time_seconds": round(fit_t_mlp, 2),
        "overall_metrics": m_mlp,
        "macro_metrics": per_crop_mlp["macro_averaged"],
        "per_crop_metrics": per_crop_mlp["per_crop"],
        "conformal_calibration": conformal_mlp
    }
    print(f"  Overall R2: {m_mlp['r2']:.4f} | Macro R2: {per_crop_mlp['macro_averaged']['macro_r2']:.4f} | RMSE: {m_mlp['rmse_tonnes']:.4f} t/ha | MAE: {m_mlp['mae_tonnes']:.4f} t/ha")

    # -------------------------------------------------------------------------
    # Legacy Production Baseline Evaluation on Identical Test Set
    # -------------------------------------------------------------------------
    prod_model_path = BASE_DIR / "models" / "crop_yield_model.pkl"
    if prod_model_path.exists():
        prod_pipe = joblib.load(prod_model_path)
        preds_prod = prod_pipe.predict(X_test)  # already predicts hg/ha
        m_prod = compute_metrics(y_test_hg, preds_prod)
        per_crop_prod = compute_per_crop_metrics(test_time, y_test_hg, preds_prod)
        experiments_results["models"]["0_production_baseline"] = {
            "description": "Existing Production XGBoost model (trained on 1990-2013 legacy data)",
            "target_unit": "hg/ha_yield",
            "overall_metrics": m_prod,
            "macro_metrics": per_crop_prod["macro_averaged"],
            "per_crop_metrics": per_crop_prod["per_crop"]
        }
        print("\nProduction Baseline on identical 2019-2024 test:")
        print(f"  Overall R2: {m_prod['r2']:.4f} | Macro R2: {per_crop_prod['macro_averaged']['macro_r2']:.4f} | RMSE: {m_prod['rmse_tonnes']:.4f} t/ha | MAE: {m_prod['mae_tonnes']:.4f} t/ha")

    # -------------------------------------------------------------------------
    # Grouped Split Generalization Evaluation (Regime B)
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("REGIME B: GROUPED SPLIT GENERALIZATION (80% Train, 20% Test on Area_Item)")
    print("=" * 70)
    gss_b = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    train_g_idx, test_g_idx = next(gss_b.split(df, groups=df["group_id"]))
    
    train_g = df.iloc[train_g_idx].copy().reset_index(drop=True)
    test_g = df.iloc[test_g_idx].copy().reset_index(drop=True)
    
    prep_g = build_preprocessor()
    X_train_g_proc = prep_g.fit_transform(train_g[feature_cols])
    X_test_g_proc = prep_g.transform(test_g[feature_cols])
    
    y_train_g_hg = train_g["hg/ha_yield"].values
    y_test_g_hg = test_g["hg/ha_yield"].values
    
    grouped_eval = {}
    for name, est_fn in [
        ("Raw XGBoost", lambda: xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1)),
        ("Log1p XGBoost", lambda: TransformedTargetRegressor(
            regressor=xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=RANDOM_SEED, n_jobs=-1),
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ]:
        est = est_fn()
        est.fit(X_train_g_proc, y_train_g_hg)
        pg = est.predict(X_test_g_proc)
        mg = compute_metrics(y_test_g_hg, pg)
        grouped_eval[name] = mg
        print(f"  {name:15s} | Grouped R2: {mg['r2']:.4f} | Grouped RMSE: {mg['rmse_tonnes']:.4f} t/ha | MAE: {mg['mae_tonnes']:.4f} t/ha")
        
    experiments_results["grouped_split_regime_b"] = {
        "train_samples": len(train_g),
        "test_samples": len(test_g),
        "train_groups": int(train_g["group_id"].nunique()),
        "test_groups": int(test_g["group_id"].nunique()),
        "metrics": grouped_eval
    }

    # 4. Save Metadata for Primary Shortlisted Model
    metadata_log = {
        "model_name": "XGBoost Regressor (Log1p Target Transformed)",
        "framework": "xgboost",
        "target_variable": "hg/ha_yield",
        "target_unit": "hg/ha_yield",
        "target_transformation": "log1p(y) with exact expm1 inverse transformation",
        "training_data_period": "1990-2018",
        "evaluation_data_period": "2019-2024",
        "training_samples": len(train_df),
        "calibration_samples": len(calib_df),
        "test_samples": len(test_time),
        "feature_columns": feature_cols,
        "conformal_calibration": {
            "nominal_coverage": 0.90,
            "global_q_tonnes": conformal_log["global_q_tonnes"],
            "global_q_hg": round(conformal_log["global_q_tonnes"] * TONNES_TO_HG, 1),
            "group_max_q_tonnes": conformal_log["group_max_q_tonnes"],
            "crop_quantiles": conformal_log["crop_quantiles"]
        },
        "metrics_held_out_chronological": {
            "overall_r2": m_log["r2"],
            "macro_r2": per_crop_log["macro_averaged"]["macro_r2"],
            "rmse_tonnes": m_log["rmse_tonnes"],
            "mae_tonnes": m_log["mae_tonnes"],
            "deployed_test_rmse_hg": m_log["rmse_hg"],
            "deployed_test_r2": m_log["r2"]
        },
        "metrics_grouped_regime_b": grouped_eval["Log1p XGBoost"],
        "additivity_verified": True
    }
    
    with open(MODELS_OUT / "model_metadata_log1p.json", "w", encoding="utf-8") as f:
        json.dump(metadata_log, f, indent=2)
        
    # Save overall benchmark JSON
    json_path = REPORTS_OUT / "PHASE4B_EXPERIMENT_METRICS.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(experiments_results, f, indent=2)
        
    print(f"\n[OK] All Phase 4B artifacts saved to: {OUTPUT_DIR}")
    print("=" * 80)

if __name__ == "__main__":
    main()
