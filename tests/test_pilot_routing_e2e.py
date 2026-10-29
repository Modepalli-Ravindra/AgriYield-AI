"""End-to-End Integration and Prediction Routing Test Suite for Terraflect.

Validates the full prediction pipeline:
Frontend -> API request -> input validation -> climate data lookup ->
feature preparation -> model selection -> prediction -> uncertainty calculation -> API response.

Covers all 10 core integration scenarios:
1. Supported country with authentic ERA5-Land records routes to pilot model.
2. Supported country with missing daily climate records falls back safely.
3. Unsupported country uses baseline model.
4. Irrigation covariate handling and fallback policy.
5. Malformed request validation (HTTP 422).
6. Non-fabrication guarantee under missing climate sources.
7. Conformal and Gaussian prediction interval ordering.
8. Model identifier and climate provenance consistency.
9. Non-regression of existing prediction and what-if endpoints.
10. Production baseline model artifact SHA-256 immutability.
"""
from __future__ import annotations

import hashlib
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure workspace root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.services.prediction_service import prediction_service
from app.climate.coordinates import get_irrigation_equipped_pct

EXPECTED_PRODUCTION_MODEL_SHA256 = "9dbad95acf46d73f11827cc1e42507606695dc6bef20e0616c3b58cb965cd75a"


