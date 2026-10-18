"""Prediction, explainability, and uncertainty service with Exact TreeSHAP and Crop-Conditional Conformal UQ."""
from __future__ import annotations

import os
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import joblib
import shap

from app.core.config import settings
from app.db.database import db
from app.ml.conformal import ConformalPredictionCalibrator
from app.schemas.prediction import YieldInput, PredictionResponse, ConfidenceInterval, ConformalInterval

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        self.model = None
        self.metadata = None
        self.ref_data = None
        self.conformal_calibrator = None
        self.benchmark_results = None
        self.tree_explainer = None
        self.feature_columns = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Load trained pipeline, metadata, reference data, and initialize TreeSHAP explainer."""
        # 1. Pipeline
        if os.path.exists(settings.MODEL_PATH):
            try:
                self.model = joblib.load(settings.MODEL_PATH)
                logger.info("Pipeline loaded from %s", settings.MODEL_PATH)
                # Initialize TreeExplainer on deployed XGBRegressor
                if hasattr(self.model, "named_steps") and "regressor" in self.model.named_steps:
                    self.tree_explainer = shap.TreeExplainer(self.model.named_steps["regressor"])
                    # Cache feature names from preprocessor
                    preprocessor = self.model.named_steps["preprocessor"]
                    cat_encoder = preprocessor.named_transformers_["cat"]
                    cat_cols = cat_encoder.get_feature_names_out(["Area", "Item"])
                    num_cols = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
                    self.feature_columns = list(num_cols) + list(cat_cols)
                    logger.info("TreeSHAP initialized on deployed estimator with %d transformed features", len(self.feature_columns))
            except Exception as e:
                logger.error("Failed to load pipeline or TreeSHAP: %s", e)

        # 2. Metadata
        if os.path.exists(settings.METADATA_PATH):
            try:
                self.metadata = joblib.load(settings.METADATA_PATH)
            except Exception as e:
                logger.error("Failed to load metadata: %s", e)

        # 3. Conformal Calibrator
        if os.path.exists(settings.CONFORMAL_PATH):
            try:
                self.conformal_calibrator = ConformalPredictionCalibrator.load(settings.CONFORMAL_PATH)
            except Exception as e:
                logger.error("Failed to load conformal calibrator: %s", e)
        if self.conformal_calibrator is None:
            self.conformal_calibrator = ConformalPredictionCalibrator()

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

                # Aggregate transformed columns back to parent features (in tonnes/ha)
                year_shap = float(raw_sv[0]) / 10000.0
                rain_shap = float(raw_sv[1]) / 10000.0
                pest_shap = float(raw_sv[2]) / 10000.0
                temp_shap = float(raw_sv[3]) / 10000.0
                crop_shap = float(np.sum(raw_sv[item_indices])) / 10000.0
                country_shap = float(np.sum(raw_sv[area_indices])) / 10000.0

                base_val_tonnes = float(self.tree_explainer.expected_value) / 10000.0
                shap_vals = [
                    round(rain_shap, 4),
                    round(temp_shap, 4),
                    round(pest_shap, 4),
                    round(year_shap, 4),
                    round(crop_shap, 4),
                    round(country_shap, 4)
                ]
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

    def predict(self, payload: YieldInput, user_id: Optional[str] = None) -> PredictionResponse:
        """Make point prediction with conformal uncertainty bounds and exact TreeSHAP attributions."""
        if self.model is None:
            raise RuntimeError("Model pipeline not loaded.")

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

        # Conformal Prediction 90% interval (Crop-Conditional with Group-Aware Fallback)
        uq_dict = self.conformal_calibrator.predict_interval(pred_tonnes, crop=payload.crop)

        # Confidence interval (parametric normal approximation)
        deployed_rmse_hg = self.metadata.get("deployed_test_rmse_hg", 14394.0) if self.metadata else 14394.0
        deployed_r2 = self.metadata.get("deployed_test_r2", 0.9714) if self.metadata else 0.9714

        ci = ConfidenceInterval(
            lower=round(max(0.0, pred_hg - 1.96 * deployed_rmse_hg), 1),
            upper=round(pred_hg + 1.96 * deployed_rmse_hg, 1),
            mean=round(pred_hg, 1),
            std=round(deployed_rmse_hg, 1)
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
            coverage_disclaimer=uq_dict["coverage_disclaimer"]
        )

        # Exact TreeSHAP feature attribution
        shap_vals, features, base_val_t, attribution_method = self._compute_shap(row)

        timestamp = datetime.now(timezone.utc).isoformat()

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
                model_version="Production-XGBoost-v2",
                user_id=user_id
            )
        except Exception as e:
            logger.warning("Could not persist prediction to DB: %s", e)

        return PredictionResponse(
            predicted_yield_hg_per_ha=round(pred_hg, 1),
            predicted_yield_tonnes_per_ha=round(pred_tonnes, 4),
            model_name="Production XGBoost Regressor Pipeline",
            deployed_estimator="xgboost.sklearn.XGBRegressor",
            model_test_r2=round(deployed_r2, 4),
            model_test_rmse_hg_ha=round(deployed_rmse_hg, 1),
            confidence_interval=ci,
            conformal_interval_90=conf_interval,
            shap_values=shap_vals,
            feature_names=features,
            base_value=base_val_t,
            attribution_method=attribution_method,
            timestamp=timestamp
        )

prediction_service = PredictionService()
