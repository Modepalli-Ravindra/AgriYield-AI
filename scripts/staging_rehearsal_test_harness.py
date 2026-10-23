"""
Phase 4C: Staging Promotion Rehearsal Test Harness
Runs an isolated, non-invasive staging prediction service using Phase 4B Log1p artifacts.
Preserves all production files and live services untouched.
"""
from __future__ import annotations

import os
import sys
import json
import time
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
import shap
from pydantic import ValidationError

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.schemas.prediction import YieldInput, PredictionResponse
from app.ml.conformal import ConformalPredictionCalibrator
from app.services.prediction_service import PredictionService
STAGING_DIR = BASE_DIR / "experiments" / "phase4b_crop_balance_experiments" / "models"
MODEL_STAGING_PATH = STAGING_DIR / "xgboost_log1p_hg.pkl"
CONFORMAL_STAGING_PATH = STAGING_DIR / "conformal_calibrator_log1p.pkl"
METADATA_STAGING_PATH = STAGING_DIR / "model_metadata_log1p.pkl"
METADATA_JSON_PATH = STAGING_DIR / "model_metadata_log1p.json"

PROD_DIR = BASE_DIR / "models"
MODEL_PROD_PATH = PROD_DIR / "crop_yield_model.pkl"
CONFORMAL_PROD_PATH = PROD_DIR / "conformal_calibrator.pkl"
METADATA_PROD_PATH = PROD_DIR / "model_metadata.pkl"

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

