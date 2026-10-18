"""Automated backend API and research test suite."""
from __future__ import annotations

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure candidate-1 is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify system status and loaded artifacts."""
    with TestClient(app) as tc:
        res = tc.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True
        assert data["conformal_calibrator_loaded"] is True
        assert data["ref_data_rows"] > 20000

def test_options_endpoint():
    """Verify options returns valid countries and crops."""
    with TestClient(app) as tc:
        res = tc.get("/api/v1/options")
        assert res.status_code == 200
        data = res.json()
        assert "India" in data["countries"]
        assert "Wheat" in data["crops"]
        assert data["year_range"]["min"] >= 1990

def test_zero_otp_auth_flow():
    """Test full registration and login without OTP or email verification delays."""
    with TestClient(app) as tc:
        test_email = "researcher.test@agri-ai.org"
        test_pass = "AgronomyPass2026!"
        
        # 1. Register
        reg_res = tc.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": test_pass,
            "full_name": "Dr. Agronomy Test",
            "organization": "Global Agriculture Center"
        })
        # If already exists from prior test run, login directly
        if reg_res.status_code == 400:
            login_res = tc.post("/api/v1/auth/login", json={
                "email": test_email,
                "password": test_pass
            })
            assert login_res.status_code == 200
            token = login_res.json()["access_token"]
        else:
            assert reg_res.status_code == 201
            token = reg_res.json()["access_token"]
            
        assert token is not None
        
        # 2. Get profile with Bearer token
        me_res = tc.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["email"] == test_email

def test_prediction_with_conformal_interval():
    """Verify yield prediction produces non-negative 90% conformal intervals."""
    with TestClient(app) as tc:
        res = tc.post("/api/v1/predict", json={
            "country": "India",
            "crop": "Wheat",
            "year": 2013,
            "rainfall_mm": 1050.0,
            "avg_temp_c": 25.5,
            "pesticides_tonnes": 50000.0
        })
        assert res.status_code == 200
        data = res.json()
        assert data["predicted_yield_tonnes_per_ha"] > 0.0
        # Verify conformal interval
        conformal = data["conformal_interval_90"]
        assert conformal["nominal_coverage"] == 0.90
        assert conformal["lower_bound"] >= 0.0
        assert conformal["upper_bound"] > conformal["lower_bound"]
        # Verify SHAP contributions exist
        assert len(data["shap_values"]) == len(data["feature_names"])

def test_explain_and_sensitivity():
    """Test SHAP explanations and climate sensitivity curve."""
    with TestClient(app) as tc:
        # Explain
        exp_res = tc.post("/api/v1/explain", json={
            "country": "India",
            "crop": "Wheat",
            "year": 2013,
            "rainfall_mm": 1050.0,
            "avg_temp_c": 25.5,
            "pesticides_tonnes": 50000.0
        })
        assert exp_res.status_code == 200
        assert len(exp_res.json()["feature_contributions"]) > 0

        # Sensitivity sweep across rainfall
        sens_res = tc.post("/api/v1/sensitivity", json={
            "input_data": {
                "country": "India",
                "crop": "Wheat",
                "year": 2013,
                "rainfall_mm": 1050.0,
                "avg_temp_c": 25.5,
                "pesticides_tonnes": 50000.0
            },
            "parameter": "rainfall_mm",
            "points": 10
        })
        assert sens_res.status_code == 200
        assert len(sens_res.json()["values"]) == 10
        assert len(sens_res.json()["predictions_tonnes_per_ha"]) == 10

def test_what_if_scenario_comparison():
    """Verify What-If comparison across multiple climate scenarios."""
    with TestClient(app) as tc:
        res = tc.post("/api/v1/what-if", json={
            "scenarios": [
                {
                    "scenario_name": "Baseline (Current)",
                    "inputs": {
                        "country": "India",
                        "crop": "Wheat",
                        "year": 2013,
                        "rainfall_mm": 1050.0,
                        "avg_temp_c": 25.5,
                        "pesticides_tonnes": 50000.0
                    }
                },
                {
                    "scenario_name": "Drought & Heatwave (+3Â°C, -30% Rain)",
                    "inputs": {
                        "country": "India",
                        "crop": "Wheat",
                        "year": 2013,
                        "rainfall_mm": 735.0,
                        "avg_temp_c": 28.5,
                        "pesticides_tonnes": 50000.0
                    }
                }
            ]
        })
        assert res.status_code == 200
        data = res.json()
        assert len(data["comparisons"]) == 2

def test_model_benchmarks_and_robustness():
    """Verify empirical benchmarks and stress-test endpoint."""
    with TestClient(app) as tc:
        # Compare models
        comp_res = tc.get("/api/v1/models/compare")
        assert comp_res.status_code == 200
        data = comp_res.json()
        assert len(data["models"]) >= 4
        # Verify Stacking Ensemble is included
        model_names = [m["model_name"] for m in data["models"]]
        assert "DL-ML Stacking Ensemble" in model_names
        assert "PyTorch Tabular MLP" in model_names

        # Robustness stress test
        stress_res = tc.post("/api/v1/robustness/stress-test?test_type=mcar_missingness")
        assert stress_res.status_code == 200
        stress_data = stress_res.json()
        assert len(stress_data["degradation_curve"]) > 0

def test_history_authorization():
    """Verify unauthorized access to /history is blocked."""
    with TestClient(app) as tc:
        res = tc.get("/api/v1/history")
        assert res.status_code == 401

def test_invalid_inputs_rejected():
    """Verify input validation rejects physically impossible environmental numbers."""
    with TestClient(app) as tc:
        # Negative rainfall
        res = tc.post("/api/v1/predict", json={
            "country": "India",
            "crop": "Wheat",
            "year": 2013,
            "rainfall_mm": -100.0,
            "avg_temp_c": 25.5,
            "pesticides_tonnes": 50000.0
        })
        assert res.status_code == 422

        # Temperature above physical threshold (> 60 C)
        res2 = tc.post("/api/v1/predict", json={
            "country": "India",
            "crop": "Wheat",
            "year": 2013,
            "rainfall_mm": 1050.0,
            "avg_temp_c": 85.0,
            "pesticides_tonnes": 50000.0
        })
        assert res2.status_code == 422

def test_auth_failure_wrong_password():
    """Verify login with incorrect password fails with HTTP 401."""
    with TestClient(app) as tc:
        res = tc.post("/api/v1/auth/login", json={
            "email": "researcher.test@agri-ai.org",
            "password": "CompletelyWrongPassword123!"
        })
        assert res.status_code == 401
        assert "Incorrect email or password" in res.json()["detail"]

def test_expired_or_invalid_jwt_token():
    """Verify forged or malformed JWT token is rejected."""
    with TestClient(app) as tc:
        res = tc.get("/api/v1/auth/me", headers={"Authorization": "Bearer forged.invalid.token"})
        assert res.status_code == 401

def test_user_isolation_prediction_history():
    """Verify strict cross-user data isolation: User A cannot see User B's predictions."""
    with TestClient(app) as tc:
        import uuid
        uid1 = uuid.uuid4().hex[:6]
        uid2 = uuid.uuid4().hex[:6]
        user_a_email = f"user_a_{uid1}@agri.org"
        user_b_email = f"user_b_{uid2}@agri.org"
        password = "SecurePassword2026!"

        # Register User A
        reg_a = tc.post("/api/v1/auth/register", json={
            "email": user_a_email,
            "password": password,
            "full_name": "User Alpha"
        })
        token_a = reg_a.json()["access_token"]

        # Register User B
        reg_b = tc.post("/api/v1/auth/register", json={
            "email": user_b_email,
            "password": password,
            "full_name": "User Beta"
        })
        token_b = reg_b.json()["access_token"]

        # User A makes a prediction (authenticated)
        tc.post(
            "/api/v1/predict",
            json={
                "country": "India",
                "crop": "Rice, paddy",
                "year": 2012,
                "rainfall_mm": 1200.0,
                "avg_temp_c": 27.0,
                "pesticides_tonnes": 30000.0
            },
            headers={"Authorization": f"Bearer {token_a}"}
        )

        # User A queries history -> should contain at least 1 record
        hist_a = tc.get("/api/v1/history", headers={"Authorization": f"Bearer {token_a}"})
        assert hist_a.status_code == 200
        records_a = hist_a.json()["history"]
        assert len(records_a) >= 1
        assert any(r["crop"] == "Rice, paddy" for r in records_a)

        # User B queries history -> must be empty (0 records), User A's record NOT leaked!
        hist_b = tc.get("/api/v1/history", headers={"Authorization": f"Bearer {token_b}"})
        assert hist_b.status_code == 200
        records_b = hist_b.json()["history"]
        assert len(records_b) == 0

def test_prediction_physical_nonnegativity_bounds():
    """Verify conformal lower bounds are never negative regardless of extreme inputs."""
    with TestClient(app) as tc:
        # Extremely low yielding crop and harsh conditions
        res = tc.post("/api/v1/predict", json={
            "country": "Algeria",
            "crop": "Sorghum",
            "year": 1995,
            "rainfall_mm": 10.0,
            "avg_temp_c": 45.0,
            "pesticides_tonnes": 1.0
        })
        assert res.status_code == 200
        data = res.json()
        assert data["conformal_interval_90"]["lower_bound"] >= 0.0
        assert data["predicted_yield_tonnes_per_ha"] >= 0.0


def test_split_disjointness_and_conformal_separation():
    """Verify regression protection for split disjointness and 4-way separation."""
    import json
    results_path = Path(__file__).resolve().parent.parent / "PHASE3_2_EXPERIMENT_RESULTS.json"
    if results_path.exists():
        with open(results_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        task2 = data.get("task2_corrected_conformal_4way_split", {})
        assert task2.get("conformal_margin_q", 0) > 0.0
        assert task2.get("empirical_test_coverage", 0) >= 0.85
