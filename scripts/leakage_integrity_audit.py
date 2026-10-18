"""Comprehensive Leakage, Calibration Separation, and Evaluation Integrity Audit (Phase 3.2)."""
import os, sys, json, time
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GroupShuffleSplit, GroupKFold
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import torch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.ml.dl_model import train_dl_mlp, predict_dl_mlp
from app.ml.conformal import ConformalPredictionCalibrator

print("=" * 80)
print("PHASE 3.2: EVALUATION INTEGRITY & RELIABILITY CORRECTION AUDIT")
print("=" * 80)

data_path = "data/yield_df.csv"
df_raw = pd.read_csv(data_path)
if "Unnamed: 0" in df_raw.columns:
    df_raw = df_raw.drop(columns=["Unnamed: 0"])
df_clean = df_raw.drop_duplicates().reset_index(drop=True)

# ----------------------------------------------------------------------
# TASK 1: INVESTIGATE REPEATED-LABEL LEAKAGE (Area, Item, Year)
# ----------------------------------------------------------------------
print("\n--- TASK 1: INVESTIGATING (Area, Item, Year) TUPLE GROUPS ---")
df_clean["group_id"] = df_clean["Area"] + "_" + df_clean["Item"] + "_" + df_clean["Year"].astype(str)

total_rows = len(df_clean)
unique_groups = df_clean["group_id"].nunique()
group_counts = df_clean["group_id"].value_counts()
repeated_groups = (group_counts > 1).sum()
single_groups = (group_counts == 1).sum()

print(f"Total clean rows: {total_rows}")
print(f"Total unique (Area, Item, Year) groups: {unique_groups}")
print(f"Groups with single observation (count = 1): {single_groups} ({single_groups/unique_groups*100:.1f}%)")
print(f"Groups with repeated observations (count > 1): {repeated_groups} ({repeated_groups/unique_groups*100:.1f}%)")
print(f"Group size distribution: min={group_counts.min()}, median={group_counts.median()}, max={group_counts.max()}, mean={group_counts.mean():.2f}")

# Check yield label consistency within groups
yield_variance_per_group = df_clean.groupby("group_id")["hg/ha_yield"].nunique()
varying_yields_within_group = (yield_variance_per_group > 1).sum()
print(f"Groups where identical environmental tuples have DIFFERENT yield labels: {varying_yields_within_group}")

# Check environmental variation within repeated groups
temp_variance_per_group = df_clean.groupby("group_id")["avg_temp"].nunique()
varying_temp_within_group = (temp_variance_per_group > 1).sum()
print(f"Repeated groups with VARYING weather temperatures: {varying_temp_within_group} out of {repeated_groups}")

