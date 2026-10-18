import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from app.ml.conformal import ConformalPredictionCalibrator
import joblib

df_raw = pd.read_csv("data/yield_df.csv")
if "Unnamed: 0" in df_raw.columns: df_raw = df_raw.drop(columns=["Unnamed: 0"])
df = df_raw.drop_duplicates().reset_index(drop=True)

features = ["Area", "Item", "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
target = "hg/ha_yield"
X = df[features]
y = df[target]

X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
X_train, X_calib, y_train, y_calib = train_test_split(X_dev, y_dev, test_size=0.20, random_state=42)

# Load pipeline or meta-model
calibrator = ConformalPredictionCalibrator.load("models/conformal_calibrator.pkl")
print(f"Fitted Conformal Quantile Q: {calibrator.quantile_q} t/ha")

# Evaluate directly with saved pipeline
pipeline = joblib.load("models/crop_yield_model.pkl")
test_preds_hg = pipeline.predict(X_test)
test_preds_t = test_preds_hg / 10000.0
y_test_t = y_test.values / 10000.0

# 1. Unclipped bounds
lowers_unclipped = test_preds_t - calibrator.quantile_q
uppers = test_preds_t + calibrator.quantile_q
cov_unclipped = np.mean((y_test_t >= lowers_unclipped) & (y_test_t <= uppers))

# 2. Clipped bounds
lowers_clipped = np.maximum(0.0, lowers_unclipped)
cov_clipped = np.mean((y_test_t >= lowers_clipped) & (y_test_t <= uppers))

print(f"Coverage Unclipped: {cov_unclipped*100:.3f}%")
print(f"Coverage Clipped at 0: {cov_clipped*100:.3f}%")
print("Does clipping at 0 change empirical coverage?", cov_unclipped != cov_clipped)

# Check negative yield count in y_test
print(f"Any negative actual yields in test set: {(y_test_t < 0).any()}")
print(f"Observations where lower unclipped was < 0: {np.sum(lowers_unclipped < 0)} out of {len(y_test_t)} ({np.mean(lowers_unclipped < 0)*100:.2f}%)")

# Compare calibration residuals vs test residuals
calib_preds_hg = pipeline.predict(X_calib)
calib_res = np.abs(y_calib.values / 10000.0 - calib_preds_hg / 10000.0)
test_res = np.abs(y_test_t - test_preds_t)

print(f"Calibration Residuals: Mean={np.mean(calib_res):.4f}, 90th pct={np.quantile(calib_res, 0.90):.4f}, Max={np.max(calib_res):.4f}")
print(f"Test Residuals:        Mean={np.mean(test_res):.4f}, 90th pct={np.quantile(test_res, 0.90):.4f}, Max={np.max(test_res):.4f}")

# Quantile indexing formula verification:
n = len(calib_res)
alpha = 0.10
p_level = np.ceil((n + 1) * (1 - alpha)) / n
q_calc = np.quantile(calib_res, min(1.0, p_level))
print(f"Calibration size n = {n}")
print(f"p_level = ceil(({n}+1)*0.90)/{n} = {p_level:.6f}")
print(f"Calculated Q from calibration residuals: {q_calc:.4f}")
print(f"Empirical fraction of test residuals <= Q_calc: {np.mean(test_res <= q_calc)*100:.3f}%")