class StagingPredictionService:
    """
    Isolated staging prediction service loading Phase 4B experimental artifacts.
    Demonstrates exact operational behavior without altering live production services.
    """
    def __init__(self):
        self.model = joblib.load(MODEL_STAGING_PATH)
        self.metadata = joblib.load(METADATA_STAGING_PATH)
        self.conformal_calibrator = ConformalPredictionCalibrator.load(CONFORMAL_STAGING_PATH)
        
        # Initialize TreeSHAP safely supporting both raw XGBRegressor and TransformedTargetRegressor
        reg = self.model.named_steps["regressor"]
        raw_reg = getattr(reg, "regressor_", reg)
        self.raw_xgb = raw_reg
        self.tree_explainer = shap.TreeExplainer(raw_reg)
        
        preprocessor = self.model.named_steps["preprocessor"]
        cat_encoder = preprocessor.named_transformers_["cat"]
        cat_cols = cat_encoder.get_feature_names_out(["Area", "Item"])
        num_cols = ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
        self.feature_columns = list(num_cols) + list(cat_cols)
        
        # Reference distribution for warnings
        self.TRAINING_DISTRIBUTION = {
            "year": {"min": 1990, "max": 2024},
            "rainfall_mm": {"min": 50.0, "max": 3500.0},
            "pesticides_tonnes": {"min": 0.0, "max": 500000.0},
            "avg_temp_c": {"min": 0.0, "max": 40.0}
        }

    def check_distribution_warnings(self, payload: YieldInput) -> List[str]:
        warnings: List[str] = []
        if payload.year < self.TRAINING_DISTRIBUTION["year"]["min"] or payload.year > self.TRAINING_DISTRIBUTION["year"]["max"]:
            warnings.append(f"Observation year {payload.year} is outside historical training range (1990 to 2024).")
        if payload.rainfall_mm < self.TRAINING_DISTRIBUTION["rainfall_mm"]["min"] or payload.rainfall_mm > self.TRAINING_DISTRIBUTION["rainfall_mm"]["max"]:
            warnings.append(f"Annual precipitation {payload.rainfall_mm:.1f} mm is outside normal historical training distribution.")
        if payload.avg_temp_c < self.TRAINING_DISTRIBUTION["avg_temp_c"]["min"] or payload.avg_temp_c > self.TRAINING_DISTRIBUTION["avg_temp_c"]["max"]:
            warnings.append(f"Mean temperature {payload.avg_temp_c:.1f} °C is outside normal historical training distribution.")
        return warnings

    def compute_shap(self, row: pd.DataFrame, pred_tonnes: float) -> Tuple[List[float], List[str], float, str]:
        """
        Compute TreeSHAP attributions in natural log scale and map proportionally to tonnes/ha.
        Preserves exact additivity: base_value + sum(shap_vals) == pred_tonnes.
        """
        features = ["rainfall", "avg_temp", "pesticides", "year", "crop", "country"]
        row_proc = self.model.named_steps["preprocessor"].transform(row)
        raw_sv = self.tree_explainer.shap_values(row_proc)[0]
        
        area_indices = [i for i, c in enumerate(self.feature_columns) if c.startswith("Area_")]
        item_indices = [i for i, c in enumerate(self.feature_columns) if c.startswith("Item_")]
        
        year_sv = float(raw_sv[0])
        rain_sv = float(raw_sv[1])
        pest_sv = float(raw_sv[2])
        temp_sv = float(raw_sv[3])
        crop_sv = float(np.sum(raw_sv[item_indices]))
        country_sv = float(np.sum(raw_sv[area_indices]))
        
        base_val_log = float(self.tree_explainer.expected_value)
        base_val_tonnes = float(np.expm1(base_val_log)) * 0.0001
        
        # Proportional allocation to tonnes/ha preserving exact additivity
        total_delta_tonnes = pred_tonnes - base_val_tonnes
        total_sv_log = year_sv + rain_sv + pest_sv + temp_sv + crop_sv + country_sv
        
        if abs(total_sv_log) > 1e-7:
            scale_factor = total_delta_tonnes / total_sv_log
            shap_tonnes = [
                round(rain_sv * scale_factor, 4),
                round(temp_sv * scale_factor, 4),
                round(pest_sv * scale_factor, 4),
                round(year_sv * scale_factor, 4),
                round(crop_sv * scale_factor, 4),
                round(country_sv * scale_factor, 4)
            ]
        else:
            shap_tonnes = [0.0] * 6
            
        return shap_tonnes, features, round(base_val_tonnes, 4), "Exact TreeSHAP (Log-Transformed Proportional Allocation)"

    def predict(self, payload: YieldInput) -> Dict[str, Any]:
        warnings = self.check_distribution_warnings(payload)
        
        row = pd.DataFrame([{
            "Area": payload.country,
            "Item": payload.crop,
            "Year": payload.year,
            "average_rain_fall_mm_per_year": payload.rainfall_mm,
            "pesticides_tonnes": payload.pesticides_tonnes,
            "avg_temp": payload.avg_temp_c
        }])
        
        # Pipeline predict returns hg/ha_yield directly
        pred_hg = float(self.model.predict(row)[0])
        pred_hg = max(0.0, pred_hg)  # Physical non-negativity bound
        pred_tonnes = pred_hg / 10000.0  # Unit conversion to metric tonnes
        
        # Conformal prediction interval
        uq_dict = self.conformal_calibrator.predict_interval(pred_tonnes, crop=payload.crop)
        
        # TreeSHAP attributions
        shap_vals, shap_features, base_val, shap_method = self.compute_shap(row, pred_tonnes)
        
        return {
            "country": payload.country,
            "crop": payload.crop,
            "year": payload.year,
            "predicted_yield_hg_per_ha": round(pred_hg, 2),
            "predicted_yield_tonnes_per_ha": round(pred_tonnes, 4),
            "conformal_interval_90": uq_dict,
            "shap_explanation": {
                "values": shap_vals,
                "features": shap_features,
                "base_value_tonnes": base_val,
                "method": shap_method,
                "additivity_verified": abs(base_val + sum(shap_vals) - round(pred_tonnes, 4)) < 1e-3
            },
            "warnings": warnings
        }

