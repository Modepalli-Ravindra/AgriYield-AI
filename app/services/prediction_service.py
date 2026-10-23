"""Prediction service encapsulating production model inference, conformal intervals, and TreeSHAP."""
from __future__ import annotations

import sys
import types

# Guard against Windows Application Control blocking unused sklearn svm C-extensions during unpickling
for _mod in ("sklearn.svm._libsvm_sparse", "sklearn.svm._libsvm"):
    if _mod not in sys.modules:
        try:
            __import__(_mod)
        except Exception:
            sys.modules[_mod] = types.ModuleType(_mod)

import os
import json
import joblib
import numpy as np
import pandas as pd
try:
    import shap
except (ImportError, Exception):
    shap = None
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple

import logging

from app.core.config import settings
from app.db.database import db
from app.schemas.prediction import YieldInput, PredictionResponse, ConfidenceInterval, ConformalInterval
from app.ml.conformal import ConformalPredictionCalibrator

logger = logging.getLogger(__name__)

class PredictionService:
    """Production service delivering point predictions, calibrated intervals, and feature attributions."""

    # Empirical training distribution limits derived from data/yield_df_1990_2024.csv (19,996 clean records)
    TRAINING_DISTRIBUTION: Dict[str, Dict[str, float]] = {
        "year": {"min": 1990.0, "max": 2024.0},
        "rainfall_mm": {"min": 51.0, "max": 3240.0},
        "pesticides_tonnes": {"min": 0.04, "max": 367778.0},
        "avg_temp_c": {"min": 1.30, "max": 30.65}
    }

    def __init__(self):
        self.model = None
        self.metadata = None
        self.conformal_calibrator = None
        self.tree_explainer = None
        self.feature_columns = None
        self.pilot_model = None
        self.pilot_metadata = None
        self.pilot_conformal_calibrator = None
        self.pilot_tree_explainer = None
        self.pilot_feature_columns = None
        self.climate_records_cache: Dict[Tuple[str, int], Dict[str, Any]] = {}
        self.ref_data = None
        self.benchmark_results = None
        self.regional_profiles: Dict[str, Dict[str, Any]] = {}
        self._load_artifacts()

    def _load_artifacts(self):
        """Load production XGBoost pipeline, metadata, and conformal calibrator."""
        # 1. Pipeline & TreeExplainer
        if os.path.exists(settings.MODEL_PATH):
            try:
                self.model = joblib.load(settings.MODEL_PATH)
                logger.info("Pipeline loaded from %s", settings.MODEL_PATH)
                if hasattr(self.model, "named_steps") and "regressor" in self.model.named_steps:
                    reg_step = self.model.named_steps["regressor"]
                    inner_reg = getattr(reg_step, "regressor_", reg_step)
                    if shap is not None:
                        try:
                            self.tree_explainer = shap.TreeExplainer(inner_reg)
                            logger.info("TreeSHAP initialized on deployed estimator")
                        except Exception as te_err:
                            logger.warning("TreeSHAP initialization skipped: %s", te_err)
                    preprocessor = self.model.named_steps["preprocessor"]
                    cat_encoder = preprocessor.named_transformers_["cat"]
                    cat_cols = cat_encoder.get_feature_names_out(["Area", "Item"])
                    num_cols = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
                    self.feature_columns = list(num_cols) + list(cat_cols)
                    logger.info("Feature columns extracted: %d features", len(self.feature_columns))
            except Exception as e:
                logger.error("Failed to load pipeline or TreeSHAP: %s", e)

        # 2. Metadata
        if os.path.exists(settings.METADATA_PATH):
            try:
                self.metadata = joblib.load(settings.METADATA_PATH)
                logger.info("Loaded model metadata: %s", self.metadata.get("model_name"))
            except Exception as e:
                logger.error("Failed to load metadata: %s", e)

        # 3. Conformal Calibrator
        if os.path.exists(settings.CONFORMAL_PATH):
            try:
                self.conformal_calibrator = ConformalPredictionCalibrator.load(settings.CONFORMAL_PATH)
                logger.info("Loaded group-aware conformal calibrator (Q_group_max=%.4f)",
                            self.conformal_calibrator.group_max_quantile_q)
            except Exception as e:
                logger.error("Failed to load conformal calibrator: %s", e)
                self.conformal_calibrator = ConformalPredictionCalibrator()
        else:
            self.conformal_calibrator = ConformalPredictionCalibrator()

        # 3b. Pilot Model, Calibrator, and Metadata
        if os.path.exists(settings.PILOT_MODEL_PATH):
            try:
                self.pilot_model = joblib.load(settings.PILOT_MODEL_PATH)
                logger.info("Climate-Enhanced Pilot model loaded from %s", settings.PILOT_MODEL_PATH)
                if hasattr(self.pilot_model, "named_steps") and "regressor" in self.pilot_model.named_steps:
                    reg_step = self.pilot_model.named_steps["regressor"]
                    inner_reg = getattr(reg_step, "regressor_", reg_step)
                    if shap is not None:
                        try:
                            self.pilot_tree_explainer = shap.TreeExplainer(inner_reg)
                            logger.info("TreeSHAP initialized on pilot model")
                        except Exception as te_err:
                            logger.warning("Pilot TreeSHAP initialization skipped: %s", te_err)
                    preprocessor = self.pilot_model.named_steps["preprocessor"]
                    cat_encoder = preprocessor.named_transformers_["cat"]
                    cat_cols = cat_encoder.get_feature_names_out(["Area", "Item"])
                    num_cols = [
                        "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp",
                        "effective_precip_mm", "effective_temp_c",
                        "growing_season_precip_mm", "heat_stress_days_above_30c", "dry_spell_max_days",
                        "irrigation_equipped_pct"
                    ]
                    self.pilot_feature_columns = list(cat_cols) + list(num_cols)
                    logger.info("Pilot feature columns extracted: %d features", len(self.pilot_feature_columns))
            except Exception as e:
                logger.warning("Failed to load pilot model or TreeSHAP: %s", e)

        if os.path.exists(settings.PILOT_METADATA_PATH):
            try:
                with open(settings.PILOT_METADATA_PATH, "r", encoding="utf-8") as f:
                    self.pilot_metadata = json.load(f)
                logger.info("Loaded pilot model metadata: %s", self.pilot_metadata.get("model_name"))
            except Exception as e:
                logger.warning("Failed to load pilot metadata: %s", e)

        if os.path.exists(settings.PILOT_CALIBRATOR_PATH):
            try:
                self.pilot_conformal_calibrator = ConformalPredictionCalibrator.load(settings.PILOT_CALIBRATOR_PATH)
                logger.info("Loaded pilot conformal calibrator (Q_group_max=%.4f)",
                            self.pilot_conformal_calibrator.group_max_quantile_q)
            except Exception as e:
                logger.warning("Failed to load pilot conformal calibrator: %s", e)

        # 3c. Preload authentic climate records cache
        self._load_climate_records_cache()

        # 4. Benchmark Results
        bench_path = settings.MODELS_DIR / "benchmark_results.json"
        if os.path.exists(bench_path):
            try:
                with open(bench_path, "r", encoding="utf-8") as f:
                    self.benchmark_results = json.load(f)
            except Exception as e:
                logger.error("Failed to load benchmark results: %s", e)

        # 5. Reference data
        if os.path.exists(settings.DATA_PATH):
            try:
                df = pd.read_csv(settings.DATA_PATH)
                if "Unnamed: 0" in df.columns:
                    df = df.drop(columns=["Unnamed: 0"])
                self.ref_data = df.drop_duplicates().reset_index(drop=True)
                logger.info("Reference data loaded: %d rows", len(self.ref_data))
            except Exception as e:
                logger.error("Failed to load reference data: %s", e)

        # 6. Regional climate profiles and historical baselines
        self.regional_profiles = {}
        primary_data_path = settings.BASE_DIR / "data" / "yield_df_1990_2024.csv"
        src_path = primary_data_path if primary_data_path.exists() else settings.DATA_PATH
        if os.path.exists(src_path):
            try:
                df_src = pd.read_csv(src_path)
                for country, grp in df_src.groupby("Area"):
                    rain_const = float(grp["average_rain_fall_mm_per_year"].iloc[0])
                    t_mean = float(grp["avg_temp"].mean())
                    t_std = float(grp["avg_temp"].std())
                    if pd.isna(t_std) or t_std < 0.05:
                        t_std = 0.55
                    supported_crops = sorted(grp["Item"].unique().tolist())
                    rec_count = int(len(grp))
                    y_min = int(grp["Year"].min())
                    y_max = int(grp["Year"].max())

                    self.regional_profiles[country] = {
                        "country": country,
                        "rainfall_baseline_mm": round(rain_const, 1),
                        "temp_mean_c": round(t_mean, 2),
                        "temp_std_c": round(t_std, 2),
                        "supported_crops": supported_crops,
                        "records_count": rec_count,
                        "historical_years": [y_min, y_max],
                        "climatology_type": "FAO AQUASTAT Climatological Precipitation & Berkeley Earth / FAOSTAT ET Temperature",
                        "reliability_tier": "High Confidence (Nominal Climatology)" if rec_count >= 20 else "Moderate Confidence",
                        "coverage_disclaimer": "Historical rainfall reflects national climatological constant (FAO AQUASTAT). Temperature reflects annual mean anomalies."
                    }
                logger.info("Initialized regional climate profiles for %d countries", len(self.regional_profiles))
            except Exception as e:
                logger.error("Failed to load regional climate profiles: %s", e)

    load_artifacts = _load_artifacts

    def _load_climate_records_cache(self):
        """Preload daily reanalysis metrics for supported countries and years."""
        self.climate_records_cache = {}
        if not hasattr(settings, "CLIMATE_PROCESSED_DIR") or not settings.CLIMATE_PROCESSED_DIR.exists():
            return
        for csv_file in settings.CLIMATE_PROCESSED_DIR.glob("*_annual_metrics.csv"):
            try:
                cdf = pd.read_csv(csv_file)
                for _, row in cdf.iterrows():
                    c_name = str(row["country"]).strip()
                    yr = int(row["year"])
                    self.climate_records_cache[(c_name, yr)] = row.to_dict()
                    if c_name == "United States of America":
                        self.climate_records_cache[("United States", yr)] = row.to_dict()
                    elif c_name == "United States":
                        self.climate_records_cache[("United States of America", yr)] = row.to_dict()
            except Exception as e:
                logger.warning("Failed to parse climate metrics file %s: %s", csv_file, e)
        logger.info("Loaded %d authentic climate records into inference cache", len(self.climate_records_cache))

    def get_authentic_climate_record(self, country: str, year: int) -> Optional[Dict[str, Any]]:
        """Look up verified daily reanalysis climate metrics for a country and year."""
        rec = self.climate_records_cache.get((country, year))
        if rec is None:
            if country == "United States":
                rec = self.climate_records_cache.get(("United States of America", year))
            elif country == "United States of America":
                rec = self.climate_records_cache.get(("United States", year))

        if rec is not None:
            obs_days = rec.get("observation_count_days", 0)
            if obs_days >= 300:
                return rec
        return None

    def get_options(self) -> Dict[str, Any]:
        """Return available countries, crops, year range, and default values."""
        if self.ref_data is not None:
            countries = sorted(self.ref_data["Area"].unique().tolist())
            crops = sorted(self.ref_data["Item"].unique().tolist())
            min_year = int(self.ref_data["Year"].min())
            max_year = int(self.ref_data["Year"].max())
        else:
            countries = ["India", "Albania", "Algeria", "United States", "Brazil"]
            crops = ["Maize", "Wheat", "Rice, paddy", "Potatoes", "Soybeans"]
            min_year, max_year = 1990, 2013

        default_input = {
            "country": "India" if "India" in countries else countries[0],
            "crop": "Wheat" if "Wheat" in crops else crops[0],
            "year": 2013,
            "rainfall_mm": 1050.0,
            "avg_temp_c": 25.5,
            "pesticides_tonnes": 50000.0
        }
        return {
            "countries": countries,
            "crops": crops,
            "year_range": {"min": min_year, "max": max_year},
            "default_input": default_input
        }

    def check_distribution_warnings(self, payload: YieldInput) -> List[str]:
        """
        Detect values outside the historical training distribution.
        Distinguishes valid but unusual inputs from rejected invalid inputs without altering user input.
        """
        warnings: List[str] = []

        # 1. Year distribution check
        year_min = int(self.TRAINING_DISTRIBUTION["year"]["min"])
        year_max = int(self.TRAINING_DISTRIBUTION["year"]["max"])
        if payload.year < year_min or payload.year > year_max:
            warnings.append(
                f"Observation year {payload.year} is outside historical training range ({year_min} to {year_max}). "
                "Forward temporal drift may reduce prediction accuracy."
            )

        # 2. Rainfall distribution check
        rf_min = self.TRAINING_DISTRIBUTION["rainfall_mm"]["min"]
        rf_max = self.TRAINING_DISTRIBUTION["rainfall_mm"]["max"]
        if payload.rainfall_mm < rf_min or payload.rainfall_mm > rf_max:
            warnings.append(
                f"Annual precipitation {payload.rainfall_mm:.1f} mm is outside historical training range ({rf_min:.1f} to {rf_max:.1f} mm). "
                "Extreme hydrological conditions may reduce prediction reliability."
            )

        # 3. Pesticides distribution check
        pest_min = self.TRAINING_DISTRIBUTION["pesticides_tonnes"]["min"]
        pest_max = self.TRAINING_DISTRIBUTION["pesticides_tonnes"]["max"]
        if payload.pesticides_tonnes < pest_min or payload.pesticides_tonnes > pest_max:
            warnings.append(
                f"Pesticide application {payload.pesticides_tonnes:.2f} tonnes is outside historical training range ({pest_min:.2f} to {pest_max:.0f} tonnes)."
            )

        # 4. Temperature distribution check
        temp_min = self.TRAINING_DISTRIBUTION["avg_temp_c"]["min"]
        temp_max = self.TRAINING_DISTRIBUTION["avg_temp_c"]["max"]
        if payload.avg_temp_c < temp_min or payload.avg_temp_c > temp_max:
            warnings.append(
                f"Average temperature {payload.avg_temp_c:.1f} ?C is outside historical training range ({temp_min:.1f} to {temp_max:.1f} ?C). "
                "Thermal stress extrapolation may reduce model accuracy."
            )

        # 5. Geographic transfer check
        if self.ref_data is not None:
            known_countries = set(self.ref_data["Area"].unique())
            if payload.country not in known_countries:
                warnings.append(
                    f"Country '{payload.country}' is unseen in training data. "
                    "Prediction relies on zero-shot geographic transfer (cross-country R? ~0.54)."
                )

        # 6. Crop support check
        if self.ref_data is not None:
            known_crops = set(self.ref_data["Item"].unique())
            if payload.crop not in known_crops:
                warnings.append(
                    f"Crop '{payload.crop}' was not observed in training data. "
                    "Global fallback conformal uncertainty margin (Group Max Q = 2.573 t/ha) has been applied."
                )

        return warnings

    def get_regional_profile(self, country: str) -> Optional[Dict[str, Any]]:
        """Retrieve verified regional climate profile for a given country."""
        return self.regional_profiles.get(country)

    def assess_climatology_and_shift(self, payload: YieldInput) -> Tuple[List[str], bool, Optional[float], str]:
        """
        Assess climatological precipitation deviation and thermal anomaly shift (Z-score).
        Returns:
            warnings: list of string advisory alerts (including global range warnings)
            is_climate_shift: bool flag (True if Z >= 1.624)
            temp_z_score: float or None
            reliability_tier: str description of regional confidence tier
        """
        warnings = self.check_distribution_warnings(payload)
        is_climate_shift = False
        temp_z_score: Optional[float] = None
        reliability_tier = "High Confidence (Nominal Climatology)"

        profile = self.regional_profiles.get(payload.country)
        if profile is None:
            reliability_tier = "Extrapolated (Unseen Territory)"
            return warnings, is_climate_shift, temp_z_score, reliability_tier

        # 1. Rainfall Climatological Integrity Check
        base_rain = profile["rainfall_baseline_mm"]
        if base_rain > 0:
            diff_pct = abs(payload.rainfall_mm - base_rain) / base_rain
            if diff_pct > 0.20:
                warnings.append(
                    f"Climatological Notice: Input precipitation ({payload.rainfall_mm:.1f} mm) deviates by {diff_pct*100:.1f}% "
                    f"from {payload.country}'s national baseline ({base_rain:.1f} mm). Note: Historical training data uses national "
                    "long-term average rainfall from FAO AQUASTAT (σ = 0 within country); local drought or flood anomalies are not captured."
                )

        # 2. Thermal Anomaly / Climate Shift Check (SACAP detector: threshold tau = 1.624)
        mu_temp = profile["temp_mean_c"]
        sigma_temp = max(profile["temp_std_c"], 1.0)
        temp_diff = payload.avg_temp_c - mu_temp
        temp_z_score = abs(temp_diff) / sigma_temp

        if temp_diff > 0 and temp_z_score >= 1.624:
            is_climate_shift = True
            warnings.append(
                f"Climate Shift Alert: Temperature of {payload.avg_temp_c:.1f}°C represents a significant thermal anomaly "
                f"(Z = +{temp_z_score:.2f}σ relative to {payload.country}'s historical baseline {mu_temp:.1f}±{sigma_temp:.2f}°C). "
                "Prediction is operating in an extrapolated climate regime; robust SACAP-V2 safeguard intervals have been activated."
            )
            reliability_tier = "Extrapolated (Climate Drift Regime)"
        elif payload.crop not in profile["supported_crops"]:
            reliability_tier = "Moderate Confidence (Unobserved Regional Crop)"
        else:
            reliability_tier = "High Confidence (Nominal Climatology)"

        return warnings, is_climate_shift, round(float(temp_z_score), 2), reliability_tier

    def _compute_shap(self, row: Any) -> Tuple[List[float], List[str], float, str]:
        """Compute exact TreeSHAP attributions with fallback to heuristic proxy."""
        features = ["rainfall", "avg_temp", "pesticides", "year", "crop", "country"]
        if isinstance(row, pd.Series):
            row = row.to_frame().T
        elif isinstance(row, dict):
            row = pd.DataFrame([row])

        if self.tree_explainer is not None and self.model is not None and self.feature_columns is not None:
            try:
                row_proc = self.model.named_steps["preprocessor"].transform(row)
                raw_sv = self.tree_explainer.shap_values(row_proc)[0]

                area_indices = [i for i, c in enumerate(self.feature_columns) if c.startswith("Area_")]
                item_indices = [i for i, c in enumerate(self.feature_columns) if c.startswith("Item_")]

                # Raw SHAP values for features
                year_shap_raw = float(raw_sv[0])
                rain_shap_raw = float(raw_sv[1])
                pest_shap_raw = float(raw_sv[2])
                temp_shap_raw = float(raw_sv[3])
                crop_shap_raw = float(np.sum(raw_sv[item_indices]))
                country_shap_raw = float(np.sum(raw_sv[area_indices]))

                raw_shaps = [rain_shap_raw, temp_shap_raw, pest_shap_raw, year_shap_raw, crop_shap_raw, country_shap_raw]
                base_val_raw = float(self.tree_explainer.expected_value)

                # Check if model regressor operates in log1p space (Log1p XGBoost)
                reg_step = self.model.named_steps["regressor"]
                is_log_model = hasattr(reg_step, "func") or base_val_raw < 50.0

                if is_log_model:
                    base_val_log = base_val_raw
                    sum_log = sum(raw_shaps)
                    pred_log = base_val_log + sum_log

                    # Convert baseline and prediction to physical tonnes/ha (expm1(u) / 10000.0)
                    base_val_tonnes = float(np.expm1(base_val_log) / 10000.0)
                    pred_tonnes = float(np.expm1(pred_log) / 10000.0)
                    delta_tonnes = pred_tonnes - base_val_tonnes

                    # Proportional allocation preserving sign monotonicity and exact additivity
                    if abs(sum_log) > 1e-9:
                        scale = delta_tonnes / sum_log
                        scaled_shaps = [float(s * scale) for s in raw_shaps]
                    else:
                        scaled_shaps = [0.0] * len(raw_shaps)

                    base_val_t = round(base_val_tonnes, 4)
                    pred_t = round(pred_tonnes, 4)
                    shap_vals = [round(v, 4) for v in scaled_shaps]
                    diff = pred_t - (base_val_t + sum(shap_vals))
                    if abs(diff) > 1e-6:
                        shap_vals[0] = round(shap_vals[0] + diff, 4)

                    return shap_vals, features, base_val_t, "Exact TreeSHAP (shap.TreeExplainer)"
                else:
                    # Legacy model trained directly in hg/ha_yield
                    base_val_tonnes = base_val_raw / 10000.0
                    shap_vals = [round(float(s) / 10000.0, 4) for s in raw_shaps]
                    return shap_vals, features, round(base_val_tonnes, 4), "Exact TreeSHAP (shap.TreeExplainer)"
            except Exception as e:
                logger.warning("TreeSHAP computation encountered error, using sensitivity proxy: %s", e)

        # Fallback to transparently labeled heuristic proxy
        p = row.iloc[0] if isinstance(row, pd.DataFrame) else row
        shap_vals = [
            round((p["average_rain_fall_mm_per_year"] - 1100.0) * 0.0005, 3),
            round((p["avg_temp"] - 20.0) * -0.04, 3),
            round((np.log1p(p["pesticides_tonnes"]) - 8.0) * 0.08, 3),
            round((p["Year"] - 2000) * 0.02, 3),
            round(0.85 if p["Item"] == "Potatoes" else 0.12, 3),
            round(0.25 if p["Area"] in ["India", "United States"] else -0.1, 3)
        ]
        return shap_vals, features, 2.50, "Heuristic Sensitivity Proxy"

    def _compute_shap_pilot(self, row: pd.DataFrame) -> Tuple[List[float], List[str], float, str]:
        """Compute exact TreeSHAP attributions for the 12-feature pilot model."""
        features = [
            "rainfall", "avg_temp", "pesticides", "year", "crop", "country",
            "effective_precip", "effective_temp", "growing_season_rain",
            "heat_stress_days", "dry_spell_days", "irrigation_pct"
        ]
        if self.pilot_tree_explainer is not None and self.pilot_model is not None:
            try:
                row_proc = self.pilot_model.named_steps["preprocessor"].transform(row)
                raw_sv = self.pilot_tree_explainer.shap_values(row_proc)[0]

                cat_encoder = self.pilot_model.named_steps["preprocessor"].named_transformers_["cat"]
                cat_names = cat_encoder.get_feature_names_out(["Area", "Item"])
                n_cat = len(cat_names)

                cat_shaps = raw_sv[:n_cat]
                num_shaps = raw_sv[n_cat:]

                area_indices = [i for i, c in enumerate(cat_names) if c.startswith("Area_")]
                item_indices = [i for i, c in enumerate(cat_names) if c.startswith("Item_")]

                country_shap = float(np.sum(cat_shaps[area_indices]))
                crop_shap = float(np.sum(cat_shaps[item_indices]))

                # num_cols: Year, average_rain, pesticides, avg_temp, eff_precip, eff_temp, gs_precip, heat_stress, dry_spell, irrig
                year_shap = float(num_shaps[0])
                rain_shap = float(num_shaps[1])
                pest_shap = float(num_shaps[2])
                temp_shap = float(num_shaps[3])
                eff_rain_shap = float(num_shaps[4])
                eff_temp_shap = float(num_shaps[5])
                gs_rain_shap = float(num_shaps[6])
                heat_stress_shap = float(num_shaps[7])
                dry_spell_shap = float(num_shaps[8])
                irrig_shap = float(num_shaps[9])

                raw_shaps = [
                    rain_shap, temp_shap, pest_shap, year_shap, crop_shap, country_shap,
                    eff_rain_shap, eff_temp_shap, gs_rain_shap, heat_stress_shap, dry_spell_shap, irrig_shap
                ]
                base_val_raw = float(self.pilot_tree_explainer.expected_value)

                sum_log = sum(raw_shaps)
                base_val_tonnes = float(np.expm1(base_val_raw) / 10000.0)
                pred_tonnes = float(np.expm1(base_val_raw + sum_log) / 10000.0)
                delta_tonnes = pred_tonnes - base_val_tonnes

                if abs(sum_log) > 1e-9:
                    scale = delta_tonnes / sum_log
                    scaled_shaps = [float(s * scale) for s in raw_shaps]
                else:
                    scaled_shaps = [0.0] * len(raw_shaps)

                base_val_t = round(base_val_tonnes, 4)
                shap_vals = [round(v, 4) for v in scaled_shaps]
                return shap_vals, features, base_val_t, "Exact TreeSHAP (Climate-Enhanced Pilot)"
            except Exception as e:
                logger.warning("TreeSHAP on pilot model failed, falling back to proxy: %s", e)

        base_shap, base_feat, base_val, base_method = self._compute_shap(row)
        return base_shap + [0.0] * 6, features, base_val, base_method

    def predict(self, payload: YieldInput, user_id: Optional[str] = None) -> PredictionResponse:
        """Make point prediction with conformal uncertainty bounds and exact TreeSHAP attributions.
        Dynamically routes to Climate-Enhanced Pilot Model when authentic ERA5-Land records exist.
        Otherwise falls back safely to the Production Baseline Model.
        """
        if self.model is None:
            raise RuntimeError("Model pipeline not loaded.")

        # Non-blocking distribution shift, climatological integrity, and climate shift alerts
        warnings, is_climate_shift, temp_z_score, reliability_tier = self.assess_climatology_and_shift(payload)

        # Check for verified authentic daily climate observations
        climate_rec = self.get_authentic_climate_record(payload.country, payload.year)
        use_pilot = bool(climate_rec is not None and self.pilot_model is not None)

        if use_pilot:
            logger.info("Routing prediction for %s (%d) to Climate-Enhanced Pilot Model", payload.country, payload.year)
            row = pd.DataFrame([{
                "Area": payload.country,
                "Item": payload.crop,
                "Year": payload.year,
                "average_rain_fall_mm_per_year": payload.rainfall_mm,
                "pesticides_tonnes": payload.pesticides_tonnes,
                "avg_temp": payload.avg_temp_c,
                "effective_precip_mm": float(climate_rec["annual_precip_mm"]),
                "effective_temp_c": float(climate_rec["annual_temp_mean_c"]),
                "growing_season_precip_mm": float(climate_rec["growing_season_precip_mm"]),
                "heat_stress_days_above_30c": float(climate_rec["heat_stress_days_above_30c"]),
                "dry_spell_max_days": float(climate_rec["dry_spell_max_days"]),
                "irrigation_equipped_pct": float(climate_rec["irrigation_equipped_pct"])
            }])

            pred_hg = float(self.pilot_model.predict(row)[0])
            pred_hg = max(0.0, pred_hg)
            pred_tonnes = pred_hg / 10000.0

            active_calibrator = self.pilot_conformal_calibrator or self.conformal_calibrator
            model_name = "Climate_Enhanced_XGBoost_v1.0_Pilot"
            deployed_estimator = "xgboost.sklearn.XGBRegressor (Climate-Enhanced Pilot)"
            model_test_r2 = 0.8165
            model_test_rmse_hg = 44780.0
            used_pilot_model = True
            has_authentic_climate = True
            climate_coverage_status = f"Authentic ECMWF ERA5-Land Reanalysis ({payload.year} via Open-Meteo Archive)"
            climate_features_used = {
                "effective_precip_mm": round(float(climate_rec["annual_precip_mm"]), 1),
                "effective_temp_c": round(float(climate_rec["annual_temp_mean_c"]), 2),
                "growing_season_precip_mm": round(float(climate_rec["growing_season_precip_mm"]), 1),
                "heat_stress_days_above_30c": int(climate_rec["heat_stress_days_above_30c"]),
                "dry_spell_max_days": int(climate_rec["dry_spell_max_days"]),
                "irrigation_equipped_pct": round(float(climate_rec["irrigation_equipped_pct"]), 1),
                "source": str(climate_rec.get("source", "ECMWF ERA5-Land Reanalysis"))
            }

            shap_vals, features, base_val_t, attribution_method = self._compute_shap_pilot(row)
            db_model_version = "Climate-Enhanced-Pilot-v1"
        else:
            logger.info("Routing prediction for %s (%d) to Production Baseline Model", payload.country, payload.year)
            row = pd.DataFrame([{
                "Area": payload.country,
                "Item": payload.crop,
                "Year": payload.year,
                "average_rain_fall_mm_per_year": payload.rainfall_mm,
                "pesticides_tonnes": payload.pesticides_tonnes,
                "avg_temp": payload.avg_temp_c
            }])

            pred_hg = float(self.model.predict(row)[0])
            pred_hg = max(0.0, pred_hg)
            pred_tonnes = pred_hg / 10000.0

            active_calibrator = self.conformal_calibrator
            model_name = "Production XGBoost Regressor Pipeline"
            deployed_estimator = "xgboost.sklearn.XGBRegressor (Production Baseline)"
            model_test_r2 = self.metadata.get("deployed_test_r2", 0.8034) if self.metadata else 0.8034
            model_test_rmse_hg = self.metadata.get("deployed_test_rmse_hg", 46357.0) if self.metadata else 46357.0
            used_pilot_model = False
            has_authentic_climate = False
            climate_coverage_status = "FAO National Climatology Fallback (Daily Reanalysis Not Available)"
            climate_features_used = None

            warnings.append(
                f"Notice: Daily climate reanalysis is not available for {payload.country} in {payload.year}. "
                "Inference was safely routed to the Production Baseline model using national climatological averages."
            )

            shap_vals, features, base_val_t, attribution_method = self._compute_shap(row)
            db_model_version = "Production-XGBoost-v2"

        # Conformal Prediction 90% interval (Crop-Conditional with SACAP-V2 Shift Safeguard)
        uq_dict = active_calibrator.predict_interval(
            pred_tonnes, 
            crop=payload.crop,
            is_climate_shift=is_climate_shift,
            climate_z_score=temp_z_score
        )

        # Confidence interval (parametric normal approximation)
        ci = ConfidenceInterval(
            lower=round(max(0.0, pred_hg - 1.96 * model_test_rmse_hg), 1),
            upper=round(pred_hg + 1.96 * model_test_rmse_hg, 1),
            mean=round(pred_hg, 1),
            std=round(model_test_rmse_hg, 1)
        )

        conf_interval = ConformalInterval(
            lower_bound=uq_dict["lower_bound"],
            upper_bound=uq_dict["upper_bound"],
            interval_width_tonnes=uq_dict["interval_width_tonnes"],
            nominal_coverage=uq_dict["nominal_coverage"],
            calibrated_margin_q=uq_dict["calibrated_margin_q"],
            calibration_crop=uq_dict.get("calibration_crop"),
            method=uq_dict["method"],
            unit=uq_dict["unit"],
            climate_shift_safeguard_active=uq_dict.get("climate_shift_safeguard_active", False),
            coverage_disclaimer=uq_dict["coverage_disclaimer"]
        )

        timestamp = datetime.now(timezone.utc).isoformat()

        # Regional baseline metadata
        country_prof = self.get_regional_profile(payload.country)
        reg_baseline = {
            "rainfall_baseline_mm": country_prof["rainfall_baseline_mm"],
            "temp_mean_c": country_prof["temp_mean_c"],
            "temp_std_c": country_prof["temp_std_c"]
        } if country_prof else None

        # Save to database history
        try:
            db.save_prediction(
                country=payload.country,
                crop=payload.crop,
                year=payload.year,
                rainfall_mm=payload.rainfall_mm,
                avg_temp_c=payload.avg_temp_c,
                pesticides_tonnes=payload.pesticides_tonnes,
                predicted_yield_hg_per_ha=round(pred_hg, 1),
                predicted_yield_tonnes_per_ha=round(pred_tonnes, 4),
                conformal_lower_bound=uq_dict["lower_bound"],
                conformal_upper_bound=uq_dict["upper_bound"],
                model_version=db_model_version,
                user_id=user_id
            )
        except Exception as e:
            logger.warning("Could not persist prediction to DB: %s", e)
            if user_id:
                warnings.append("Audit warning: Database persistence unavailable; prediction could not be recorded to history trail.")

        return PredictionResponse(
            predicted_yield_hg_per_ha=round(pred_hg, 1),
            predicted_yield_tonnes_per_ha=round(pred_tonnes, 4),
            model_name=model_name,
            deployed_estimator=deployed_estimator,
            model_test_r2=round(model_test_r2, 4),
            model_test_rmse_hg_ha=round(model_test_rmse_hg, 1),
            confidence_interval=ci,
            conformal_interval_90=conf_interval,
            shap_values=shap_vals,
            feature_names=features,
            base_value=base_val_t,
            attribution_method=attribution_method,
            climate_shift_detected=is_climate_shift,
            climate_anomaly_z=temp_z_score,
            regional_climate_baseline=reg_baseline,
            regional_reliability_tier=reliability_tier,
            used_pilot_model=used_pilot_model,
            has_authentic_climate=has_authentic_climate,
            climate_coverage_status=climate_coverage_status,
            climate_features_used=climate_features_used,
            warnings=warnings,
            timestamp=timestamp
        )

prediction_service = PredictionService()