# Check group crossing in standard random split
features = ["Area", "Item", "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
target = "hg/ha_yield"
X = df_clean[features]
y = df_clean[target]

X_dev, X_test, y_dev, y_test = train_test_split(df_clean, df_clean[target], test_size=0.20, random_state=42)
X_train, X_calib, y_train, y_calib = train_test_split(X_dev, y_dev, test_size=0.20, random_state=42)

train_groups = set(X_train["group_id"])
calib_groups = set(X_calib["group_id"])
test_groups = set(X_test["group_id"])

test_groups_in_train = test_groups.intersection(train_groups)
test_groups_in_calib = test_groups.intersection(calib_groups)
calib_groups_in_train = calib_groups.intersection(train_groups)

print(f"\nRandom Split Group Crossing Audit:")
print(f"  Test unique groups: {len(test_groups)}")
print(f"  Test groups that ALSO appear in Train: {len(test_groups_in_train)} ({len(test_groups_in_train)/len(test_groups)*100:.2f}%)")
print(f"  Test groups that ALSO appear in Calib: {len(test_groups_in_calib)} ({len(test_groups_in_calib)/len(test_groups)*100:.2f}%)")
print(f"  Calib groups that ALSO appear in Train: {len(calib_groups_in_train)} ({len(calib_groups_in_train)/len(calib_groups)*100:.2f}%)")
print(f"  Rows in Test belonging to a Train group: {X_test['group_id'].isin(train_groups).sum()} / {len(X_test)} ({X_test['group_id'].isin(train_groups).mean()*100:.2f}%)")

# ----------------------------------------------------------------------
# TASK 1B: DESIGN LEAKAGE-AWARE GROUPED (Area, Item, Year) EVALUATION
# ----------------------------------------------------------------------
print("\n--- DESIGNING LEAKAGE-AWARE GROUPED SPLIT ---")
# GroupShuffleSplit ensures that ALL rows with the same (Area, Item, Year) stay in the same split!
gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
dev_idx, test_grp_idx = next(gss.split(df_clean, groups=df_clean["group_id"]))

df_dev_grp = df_clean.iloc[dev_idx].reset_index(drop=True)
df_test_grp = df_clean.iloc[test_grp_idx].reset_index(drop=True)

# Further split dev into train and calib with GroupShuffleSplit
gss_calib = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
train_grp_idx, calib_grp_idx = next(gss_calib.split(df_dev_grp, groups=df_dev_grp["group_id"]))

df_train_grp = df_dev_grp.iloc[train_grp_idx].reset_index(drop=True)
df_calib_grp = df_dev_grp.iloc[calib_grp_idx].reset_index(drop=True)

print(f"Leakage-Aware Grouped Split Sizes:")
print(f"  Train: {len(df_train_grp)} rows ({df_train_grp['group_id'].nunique()} groups)")
print(f"  Calib: {len(df_calib_grp)} rows ({df_calib_grp['group_id'].nunique()} groups)")
print(f"  Test:  {len(df_test_grp)} rows ({df_test_grp['group_id'].nunique()} groups)")

grp_train_set = set(df_train_grp["group_id"])
grp_calib_set = set(df_calib_grp["group_id"])
grp_test_set = set(df_test_grp["group_id"])

print("Verification of Disjoint Groups:")
print(f"  Train & Test group overlap: {len(grp_train_set.intersection(grp_test_set))}")
print(f"  Train & Calib group overlap: {len(grp_train_set.intersection(grp_calib_set))}")
print(f"  Calib & Test group overlap: {len(grp_calib_set.intersection(grp_test_set))}")

# Evaluate Models on Leakage-Aware Grouped Split
categorical = ["Area", "Item"]
numeric = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
prep_grp = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric),
        ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), categorical)
    ]
)

X_tr_grp_proc = prep_grp.fit_transform(df_train_grp[features])
X_te_grp_proc = prep_grp.transform(df_test_grp[features])

rf_grp = RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
rf_grp.fit(X_tr_grp_proc, df_train_grp[target].values)
rf_grp_preds = rf_grp.predict(X_te_grp_proc)

xgb_grp = xgb.XGBRegressor(
    n_estimators=300, max_depth=8, learning_rate=0.08,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1
)
xgb_grp.fit(X_tr_grp_proc, df_train_grp[target].values)
xgb_grp_preds = xgb_grp.predict(X_te_grp_proc)

def calc_m(y_true, y_pred):
    return {
        "r2": float(r2_score(y_true, y_pred)),
        "rmse_tonnes": float(np.sqrt(mean_squared_error(y_true, y_pred)) / 10000.0),
        "mae_tonnes": float(mean_absolute_error(y_true, y_pred) / 10000.0)
    }

grp_rf_m = calc_m(df_test_grp[target], rf_grp_preds)
grp_xgb_m = calc_m(df_test_grp[target], xgb_grp_preds)

print(f"\nLeakage-Aware Grouped (Area, Item, Year) Results:")
print(f"  Random Forest: R2={grp_rf_m['r2']:.4f}, RMSE={grp_rf_m['rmse_tonnes']:.3f} t/ha, MAE={grp_rf_m['mae_tonnes']:.3f} t/ha")
print(f"  XGBoost:       R2={grp_xgb_m['r2']:.4f}, RMSE={grp_xgb_m['rmse_tonnes']:.3f} t/ha, MAE={grp_xgb_m['mae_tonnes']:.3f} t/ha")

# ----------------------------------------------------------------------
# TASK 2: AUDIT STACKING AND CONFORMAL CALIBRATION SEPARATION
# ----------------------------------------------------------------------
print("\n--- TASK 2: AUDITING STACKING & CONFORMAL CALIBRATION DATA FLOW ---")
print("In app/ml/train_all.py lines 135-165:")
print("  Line 144: meta_regressor.fit(S_calib, y_calib.values)")
print("  Line 158: calib_preds = meta_regressor.predict(S_calib)")
print("  Line 159: conformal_calibrator.fit(y_calib.values, calib_preds)")
print("CRITICAL AUDIT FINDING: S_calib and y_calib were used BOTH to fit the meta-regressor AND to calibrate the conformal quantile!")
print("Because the meta-model had already fitted its coefficients to minimize residuals on y_calib, computing nonconformity residuals on that same split violates conformal prediction's requirement that the predictor must not be trained on the calibration set!")

