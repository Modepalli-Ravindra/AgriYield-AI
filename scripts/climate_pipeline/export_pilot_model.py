"""Script: export_pilot_model.py
Trains and serializes the Climate-Enhanced XGBoost Pilot Model (Ablation Configuration 4)
along with its group-aware conformal calibrator and metadata.

Ensures models/crop_yield_model.pkl is completely untouched.
"""
from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import xgboost as xgb

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))
sys.path.insert(0, str(BASE_DIR))

from app.ml.conformal import ConformalPredictionCalibrator
from app.climate.coordinates import get_irrigation_equipped_pct

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RANDOM_SEED = 42
DATA_PATH = BASE_DIR / "experiments" / "climate_enhanced_experiments" / "data" / "yield_df_climate_enhanced.csv"
MODELS_DIR = BASE_DIR / "models"
PILOT_MODEL_PATH = MODELS_DIR / "climate_enhanced_pilot_model.pkl"
PILOT_CALIBRATOR_PATH = MODELS_DIR / "climate_enhanced_calibrator.pkl"
PILOT_METADATA_PATH = MODELS_DIR / "climate_enhanced_metadata.json"


def train_and_export_pilot_model():
    logger.info("Loading enhanced yield dataset: %s", DATA_PATH)
    df = pd.read_csv(DATA_PATH)

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

    if "irrigation_equipped_pct" not in df.columns or df["irrigation_equipped_pct"].isna().any():
        df["irrigation_equipped_pct"] = df["Area"].map(get_irrigation_equipped_pct).fillna(10.0)

    df["group_id"] = df["Area"] + "_" + df["Item"]

    # Regime A: Train <= 2018 (80/20 GroupShuffleSplit for train/calib)
    train_dev_mask = (df["Year"] <= 2018)
    train_dev_df = df[train_dev_mask].copy().reset_index(drop=True)
    test_df = df[df["Year"] >= 2019].copy().reset_index(drop=True)

    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    tr_idx, cal_idx = next(gss.split(train_dev_df, groups=train_dev_df["group_id"]))

    train_df = train_dev_df.iloc[tr_idx].copy().reset_index(drop=True)
    calib_df = train_dev_df.iloc[cal_idx].copy().reset_index(drop=True)

    cat_cols = ["Area", "Item"]
    num_cols = [
        "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp",
        "effective_precip_mm", "effective_temp_c",
        "growing_season_precip_mm", "heat_stress_days_above_30c", "dry_spell_max_days",
        "irrigation_equipped_pct"
    ]
    features = cat_cols + num_cols
    target_col = "hg/ha_yield"

    logger.info("Training Pilot Model on %d records with %d features...", len(train_df), len(features))

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
            ("num", StandardScaler(), num_cols)
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

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", TransformedTargetRegressor(
            regressor=regressor,
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ])

    pipeline.fit(train_df[features], train_df[target_col].values)
    logger.info("Pilot model training complete.")

    # Conformal calibration
    y_calib_hg = calib_df[target_col].values
    y_calib_pred_hg = np.maximum(0.0, pipeline.predict(calib_df[features]))

    y_calib_t = y_calib_hg / 10000.0
    y_calib_pred_t = y_calib_pred_hg / 10000.0
    resids = np.abs(y_calib_t - y_calib_pred_t)

    calibrator = ConformalPredictionCalibrator(nominal_coverage=0.90)
    n_cal = len(resids)
    p_global = min(1.0, max(0.0, np.ceil((n_cal + 1) * 0.90) / n_cal))
    calibrator.quantile_q = float(np.quantile(resids, p_global))

    calibrator.crop_quantiles = {}
    crops_calib = calib_df["Item"].values
    for crop in np.unique(crops_calib):
        c_res = resids[crops_calib == crop]
        n_c = len(c_res)
        if n_c >= 5:
            p_c = min(1.0, max(0.0, np.ceil((n_c + 1) * 0.90) / n_c))
            calibrator.crop_quantiles[crop] = float(np.quantile(c_res, p_c))
        else:
            calibrator.crop_quantiles[crop] = calibrator.quantile_q

    calibrator.group_max_quantile_q = max(calibrator.crop_quantiles.values()) if calibrator.crop_quantiles else calibrator.quantile_q
    calibrator.calibration_size = n_cal

    # Evaluate on held-out test set
    y_test_hg = test_df[target_col].values
    y_test_pred_hg = np.maximum(0.0, pipeline.predict(test_df[features]))
    y_test_t = y_test_hg / 10000.0
    y_test_pred_t = y_test_pred_hg / 10000.0

    from sklearn.metrics import r2_score, mean_absolute_error
    test_r2 = float(r2_score(y_test_t, y_test_pred_t))
    test_mae = float(mean_absolute_error(y_test_t, y_test_pred_t))

    logger.info("Pilot model held-out test evaluation: R2=%.4f, MAE=%.4f t/ha", test_r2, test_mae)

    # Save artifacts
    joblib.dump(pipeline, PILOT_MODEL_PATH)
    logger.info("Saved pilot model to %s", PILOT_MODEL_PATH)

    calibrator.save(PILOT_CALIBRATOR_PATH)
    logger.info("Saved pilot calibrator to %s", PILOT_CALIBRATOR_PATH)

    metadata = {
        "model_name": "Climate_Enhanced_XGBoost_v1.0_Pilot",
        "description": "Climate-Enhanced Pilot XGBoost model with ECMWF ERA5-Land reanalysis and FAO AQUASTAT irrigation",
        "algorithm": "XGBRegressor with TransformedTargetRegressor(log1p/expm1)",
        "features": features,
        "categorical_features": cat_cols,
        "numerical_features": num_cols,
        "test_r2": round(test_r2, 4),
        "test_mae_tonnes": round(test_mae, 4),
        "calibration_size": n_cal,
        "conformal_nominal_coverage": 0.90,
        "global_quantile_q": round(calibrator.quantile_q, 4),
        "group_max_quantile_q": round(calibrator.group_max_quantile_q, 4),
        "crop_quantiles": {k: round(v, 4) for k, v in calibrator.crop_quantiles.items()}
    }

    with open(PILOT_METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Saved pilot metadata to %s", PILOT_METADATA_PATH)


if __name__ == "__main__":
    train_and_export_pilot_model()
