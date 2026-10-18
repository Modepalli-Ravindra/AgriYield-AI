import sklearn
"""Independent Verification Script for Crop Yield Research Framework (Phase 3)."""
import os, sys, json, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, KFold, GroupKFold
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import torch

from app.ml.dl_model import train_dl_mlp, predict_dl_mlp
from app.ml.conformal import ConformalPredictionCalibrator
from app.ml.robustness import run_missingness_experiment, run_noise_experiment
import shap

print("--- STARTING INDEPENDENT VERIFICATION ---")
data_path = "data/yield_df.csv"
df = pd.read_csv(data_path)
if "Unnamed: 0" in df.columns:
    df = df.drop(columns=["Unnamed: 0"])

raw_shape = df.shape
df_clean = df.drop_duplicates().reset_index(drop=True)
clean_shape = df_clean.shape
print(f"Data audit: Raw shape={raw_shape}, Clean shape={clean_shape}, Duplicates removed={raw_shape[0]-clean_shape[0]}")

features = ["Area", "Item", "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
target = "hg/ha_yield"
X = df_clean[features]
y = df_clean[target]

# -------------------------------------------------------------
# 1. Reproduce Random Split Baseline (Phase 2 Split: 80/20 seed 42)
# -------------------------------------------------------------
print("\n[1/5] Evaluating Phase 2 Standard Random Split (80/20)...")
X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
X_train, X_calib, y_train, y_calib = train_test_split(X_dev, y_dev, test_size=0.20, random_state=42)

categorical = ["Area", "Item"]
numeric = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric),
        ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), categorical)
    ]
)
X_train_proc = preprocessor.fit_transform(X_train)
X_calib_proc = preprocessor.transform(X_calib)
X_test_proc = preprocessor.transform(X_test)

# Train RF
rf = RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
rf.fit(X_train_proc, y_train.values)
rf_test_pred = rf.predict(X_test_proc)

# Train XGB
xgb_m = xgb.XGBRegressor(
    n_estimators=300, max_depth=8, learning_rate=0.08,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1,
    objective="reg:squarederror"
)
xgb_m.fit(X_train_proc, y_train.values)
xgb_test_pred = xgb_m.predict(X_test_proc)

# Train LGBM
lgb_m = lgb.LGBMRegressor(
    n_estimators=300, num_leaves=63, learning_rate=0.08,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1, verbose=-1
)
lgb_m.fit(X_train_proc, y_train.values)
lgb_test_pred = lgb_m.predict(X_test_proc)

# Train PyTorch Tabular MLP
dl_m, _ = train_dl_mlp(
    X_train_proc, y_train.values,
    X_val=X_calib_proc, y_val=y_calib.values,
    epochs=25, batch_size=128, lr=0.003,
    save_path=Path("models/dl_mlp_model.pt")
)
dl_test_pred = predict_dl_mlp(dl_m, X_test_proc)

# Out-of-fold calibration predictions for Stacking
rf_calib = rf.predict(X_calib_proc)
xgb_calib = xgb_m.predict(X_calib_proc)
lgb_calib = lgb_m.predict(X_calib_proc)
dl_calib = predict_dl_mlp(dl_m, X_calib_proc)

S_calib = np.column_stack([rf_calib, xgb_calib, lgb_calib, dl_calib])
S_test = np.column_stack([rf_test_pred, xgb_test_pred, lgb_test_pred, dl_test_pred])

meta_m = RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0])
meta_m.fit(S_calib, y_calib.values)
ens_test_pred = meta_m.predict(S_test)

def calc_metrics(y_true, y_pred):
    return {
        "r2": float(r2_score(y_true, y_pred)),
        "rmse_tonnes": float(np.sqrt(mean_squared_error(y_true, y_pred)) / 10000.0),
        "mae_tonnes": float(mean_absolute_error(y_true, y_pred) / 10000.0)
    }

random_results = {
    "random_forest": calc_metrics(y_test, rf_test_pred),
    "xgboost": calc_metrics(y_test, xgb_test_pred),
    "lightgbm": calc_metrics(y_test, lgb_test_pred),
    "pytorch_mlp": calc_metrics(y_test, dl_test_pred),
    "stacking_ensemble": calc_metrics(y_test, ens_test_pred)
}
print("Random split reproduction results:")
print(json.dumps(random_results, indent=2))