# Corrected 4-Way Strictly Disjoint Split
print("\nDesigning Corrected 4-Way Disjoint Split for Stacking & Conformal Calibration:")
# Total df_clean = 25,932 rows
# 1. Held-out Test Set (20% = ~5,187)
# 2. Conformal Calibration Set (15% = ~3,890)
# 3. Meta-Model Training Set (15% = ~3,890)
# 4. Base Models Training Set (50% = ~12,965)

# We use GroupShuffleSplit to also prevent group leakage!
gss1 = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
dev4_idx, test4_idx = next(gss1.split(df_clean, groups=df_clean["group_id"]))
df_dev4 = df_clean.iloc[dev4_idx].reset_index(drop=True)
df_test4 = df_clean.iloc[test4_idx].reset_index(drop=True)

# Split remaining 80% into: 18.75% Conformal Calib (15% of total), and 81.25% (65% of total)
gss2 = GroupShuffleSplit(n_splits=1, test_size=0.1875, random_state=42)
train_meta_idx, calib4_idx = next(gss2.split(df_dev4, groups=df_dev4["group_id"]))
df_train_meta4 = df_dev4.iloc[train_meta_idx].reset_index(drop=True)
df_calib4 = df_dev4.iloc[calib4_idx].reset_index(drop=True)

# Split df_train_meta4 into Meta-Training (23% of this subset = 15% of total) and Base Training (50% of total)
gss3 = GroupShuffleSplit(n_splits=1, test_size=0.2308, random_state=42)
base4_idx, meta4_idx = next(gss3.split(df_train_meta4, groups=df_train_meta4["group_id"]))
df_base4 = df_train_meta4.iloc[base4_idx].reset_index(drop=True)
df_meta4 = df_train_meta4.iloc[meta4_idx].reset_index(drop=True)

print(f"4-Way Disjoint Split Sizes:")
print(f"  1. Base Models Training:       {len(df_base4)} rows ({df_base4['group_id'].nunique()} groups)")
print(f"  2. Meta-Model Training:        {len(df_meta4)} rows ({df_meta4['group_id'].nunique()} groups)")
print(f"  3. Conformal Calibration:      {len(df_calib4)} rows ({df_calib4['group_id'].nunique()} groups)")
print(f"  4. Final Held-Out Test Set:    {len(df_test4)} rows ({df_test4['group_id'].nunique()} groups)")

# Verify 100% disjoint groups across all 4 sets
g_base = set(df_base4["group_id"])
g_meta = set(df_meta4["group_id"])
g_calib = set(df_calib4["group_id"])
g_test = set(df_test4["group_id"])

print("Overlap Check:")
print(f"  Base & Meta:    {len(g_base.intersection(g_meta))}")
print(f"  Base & Calib:   {len(g_base.intersection(g_calib))}")
print(f"  Meta & Calib:   {len(g_meta.intersection(g_calib))}")
print(f"  Any & Test:     {len((g_base | g_meta | g_calib).intersection(g_test))}")

# Train with Corrected 4-Way Disjoint Split
prep4 = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric),
        ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), categorical)
    ]
)
X_base_proc = prep4.fit_transform(df_base4[features])
X_meta_proc = prep4.transform(df_meta4[features])
X_calib_proc = prep4.transform(df_calib4[features])
X_test_proc = prep4.transform(df_test4[features])

# 1. Fit Base Models on df_base4
rf4 = RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
rf4.fit(X_base_proc, df_base4[target].values)

xgb4 = xgb.XGBRegressor(n_estimators=300, max_depth=8, learning_rate=0.08, subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1)
xgb4.fit(X_base_proc, df_base4[target].values)

lgb4 = lgb.LGBMRegressor(n_estimators=300, num_leaves=63, learning_rate=0.08, subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1, verbose=-1)
lgb4.fit(X_base_proc, df_base4[target].values)

# 2. Generate Out-of-Sample Predictions on df_meta4 to train Meta-Learner
S_meta4 = np.column_stack([
    rf4.predict(X_meta_proc),
    xgb4.predict(X_meta_proc),
    lgb4.predict(X_meta_proc)
])
meta4 = RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0])
meta4.fit(S_meta4, df_meta4[target].values)