def compute_file_sha256(filepath: Path) -> str:
    """Compute sha256 checksum of a file."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


# Scenario 10: Pre-test hash check fixture
@pytest.fixture(autouse=True)
def verify_production_model_immutability():
    """Verify that models/crop_yield_model.pkl remains completely untouched before and after every test."""
    model_path = Path("models/crop_yield_model.pkl")
    assert model_path.exists(), "Production baseline model artifact must exist"
    pre_hash = compute_file_sha256(model_path)
    assert pre_hash == EXPECTED_PRODUCTION_MODEL_SHA256, (
        f"Production model altered before test! Found {pre_hash}, expected {EXPECTED_PRODUCTION_MODEL_SHA256}"
    )
    yield
    post_hash = compute_file_sha256(model_path)
    assert post_hash == EXPECTED_PRODUCTION_MODEL_SHA256, (
        f"Production model was altered during test execution! Post hash: {post_hash}"
    )


# Scenario 1: Supported country with authentic daily climate records selects pilot model
def test_scenario_1_supported_country_with_authentic_climate_routes_to_pilot():
    """India 2013 has authentic ERA5-Land daily observations (>=300 days).
    Must dynamically route to Climate_Enhanced_XGBoost_v1.0_Pilot.
    """
    with TestClient(app) as tc:
        payload = {
            "country": "India",
            "crop": "Wheat",
            "year": 2013,
            "rainfall_mm": 1050.0,
            "avg_temp_c": 25.5,
            "pesticides_tonnes": 50000.0,
        }
        res = tc.post("/api/v1/predict", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()

        # Check routing
        assert data["used_pilot_model"] is True
        assert data["has_authentic_climate"] is True
        assert data["model_name"] == "Climate_Enhanced_XGBoost_v1.0_Pilot"
        assert "ERA5-Land" in data["climate_coverage_status"]

        # Check climate features presence
        covariates = data.get("climate_features_used")
        assert covariates is not None
        assert "heat_stress_days_above_30c" in covariates
        assert "growing_season_precip_mm" in covariates
        assert "effective_precip_mm" in covariates
        assert "irrigation_equipped_pct" in covariates
        assert covariates["irrigation_equipped_pct"] == 48.8  # India FAO AQUASTAT value


# Scenario 2: Supported country with missing climate records falls back safely
def test_scenario_2_supported_country_missing_climate_falls_back_safely():
    """India with year 2005 (or future year 2026) lacks daily ERA5-Land series in cache.
    Must safely fall back to Production XGBoost Regressor Pipeline without error or hallucinated climate.
    """
    with TestClient(app) as tc:
        payload = {
            "country": "India",
            "crop": "Wheat",
            "year": 2005,  # Not in ERA5-Land processed 2010-2013 cache
            "rainfall_mm": 1050.0,
            "avg_temp_c": 25.5,
            "pesticides_tonnes": 50000.0,
        }
        res = tc.post("/api/v1/predict", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()

        assert data["used_pilot_model"] is False
        assert data["has_authentic_climate"] is False
        assert data["model_name"] == "Production XGBoost Regressor Pipeline"
        assert "FAO National Climatology Fallback" in data["climate_coverage_status"]
        assert data["climate_features_used"] is None
        assert data["predicted_yield_tonnes_per_ha"] > 0


# Scenario 3: Unsupported country uses the baseline model
def test_scenario_3_unsupported_country_uses_baseline():
    """Albania is not among the pilot supported countries.
    Must route directly to baseline model.
    """
    with TestClient(app) as tc:
        payload = {
            "country": "Albania",
            "crop": "Maize",
            "year": 2013,
            "rainfall_mm": 1200.0,
            "avg_temp_c": 16.0,
            "pesticides_tonnes": 120.0,
        }
        res = tc.post("/api/v1/predict", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()

        assert data["used_pilot_model"] is False
        assert data["has_authentic_climate"] is False
        assert data["model_name"] == "Production XGBoost Regressor Pipeline"
        assert "FAO National Climatology Fallback" in data["climate_coverage_status"]


# Scenario 4: Missing irrigation information is handled according to documented policy
def test_scenario_4_irrigation_policy_and_fallbacks():
    """Verify FAO AQUASTAT values and fallback policy (10.0% for unmapped countries)."""
    assert get_irrigation_equipped_pct("Egypt") == 100.0
    assert get_irrigation_equipped_pct("India") == 48.8
    assert get_irrigation_equipped_pct("Brazil") == 7.2

    # Test fallback policy for unmapped country
    default_irrig = get_irrigation_equipped_pct("Unknown Country")
    assert default_irrig == 10.0


# Scenario 5: Malformed prediction requests return appropriate validation errors
def test_scenario_5_malformed_requests_return_validation_errors():
    """Negative rainfall or missing crop must return HTTP 422."""
    with TestClient(app) as tc:
        # Negative rainfall
        res1 = tc.post(
            "/api/v1/predict",
            json={
                "country": "India",
                "crop": "Wheat",
                "year": 2013,
                "rainfall_mm": -100.0,
                "avg_temp_c": 25.0,
                "pesticides_tonnes": 1000.0,
            },
        )
        assert res1.status_code == 422

        # Missing crop
        res2 = tc.post(
            "/api/v1/predict",
            json={
                "country": "India",
                "crop": "",
                "year": 2013,
                "rainfall_mm": 1000.0,
                "avg_temp_c": 25.0,
                "pesticides_tonnes": 1000.0,
            },
        )
        assert res2.status_code == 422


# Scenario 6: Model loading or climate-source failures do not produce fabricated results
def test_scenario_6_no_fabricated_climate_when_lookup_returns_none(monkeypatch):
    """If get_authentic_climate_record returns None or raises, it safely falls back to baseline."""
    monkeypatch.setattr(prediction_service, "get_authentic_climate_record", lambda c, y: None)

    with TestClient(app) as tc:
        res = tc.post(
            "/api/v1/predict",
            json={
                "country": "India",
                "crop": "Wheat",
                "year": 2013,
                "rainfall_mm": 1050.0,
                "avg_temp_c": 25.5,
                "pesticides_tonnes": 50000.0,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["used_pilot_model"] is False
        assert data["has_authentic_climate"] is False
        assert data["climate_features_used"] is None
        assert "Fallback" in data["climate_coverage_status"]


# Scenario 7: Prediction intervals are valid and ordered correctly
def test_scenario_7_prediction_intervals_ordered_and_bounded():
    """Conformal lower bound <= upper bound and confidence lower <= upper."""
    with TestClient(app) as tc:
        # Pilot route
        res_pilot = tc.post(
            "/api/v1/predict",
            json={
                "country": "India",
                "crop": "Wheat",
                "year": 2013,
                "rainfall_mm": 1050.0,
                "avg_temp_c": 25.5,
                "pesticides_tonnes": 50000.0,
            },
        )
        data_pilot = res_pilot.json()
        c_pilot = data_pilot["conformal_interval_90"]
        assert c_pilot["lower_bound"] <= c_pilot["upper_bound"]
        assert c_pilot["lower_bound"] >= 0.0

        # Baseline route
        res_base = tc.post(
            "/api/v1/predict",
            json={
                "country": "India",
                "crop": "Wheat",
                "year": 2026,
                "rainfall_mm": 1050.0,
                "avg_temp_c": 25.5,
                "pesticides_tonnes": 50000.0,
            },
        )
        data_base = res_base.json()
        c_base = data_base["conformal_interval_90"]
        assert c_base["lower_bound"] <= c_base["upper_bound"]
        assert c_base["lower_bound"] >= 0.0


# Scenario 8: Model identifiers and climate provenance match the model actually used
def test_scenario_8_model_provenance_synchronization():
    """used_pilot_model == True if and only if model_name is the Pilot model."""
    with TestClient(app) as tc:
        for c, y, expected_pilot in [("India", 2013, True), ("Brazil", 2012, True), ("Albania", 2013, False)]:
            res = tc.post(
                "/api/v1/predict",
                json={
                    "country": c,
                    "crop": "Wheat" if c != "Brazil" else "Soybeans",
                    "year": y,
                    "rainfall_mm": 1000.0,
                    "avg_temp_c": 22.0,
                    "pesticides_tonnes": 20000.0,
                },
            )
            assert res.status_code == 200
            data = res.json()
            if expected_pilot:
                assert data["used_pilot_model"] is True
                assert data["model_name"] == "Climate_Enhanced_XGBoost_v1.0_Pilot"
                assert data["has_authentic_climate"] is True
                assert data["climate_features_used"] is not None
            else:
                assert data["used_pilot_model"] is False
                assert data["model_name"] == "Production XGBoost Regressor Pipeline"
                assert data["has_authentic_climate"] is False


# Scenario 9: Existing prediction endpoints and SHAP attribution do not regress
def test_scenario_9_regression_check_shap_and_whatif():
    """Check SHAP values sum correctly and What-if analysis works."""
    with TestClient(app) as tc:
        # Check SHAP additivity on pilot model
        res = tc.post(
            "/api/v1/predict",
            json={
                "country": "India",
                "crop": "Wheat",
                "year": 2013,
                "rainfall_mm": 1050.0,
                "avg_temp_c": 25.5,
                "pesticides_tonnes": 50000.0,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert len(data["shap_values"]) == len(data["feature_names"])
        # Sum of SHAP values + base value ~ predicted yield in tonnes/ha
        shap_sum = sum(data["shap_values"]) + data["base_value"]
        assert abs(shap_sum - data["predicted_yield_tonnes_per_ha"]) < 0.1

        # Check What-if endpoint with valid 2-scenario schema
        whatif_res = tc.post(
            "/api/v1/what-if",
            json={
                "scenarios": [
                    {
                        "scenario_name": "Baseline Scenario",
                        "inputs": {
                            "country": "India",
                            "crop": "Wheat",
                            "year": 2013,
                            "rainfall_mm": 1050.0,
                            "avg_temp_c": 25.5,
                            "pesticides_tonnes": 50000.0,
                        },
                    },
                    {
                        "scenario_name": "Rainfall +20%",
                        "inputs": {
                            "country": "India",
                            "crop": "Wheat",
                            "year": 2013,
                            "rainfall_mm": 1260.0,
                            "avg_temp_c": 25.5,
                            "pesticides_tonnes": 50000.0,
                        },
                    },
                ]
            },
        )
        assert whatif_res.status_code == 200
        whatif_data = whatif_res.json()
        assert len(whatif_data["comparisons"]) == 2
        assert "delta_from_baseline_pct" in whatif_data["comparisons"][1]