# -------------------------------------------------------------
# 2. Chronological Split (Train <= 2008, Test 2009-2013)
# -------------------------------------------------------------
print("\n[2/5] Evaluating Chronological Split (Train <= 2008, Test 2009-2013)...")
train_mask = df_clean["Year"] <= 2008
test_mask = df_clean["Year"] >= 2009

X_chrono_train, y_chrono_train = X[train_mask], y[train_mask]
X_chrono_test, y_chrono_test = X[test_mask], y[test_mask]
print(f"Chrono Split counts: Train={len(X_chrono_train)} ({len(X_chrono_train)/len(df_clean)*100:.1f}%), Test={len(X_chrono_test)} ({len(X_chrono_test)/len(df_clean)*100:.1f}%)")

prep_chrono = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric),
        ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), categorical)
    ]
)
X_c_tr_proc = prep_chrono.fit_transform(X_chrono_train)
X_c_te_proc = prep_chrono.transform(X_chrono_test)

# Evaluate RF on Chrono
rf_chrono = RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
rf_chrono.fit(X_c_tr_proc, y_chrono_train.values)
rf_c_preds = rf_chrono.predict(X_c_te_proc)

# Evaluate XGB on Chrono
xgb_chrono = xgb.XGBRegressor(
    n_estimators=300, max_depth=8, learning_rate=0.08,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1
)
xgb_chrono.fit(X_c_tr_proc, y_chrono_train.values)
xgb_c_preds = xgb_chrono.predict(X_c_te_proc)

chrono_results = {
    "split_info": {"train_years": "1990-2008", "test_years": "2009-2013", "train_n": int(len(X_chrono_train)), "test_n": int(len(X_chrono_test))},
    "random_forest": calc_metrics(y_chrono_test, rf_c_preds),
    "xgboost": calc_metrics(y_chrono_test, xgb_c_preds)
}
print("Chronological split results:")
print(json.dumps(chrono_results, indent=2))

# -------------------------------------------------------------
# 3. Grouped Split (Geographic Generalization: Hold Out Countries)
# -------------------------------------------------------------
print("\n[3/5] Evaluating Grouped Geographic Split (Hold Out 20% of Countries)...")
gkf = GroupKFold(n_splits=5)
train_idx, test_idx = next(gkf.split(X, y, groups=df_clean["Area"]))
X_geo_train, y_geo_train = X.iloc[train_idx], y.iloc[train_idx]
X_geo_test, y_geo_test = X.iloc[test_idx], y.iloc[test_idx]

held_out_countries = sorted(X_geo_test["Area"].unique().tolist())
print(f"Grouped Split counts: Train={len(X_geo_train)}, Test={len(X_geo_test)}, Held-out countries={len(held_out_countries)}")

prep_geo = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric),
        ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), categorical)
    ]
)
X_g_tr_proc = prep_geo.fit_transform(X_geo_train)
X_g_te_proc = prep_geo.transform(X_geo_test)

rf_geo = RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
rf_geo.fit(X_g_tr_proc, y_geo_train.values)
rf_g_preds = rf_geo.predict(X_g_te_proc)

xgb_geo = xgb.XGBRegressor(
    n_estimators=300, max_depth=8, learning_rate=0.08,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1
)
xgb_geo.fit(X_g_tr_proc, y_geo_train.values)
xgb_g_preds = xgb_geo.predict(X_g_te_proc)

geo_results = {
    "split_info": {"held_out_countries_count": len(held_out_countries), "train_n": len(X_geo_train), "test_n": len(X_geo_test)},
    "random_forest": calc_metrics(y_geo_test, rf_g_preds),
    "xgboost": calc_metrics(y_geo_test, xgb_g_preds)
}
print("Grouped Geographic split results:")
print(json.dumps(geo_results, indent=2))

# -------------------------------------------------------------
# 4. Conformal Prediction Coverage Verification & Subgroup Analysis
# -------------------------------------------------------------
print("\n[4/5] Evaluating Conformal Uncertainty Quantification...")
calibrator = ConformalPredictionCalibrator(nominal_coverage=0.90)
calib_preds = meta_m.predict(S_calib)
calibrator.fit(y_calib.values, calib_preds)
overall_uq = calibrator.evaluate_test(y_test.values, ens_test_pred)

# Subgroup breakdowns
y_test_t = y_test.values / 10000.0
ens_t = ens_test_pred / 10000.0
lowers = np.maximum(0.0, ens_t - calibrator.quantile_q)
uppers = ens_t + calibrator.quantile_q
covered = (y_test_t >= lowers) & (y_test_t <= uppers)