# 3. Generate Predictions on df_calib4 (completely disjoint from meta-training!) to Calibrate Conformal Predictor
S_calib4 = np.column_stack([
    rf4.predict(X_calib_proc),
    xgb4.predict(X_calib_proc),
    lgb4.predict(X_calib_proc)
])
calib4_preds = meta4.predict(S_calib4)

calibrator4 = ConformalPredictionCalibrator(nominal_coverage=0.90)
calibrator4.fit(df_calib4[target].values, calib4_preds)
print(f"\nCorrected Disjoint Calibrated Margin Q: {calibrator4.quantile_q:.4f} t/ha")

# 4. Final Evaluation on Untouched df_test4
S_test4 = np.column_stack([
    rf4.predict(X_test_proc),
    xgb4.predict(X_test_proc),
    lgb4.predict(X_test_proc)
])
ens4_test_preds = meta4.predict(S_test4)
ens4_metrics = calc_m(df_test4[target], ens4_test_preds)

print(f"Corrected 4-Way Ensemble Test Metrics:")
print(f"  R2: {ens4_metrics['r2']:.4f}, RMSE: {ens4_metrics['rmse_tonnes']:.3f} t/ha, MAE: {ens4_metrics['mae_tonnes']:.3f} t/ha")

# Conformal coverage on test
test_uq4 = calibrator4.evaluate_test(df_test4[target].values, ens4_test_preds)
print(f"Corrected Disjoint Conformal Coverage on Untouched Test Set:")
print(f"  Nominal: 90.0%, Empirical: {test_uq4['empirical_coverage']*100:.2f}%, Avg Width: {test_uq4['average_width_tonnes']:.3f} t/ha")

# Crop breakdown under corrected split
y_te_t4 = df_test4[target].values / 10000.0
ens_t4 = ens4_test_preds / 10000.0
lowers4 = np.maximum(0.0, ens_t4 - calibrator4.quantile_q)
uppers4 = ens_t4 + calibrator4.quantile_q
cov4 = (y_te_t4 >= lowers4) & (y_te_t4 <= uppers4)

crop_cov4 = {}
for crop in sorted(df_test4["Item"].unique()):
    mask = (df_test4["Item"] == crop).values
    crop_cov4[crop] = {
        "n": int(np.sum(mask)),
        "coverage": round(float(np.mean(cov4[mask])), 4),
        "mean_yield_t": round(float(np.mean(y_te_t4[mask])), 2)
    }

print("\nCrop-wise Conformal Coverage under Corrected Disjoint Split:")
for c, d in crop_cov4.items():
    print(f"  {c:<22}: Coverage = {d['coverage']*100:.2f}% (N={d['n']}, Mean Yield={d['mean_yield_t']} t/ha)")

# Save all results to PHASE3_2_EXPERIMENT_RESULTS.json
results_3_2 = {
    "task1_leakage_audit": {
        "total_clean_rows": total_rows,
        "unique_groups": unique_groups,
        "repeated_groups": int(repeated_groups),
        "single_groups": int(single_groups),
        "random_split_test_group_leakage_pct": round(len(test_groups_in_train)/len(test_groups)*100, 2),
        "random_split_test_rows_belonging_to_train_group_pct": round(float(X_test['group_id'].isin(train_groups).mean()*100), 2)
    },
    "task1b_grouped_evaluation": {
        "split_type": "GroupShuffleSplit on (Area, Item, Year)",
        "train_rows": len(df_train_grp),
        "calib_rows": len(df_calib_grp),
        "test_rows": len(df_test_grp),
        "random_forest": grp_rf_m,
        "xgboost": grp_xgb_m
    },
    "task2_corrected_conformal_4way_split": {
        "base_train_rows": len(df_base4),
        "meta_train_rows": len(df_meta4),
        "conformal_calib_rows": len(df_calib4),
        "test_rows": len(df_test4),
        "conformal_margin_q": round(calibrator4.quantile_q, 4),
        "empirical_test_coverage": round(test_uq4["empirical_coverage"], 4),
        "average_width_tonnes": round(test_uq4["average_width_tonnes"], 4),
        "crop_coverage": crop_cov4,
        "ensemble_test_metrics": ens4_metrics
    }
}

with open("PHASE3_2_EXPERIMENT_RESULTS.json", "w", encoding="utf-8") as f:
    json.dump(results_3_2, f, indent=2)

print("\n--- PHASE 3.2 AUDIT COMPLETE: SAVED TO PHASE3_2_EXPERIMENT_RESULTS.json ---")