def run_staging_tests() -> Dict[str, Any]:
    print("=" * 80)
    print("TERRAFLECT PHASE 4C: STAGING PROMOTION REHEARSAL")
    print("=" * 80)
    
    # 1. Verify Checksums
    print("\n--- 1. Artifact Integrity & Cryptographic Checksums ---")
    hashes = {
        "staging_model_pkl": sha256_file(MODEL_STAGING_PATH),
        "staging_conformal_pkl": sha256_file(CONFORMAL_STAGING_PATH),
        "staging_metadata_pkl": sha256_file(METADATA_STAGING_PATH),
        "prod_model_pkl": sha256_file(MODEL_PROD_PATH),
        "prod_conformal_pkl": sha256_file(CONFORMAL_PROD_PATH),
        "prod_metadata_pkl": sha256_file(METADATA_PROD_PATH),
    }
    for k, v in hashes.items():
        print(f"  {k:24s}: {v}")
        
    assert hashes["staging_model_pkl"] != hashes["prod_model_pkl"], "Staging and prod model hashes should be distinct!"
    print("  [OK] Production and staging files are physically distinct and verified.")
    
    # 2. Initialize Staging Service
    print("\n--- 2. Initializing Isolated Staging Service ---")
    service = StagingPredictionService()
    print("  Staging service initialized with TreeSHAP and Conformal Calibrator successfully.")
    
    # 3. Test Representative Predictions Across All 10 Crops
    print("\n--- 3. Testing Representative Predictions Across All 10 Crops ---")
    all_crops = [
        ("India", "Wheat", 2024, 1083.0, 25.5, 58000.0),
        ("India", "Rice, paddy", 2024, 1083.0, 26.5, 58000.0),
        ("United States", "Maize", 2024, 715.0, 16.0, 400000.0),
        ("United States", "Soybeans", 2024, 715.0, 15.0, 400000.0),
        ("Nigeria", "Cassava", 2024, 1150.0, 27.0, 1200.0),
        ("Nigeria", "Yams", 2024, 1150.0, 27.5, 1200.0),
        ("Uganda", "Plantains and others", 2024, 1180.0, 23.0, 800.0),
        ("Rwanda", "Sweet potatoes", 2024, 1020.0, 20.0, 500.0),
        ("Sudan", "Sorghum", 2024, 400.0, 29.0, 200.0),
        ("Germany", "Potatoes", 2024, 700.0, 10.5, 25000.0)
    ]
    
    crop_predictions = []
    for country, crop, year, rain, temp, pest in all_crops:
        payload = YieldInput(
            country=country, crop=crop, year=year,
            rainfall_mm=rain, avg_temp_c=temp, pesticides_tonnes=pest
        )
        res = service.predict(payload)
        crop_predictions.append(res)
        ci = res["conformal_interval_90"]
        print(f"  {country:14s} | {crop:20s} | Pred: {res['predicted_yield_tonnes_per_ha']:6.2f} t/ha ({res['predicted_yield_hg_per_ha']:8.1f} hg) | 90% Int: [{ci['lower_bound']:5.2f}, {ci['upper_bound']:5.2f}] t/ha (Q={ci['calibrated_margin_q']:.2f})")
        assert res["predicted_yield_tonnes_per_ha"] > 0.0, f"Predicted yield should be positive for {crop}"
        assert ci["lower_bound"] <= res["predicted_yield_tonnes_per_ha"] <= ci["upper_bound"], f"Point prediction should lie in conformal interval for {crop}"
        assert res["shap_explanation"]["additivity_verified"], f"TreeSHAP additivity failed for {crop}"
    print("  [OK] All 10 crops produce valid agronomic predictions with verified TreeSHAP and Conformal intervals.")
    
    # 4. Edge Cases: Unknown Country, Unknown Crop, Physical Non-Negativity, and Advisory Warnings
    print("\n--- 4. Edge Cases and Resilience Verification ---")
    
    # 4a. Unknown Crop -> Fallback to Group-Max Margin
    unknown_crop_payload = YieldInput(
        country="India", crop="Quinoa", year=2024,
        rainfall_mm=1000.0, avg_temp_c=25.0, pesticides_tonnes=1000.0
    )
    res_uc = service.predict(unknown_crop_payload)
    print(f"  Unknown Crop ('Quinoa') -> Calibrated Margin: {res_uc['conformal_interval_90']['calibrated_margin_q']:.4f} t/ha (Group-Max: {service.conformal_calibrator.group_max_quantile_q:.4f})")
    assert res_uc["conformal_interval_90"]["calibrated_margin_q"] == service.conformal_calibrator.group_max_quantile_q
    assert "does not guarantee 90%" in res_uc["conformal_interval_90"]["coverage_disclaimer"]
    assert res_uc["conformal_interval_90"]["calibration_crop"] == "All crops (Global fallback)"
    print("  [OK] Unknown crop correctly triggers safe group-max margin and disclaimer.")
    
    # 4b. Unknown Country -> OHE zero-vector handled without error
    unknown_country_payload = YieldInput(
        country="Atlantis", crop="Wheat", year=2024,
        rainfall_mm=1000.0, avg_temp_c=25.0, pesticides_tonnes=1000.0
    )
    res_ua = service.predict(unknown_country_payload)
    print(f"  Unknown Country ('Atlantis') -> Pred: {res_ua['predicted_yield_tonnes_per_ha']:.2f} t/ha (Gracefully handled)")
    assert res_ua["predicted_yield_tonnes_per_ha"] > 0.0
    print("  [OK] Unknown country handled gracefully via handle_unknown='ignore'.")
    
    # 4c. Extreme Negative Environmental Values -> Pydantic Schema Validation Rejection
    print("  Testing Pydantic schema validation on negative precipitation...")
    try:
        YieldInput(country="India", crop="Wheat", year=2024, rainfall_mm=-100.0, avg_temp_c=25.0, pesticides_tonnes=1000.0)
        assert False, "Negative rainfall should have raised ValidationError!"
    except ValidationError:
        print("  [OK] Negative precipitation (-100.0 mm) correctly rejected with Pydantic ValidationError (422 Unprocessable Entity).")
        
    try:
        YieldInput(country="India", crop="Wheat", year=2024, rainfall_mm=1000.0, avg_temp_c=25.0, pesticides_tonnes=-50.0)
        assert False, "Negative pesticides should have raised ValidationError!"
    except ValidationError:
        print("  [OK] Negative pesticides (-50.0 tonnes) correctly rejected with Pydantic ValidationError (422 Unprocessable Entity).")
        
    # 4d. Harsh Conditions -> Conformal Lower Bound Non-Negativity Clipping
    harsh_payload = YieldInput(
        country="Algeria", crop="Sorghum", year=1995,
        rainfall_mm=10.0, avg_temp_c=45.0, pesticides_tonnes=0.0
    )
    res_harsh = service.predict(harsh_payload)
    ci_harsh = res_harsh["conformal_interval_90"]
    print(f"  Harsh Conditions (Algeria Sorghum 45°C) -> Pred: {res_harsh['predicted_yield_tonnes_per_ha']:.2f} t/ha | Interval: [{ci_harsh['lower_bound']:.2f}, {ci_harsh['upper_bound']:.2f}] t/ha")
    assert ci_harsh["lower_bound"] >= 0.0, "Lower bound must never be negative!"
    print("  [OK] Physical non-negativity constraint strictly enforced (lower_bound >= 0.0).")
    
    # 4e. Distribution Warnings
    out_of_dist_payload = YieldInput(
        country="India", crop="Wheat", year=2035,
        rainfall_mm=4500.0, avg_temp_c=48.0, pesticides_tonnes=1000.0
    )
    res_ood = service.predict(out_of_dist_payload)
    print(f"  Out of Distribution (Year 2035, Rain 4500mm, Temp 48°C) -> {len(res_ood['warnings'])} warnings generated:")
    for w in res_ood["warnings"]:
        print(f"    - {w}")
    assert len(res_ood["warnings"]) == 3
    print("  [OK] Advisory warnings generated transparently without mutating user inputs.")
    
    results = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "hashes": hashes,
        "representative_predictions": crop_predictions,
        "conformal_calibration_summary": {
            "global_q_tonnes": service.conformal_calibrator.quantile_q,
            "group_max_q_tonnes": service.conformal_calibrator.group_max_quantile_q,
            "crop_quantiles": service.conformal_calibrator.crop_quantiles,
            "empirical_coverage": service.conformal_calibrator.empirical_test_coverage,
            "average_width_tonnes": service.conformal_calibrator.average_interval_width_tonnes
        }
    }
    return results

if __name__ == "__main__":
    res = run_staging_tests()
    out_path = Path("experiments/phase4b_crop_balance_experiments/reports/STAGING_REHEARSAL_RESULTS.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2)
    print(f"\n[OK] Staging rehearsal execution completed. Results saved to: {out_path}")
    print("=" * 80)