# By Crop
crop_coverage = {}
for crop in df_clean["Item"].unique():
    mask = (X_test["Item"] == crop).values
    if np.sum(mask) > 0:
        crop_coverage[crop] = {
            "n": int(np.sum(mask)),
            "coverage": float(np.mean(covered[mask])),
            "avg_yield_t": float(np.mean(y_test_t[mask]))
        }

# By Yield Range (Tiers)
q33, q66 = np.quantile(y_test_t, [0.33, 0.66])
tier_coverage = {
    "low_yield (< 33rd pct)": float(np.mean(covered[y_test_t < q33])),
    "mid_yield (33rd-66th pct)": float(np.mean(covered[(y_test_t >= q33) & (y_test_t < q66)])),
    "high_yield (>= 66th pct)": float(np.mean(covered[y_test_t >= q66]))
}

# Coverage under Chronological distribution shift (exchangeability violation test)
c_calib_mask = (X_chrono_train["Year"] >= 2005) & (X_chrono_train["Year"] <= 2008)
c_calib_y = y_chrono_train[c_calib_mask].values
c_calib_preds = xgb_chrono.predict(prep_chrono.transform(X_chrono_train[c_calib_mask]))

chrono_calibrator = ConformalPredictionCalibrator(nominal_coverage=0.90)
chrono_calibrator.fit(c_calib_y, c_calib_preds)
chrono_uq_shift = chrono_calibrator.evaluate_test(y_chrono_test.values, xgb_c_preds)

conformal_results = {
    "overall": overall_uq,
    "by_crop": crop_coverage,
    "by_yield_tier": tier_coverage,
    "under_temporal_shift": {
        "calibration_years": "2005-2008",
        "test_years": "2009-2013",
        "nominal_coverage": 0.90,
        "empirical_coverage": chrono_uq_shift["empirical_coverage"],
        "quantile_q": chrono_uq_shift["conformal_quantile_q"]
    }
}
print("Conformal UQ results:")
print(f"Overall Coverage: {overall_uq['empirical_coverage']*100:.2f}%, Q={overall_uq['conformal_quantile_q']:.3f} t/ha")
print(f"Under Temporal Shift (2009-2013): Coverage={chrono_uq_shift['empirical_coverage']*100:.2f}%, Q={chrono_uq_shift['conformal_quantile_q']:.3f} t/ha")

# -------------------------------------------------------------
# 5. Robustness & SHAP Audit
# -------------------------------------------------------------
print("\n[5/5] Auditing Robustness & SHAP Attribution...")
from sklearn.pipeline import Pipeline
full_pipe = Pipeline([("preprocessor", preprocessor), ("regressor", xgb_m)])

mcar_res = run_missingness_experiment(full_pipe, X_test, y_test, mechanism="MCAR", seed=42)
mar_res = run_missingness_experiment(full_pipe, X_test, y_test, mechanism="MAR", seed=42)
noise_res = run_noise_experiment(full_pipe, X_test, y_test, seed=42)

# SHAP vs Proxy Comparison
explainer = shap.TreeExplainer(xgb_m)
sample_proc = X_test_proc[:5]
real_shap = explainer.shap_values(sample_proc)
print("TreeSHAP calculated successfully for sample rows.")

full_experiment_results = {
    "metadata": {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "python_version": sys.version,
        "torch_version": torch.__version__,
        "sklearn_version": sklearn.__version__,
        "raw_samples": raw_shape[0],
        "clean_samples": clean_shape[0],
        "duplicates_removed": raw_shape[0] - clean_shape[0]
    },
    "random_split_benchmarks": random_results,
    "chronological_generalization": chrono_results,
    "geographic_generalization": geo_results,
    "conformal_uq": conformal_results,
    "robustness": {
        "mcar": mcar_res["degradation_curve"],
        "mar": mar_res["degradation_curve"],
        "sensor_noise": noise_res["degradation_curve"]
    }
}

with open("PHASE3_EXPERIMENT_RESULTS.json", "w", encoding="utf-8") as f:
    json.dump(full_experiment_results, f, indent=2)

print("\n--- ALL INDEPENDENT EXPERIMENTS COMPLETED AND SAVED TO PHASE3_EXPERIMENT_RESULTS.json ---")


