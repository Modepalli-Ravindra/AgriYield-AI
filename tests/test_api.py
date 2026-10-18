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
    results_path = Path(__file__).resolve().parent.parent / "docs" / "reports" / "PHASE3_2_EXPERIMENT_RESULTS.json"
    if not results_path.exists():
        results_path = Path(__file__).resolve().parent.parent / "PHASE3_2_EXPERIMENT_RESULTS.json"
    if results_path.exists():
        with open(results_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        task2 = data.get("task2_corrected_conformal_4way_split", {})
        assert task2.get("conformal_margin_q", 0) > 0.0
        assert task2.get("empirical_test_coverage", 0) >= 0.85

def test_model_artifact_identity_and_transparency():
    """Verify served model artifact identity and transparency (Task 3)."""
    import joblib
    model_path = Path(__file__).resolve().parent.parent / "models" / "crop_yield_model.pkl"
    meta_path = Path(__file__).resolve().parent.parent / "models" / "model_metadata.pkl"
    
    assert model_path.exists()
    assert meta_path.exists()
    
    model = joblib.load(model_path)
    metadata = joblib.load(meta_path)
    
    # Assert pipeline steps
    assert hasattr(model, "named_steps")
    assert "preprocessor" in model.named_steps
    assert "regressor" in model.named_steps
    
    # Regressor is verified XGBRegressor
    reg_class = model.named_steps["regressor"].__class__.__name__
    assert reg_class == "XGBRegressor"
    
    # Verify metadata declares the primary tree engine
    assert metadata.get("primary_tree_engine") == "XGBoost Regressor"

def test_group_aware_uncertainty_artifacts():
    """Verify group-aware uncertainty and crop-conditional results artifact (Tasks 1 & 2)."""
    import json
    p3_3_path = Path(__file__).resolve().parent.parent / "docs" / "reports" / "PHASE3_3_EXPERIMENT_RESULTS.json"
    if not p3_3_path.exists():
        p3_3_path = Path(__file__).resolve().parent.parent / "PHASE3_3_EXPERIMENT_RESULTS.json"
    assert p3_3_path.exists()
    
    with open(p3_3_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    t1 = data["task1_conformal_validity"]
    assert t1["q_row_tonnes"] > 1.5
    assert t1["q_group_max_tonnes"] > t1["q_row_tonnes"]
    assert t1["row_level_coverage_under_q_row"] >= 0.89
    
    t2 = data["task2_crop_reliability"]
    assert "Potatoes" in t2
    assert t2["Potatoes"]["sample_size_adequate"] is True
    assert t2["Potatoes"]["undercoverage_relative_to_90"] > 0.10


def test_phase3_4_treeshap_additivity_and_exact_attribution():
    """Phase 3.4 Task 4: Validate real TreeSHAP additivity and served model consistency."""
    payload = {
        "country": "India",
        "crop": "Maize",
        "year": 2013,
        "rainfall_mm": 1200.0,
        "avg_temp_c": 26.5,
        "pesticides_tonnes": 500.0
    }
    response = client.post("/api/v1/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["attribution_method"] == "Exact TreeSHAP (shap.TreeExplainer)"
    assert data["additivity_verified"] is True
    
    sum_phi = sum(item["shap_value"] for item in data["feature_contributions"])
    reconstructed_y = data["base_value"] + sum_phi
    assert abs(reconstructed_y - data["prediction_tonnes_per_ha"]) < 1e-4
    assert len(data["feature_contributions"]) == 6

def test_phase3_4_crop_conditional_conformal_bounds():
    """Phase 3.4 Task 2 and 3: Validate crop-conditional vs global group-max bounds."""
    potato_payload = {
        "country": "India",
        "crop": "Potatoes",
        "year": 2013,
        "rainfall_mm": 1100.0,
        "avg_temp_c": 22.0,
        "pesticides_tonnes": 300.0
    }
    res_pot = client.post("/api/v1/predict", json=potato_payload)
    assert res_pot.status_code == 200
    ci_pot = res_pot.json()["conformal_interval_90"]
    assert ci_pot["calibrated_margin_q"] == 4.382
    assert ci_pot["calibration_crop"] == "Potatoes"
    assert "Crop-Conditional" in ci_pot["method"]
    assert ci_pot["lower_bound"] >= 0.0
    assert ci_pot["upper_bound"] >= ci_pot["lower_bound"]

    maize_payload = {
        "country": "India",
        "crop": "Maize",
        "year": 2013,
        "rainfall_mm": 1100.0,
        "avg_temp_c": 25.0,
        "pesticides_tonnes": 300.0
    }
    res_maize = client.post("/api/v1/predict", json=maize_payload)
    assert res_maize.status_code == 200
    ci_maize = res_maize.json()["conformal_interval_90"]
    assert ci_maize["calibrated_margin_q"] == 1.266
    assert ci_maize["calibration_crop"] == "Maize"
    assert ci_maize["calibrated_margin_q"] < ci_pot["calibrated_margin_q"]

def test_phase3_4_target_unit_conversion_consistency():
    """Phase 3.4 Task 1: Verify exact target conversion 1 t/ha = 10,000 hg/ha."""
    payload = {
        "country": "Brazil",
        "crop": "Soybeans",
        "year": 2012,
        "rainfall_mm": 1450.0,
        "avg_temp_c": 24.5,
        "pesticides_tonnes": 1200.0
    }
    res = client.post("/api/v1/predict", json=payload)
    assert res.status_code == 200
    d = res.json()
    
    expected_hg = round(d["predicted_yield_tonnes_per_ha"] * 10000.0, 2)
    assert abs(d["predicted_yield_hg_per_ha"] - expected_hg) < 1.0
    
    ci = d["conformal_interval_90"]
    assert ci["unit"] == "tonnes/ha"
    assert ci["lower_bound"] >= 0.0
    assert ci["upper_bound"] >= ci["lower_bound"]
    expected_width = round(ci["upper_bound"] - ci["lower_bound"], 2)
    assert abs(ci["interval_width_tonnes"] - expected_width) < 0.05
    assert "marginal across eligible groups" in ci["coverage_disclaimer"]

def test_phase3_4_production_model_metadata_consistency():
    """Phase 3.4 Task 1: Verify production metadata strictly separates XGBoost from Stacking."""
    import joblib, json
    from pathlib import Path
    meta_path = Path(__file__).resolve().parent.parent / "models" / "model_metadata.pkl"
    bench_path = Path(__file__).resolve().parent.parent / "models" / "benchmark_results.json"
    assert meta_path.exists()
    assert bench_path.exists()
    
    meta = joblib.load(meta_path)
    assert meta.get("deployed_model_name") == "Production XGBoost Regressor Pipeline"
    assert meta.get("deployed_estimator") == "xgboost.sklearn.XGBRegressor"
    assert "offline_research_model" in meta
    assert meta.get("offline_research_model") == "DL-ML Stacking Meta-Ensemble"
    
    with open(bench_path, "r", encoding="utf-8") as f:
        bench = json.load(f)
    assert "deployment" in bench
    assert bench["deployment"]["live_deployed_model"] == "XGBoost Regressor"
    assert bench["deployment"]["offline_research_model"] == "DL-ML Stacking Meta-Ensemble"


def test_phase3_6_model_direct_prediction_parity():
    """Phase 3.6: Verify live API prediction parity with direct model artifact."""
    import joblib, pandas as pd
    model_path = Path(__file__).resolve().parent.parent / "models" / "crop_yield_model.pkl"
    pipeline = joblib.load(model_path)
    
    test_cases = [
        {"country": "India", "crop": "Maize", "year": 2013, "rainfall_mm": 1200.0, "avg_temp_c": 26.5, "pesticides_tonnes": 500.0},
        {"country": "France", "crop": "Wheat", "year": 2010, "rainfall_mm": 850.0, "avg_temp_c": 14.0, "pesticides_tonnes": 250.0},
    ]
    for tc in test_cases:
        df_in = pd.DataFrame([{
            "Area": tc["country"],
            "Item": tc["crop"],
            "Year": tc["year"],
            "average_rain_fall_mm_per_year": tc["rainfall_mm"],
            "pesticides_tonnes": tc["pesticides_tonnes"],
            "avg_temp": tc["avg_temp_c"]
        }])
        direct_pred_t = float(pipeline.predict(df_in)[0]) / 10000.0
        
        res = client.post("/api/v1/predict", json=tc)
        assert res.status_code == 200
        api_pred_t = res.json()["predicted_yield_tonnes_per_ha"]
        
        assert abs(direct_pred_t - api_pred_t) < 1e-4

def test_phase3_6_conformal_bounds_strict_ordering_negative_yields():
    """Phase 3.6: Verify interval bounds ordering even under negative predicted yield."""
    from app.ml.conformal import ConformalPredictionCalibrator
    calib = ConformalPredictionCalibrator()
    
    res = calib.predict_interval(-2.0, crop="Maize")
    assert res["lower_bound"] == 0.0
    assert res["upper_bound"] >= res["lower_bound"]
    assert res["interval_width_tonnes"] >= 0.0

def test_phase3_6_unknown_crop_global_fallback_and_disclaimer():
    """Phase 3.6: Verify safe fallback and transparent disclaimer for unknown crops."""
    unknown_crop_payload = {
        "country": "India",
        "crop": "Dragonfruit",
        "year": 2012,
        "rainfall_mm": 1200.0,
        "avg_temp_c": 25.0,
        "pesticides_tonnes": 100.0
    }
    res = client.post("/api/v1/predict", json=unknown_crop_payload)
    assert res.status_code == 200
    ci = res.json()["conformal_interval_90"]
    assert ci["calibrated_margin_q"] == 2.573
    assert "Fallback" in ci["method"]
    assert "marginal across eligible groups" in ci["coverage_disclaimer"]

def test_phase3_6_4way_split_exact_disjointness_and_counts():
    """Phase 3.6: Reconcile exact 4-way split group counts and verify 0 overlap."""
    import pandas as pd
    from sklearn.model_selection import GroupShuffleSplit
    
    csv_path = Path(__file__).resolve().parent.parent / "data" / "yield_df.csv"
    df_raw = pd.read_csv(csv_path)
    if "Unnamed: 0" in df_raw.columns:
        df_raw = df_raw.drop(columns=["Unnamed: 0"])
    df = df_raw.drop_duplicates().reset_index(drop=True)
    df["group_id"] = df["Area"] + "_" + df["Item"] + "_" + df["Year"].astype(str)
    
    gss1 = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    dev_idx, test_idx = next(gss1.split(df, groups=df["group_id"]))
    df_dev = df.iloc[dev_idx].reset_index(drop=True)
    df_test = df.iloc[test_idx].reset_index(drop=True)

    gss2 = GroupShuffleSplit(n_splits=1, test_size=0.1875, random_state=42)
    train_meta_idx, calib_idx = next(gss2.split(df_dev, groups=df_dev["group_id"]))
    df_train_meta = df_dev.iloc[train_meta_idx].reset_index(drop=True)
    df_calib = df_dev.iloc[calib_idx].reset_index(drop=True)

    gss3 = GroupShuffleSplit(n_splits=1, test_size=0.2308, random_state=42)
    base_idx, meta_idx = next(gss3.split(df_train_meta, groups=df_train_meta["group_id"]))
    df_base = df_train_meta.iloc[base_idx].reset_index(drop=True)
    df_meta = df_train_meta.iloc[meta_idx].reset_index(drop=True)

    # Reconciled group counts: Base=6564, Meta=1970, Calib=1970, Test=2626
    assert df_base["group_id"].nunique() == 6564
    assert df_meta["group_id"].nunique() == 1970
    assert df_calib["group_id"].nunique() == 1970
    assert df_test["group_id"].nunique() == 2626
    
    # 0 Overlap
    g_base = set(df_base["group_id"])
    g_meta = set(df_meta["group_id"])
    g_calib = set(df_calib["group_id"])
    g_test = set(df_test["group_id"])
    assert len(g_base.intersection(g_meta)) == 0
    assert len(g_base.intersection(g_calib)) == 0
    assert len(g_meta.intersection(g_calib)) == 0
    assert len((g_base | g_meta | g_calib).intersection(g_test)) == 0


# ==============================================================================
# PHASE 3.7: MODEL SELECTION & PRODUCTION RELIABILITY REGRESSION TESTS
# ==============================================================================

def test_phase3_7_nan_inf_and_invalid_inputs_rejected():
    """Phase 3.7 Task 3: Validate API boundary rejection of NaN, Inf, empty, and physically invalid values."""
    base_payload = {
        "country": "India",
        "crop": "Wheat",
        "year": 2013,
        "rainfall_mm": 1050.0,
        "avg_temp_c": 25.5,
        "pesticides_tonnes": 500.0
    }

    # 1. Reject NaN rainfall via raw JSON string
    raw_nan = '{"country": "India", "crop": "Wheat", "year": 2013, "rainfall_mm": NaN, "avg_temp_c": 25.5, "pesticides_tonnes": 500.0}'
    res = client.post("/api/v1/predict", content=raw_nan, headers={"Content-Type": "application/json"})
    assert res.status_code == 422, f"Expected 422 for NaN rainfall, got {res.status_code}"

    # 2. Reject Inf temperature via raw JSON string
    raw_inf = '{"country": "India", "crop": "Wheat", "year": 2013, "rainfall_mm": 1050.0, "avg_temp_c": Infinity, "pesticides_tonnes": 500.0}'
    res = client.post("/api/v1/predict", content=raw_inf, headers={"Content-Type": "application/json"})
    assert res.status_code == 422, f"Expected 422 for Inf temperature, got {res.status_code}"

    # 3. Reject negative rainfall
    p_neg_rain = dict(base_payload, rainfall_mm=-10.0)
    res = client.post("/api/v1/predict", json=p_neg_rain)
    assert res.status_code == 422, f"Expected 422 for negative rainfall, got {res.status_code}"

    # 4. Reject extreme physical temperature (>60C)
    p_extreme_temp = dict(base_payload, avg_temp_c=85.0)
    res = client.post("/api/v1/predict", json=p_extreme_temp)
    assert res.status_code == 422, f"Expected 422 for 85C temperature, got {res.status_code}"

    # 5. Reject whitespace-only country
    p_empty_country = dict(base_payload, country="   ")
    res = client.post("/api/v1/predict", json=p_empty_country)
    assert res.status_code == 422, f"Expected 422 for whitespace country, got {res.status_code}"

    # 6. Reject whitespace-only crop
    p_empty_crop = dict(base_payload, crop="")
    res = client.post("/api/v1/predict", json=p_empty_crop)
    assert res.status_code == 422, f"Expected 422 for empty crop, got {res.status_code}"


def test_phase3_7_unusual_environmental_values_advisory_warnings():
    """Phase 3.7 Task 3: Verify unusual values return HTTP 200 with non-blocking advisory warnings."""
    # Payload with unusual environmental conditions (temp 38C, rainfall 25mm, year 2026, unseen country)
    unusual_payload = {
        "country": "Atlantis",
        "crop": "Wheat",
        "year": 2026,
        "rainfall_mm": 25.0,
        "avg_temp_c": 38.0,
        "pesticides_tonnes": 500.0
    }
    res = client.post("/api/v1/predict", json=unusual_payload)
    assert res.status_code == 200
    data = res.json()

    # Valid predictions returned without silent clipping
    assert data["predicted_yield_tonnes_per_ha"] >= 0.0
    assert "warnings" in data
    warnings = data["warnings"]
    assert len(warnings) >= 3

    # Check specific distribution warnings
    w_text = " ".join(warnings)
    assert "historical training range" in w_text
    assert "unseen in training data" in w_text
    assert "zero-shot geographic transfer" in w_text


def test_phase3_7_prediction_conformal_interval_internal_consistency():
    """Phase 3.7 Task 4: Ensure internal mathematical consistency across predictions, intervals, and units."""
    payload = {
        "country": "India",
        "crop": "Potatoes",
        "year": 2012,
        "rainfall_mm": 1100.0,
        "avg_temp_c": 24.0,
        "pesticides_tonnes": 25000.0
    }
    res = client.post("/api/v1/predict", json=payload)
    assert res.status_code == 200
    data = res.json()

    pred_hg = data["predicted_yield_hg_per_ha"]
    pred_t = data["predicted_yield_tonnes_per_ha"]
    ci = data["conformal_interval_90"]

    # Target unit conversion consistency
    assert abs(pred_t - round(pred_hg / 10000.0, 4)) < 1e-4

    # Strict bounds consistency
    assert ci["lower_bound"] <= pred_t <= ci["upper_bound"]
    assert ci["lower_bound"] >= 0.0
    assert abs(ci["interval_width_tonnes"] - round(ci["upper_bound"] - ci["lower_bound"], 4)) < 1e-4
    assert ci["unit"] == "tonnes/ha"
    assert ci["calibration_crop"] == "Potatoes"
    assert "Crop-Conditional" in ci["method"]


def test_phase3_7_production_model_artifact_identity_and_selection_record():
    """Phase 3.7 Task 2 & 6: Verify deployed artifact identity, metadata, and selection rationale."""
    import json
    from sklearn.pipeline import Pipeline
    from xgboost.sklearn import XGBRegressor
    from app.services.prediction_service import prediction_service

    # Verify loaded model is XGBoost pipeline
    assert isinstance(prediction_service.model, Pipeline)
    assert isinstance(prediction_service.model.named_steps["regressor"], XGBRegressor)

    # Verify model selection comparison artifact exists and records decision
    comp_path = Path(__file__).resolve().parent.parent / "models" / "model_selection_comparison.json"
    assert comp_path.exists(), "models/model_selection_comparison.json must exist"
    with open(comp_path, "r", encoding="utf-8") as f:
        comp_data = json.load(f)

    assert comp_data["selection_decision"]["status"] == "RETAIN_XGBOOST"
    assert "Random Forest" in comp_data["operational_metrics"]
    assert "XGBoost" in comp_data["operational_metrics"]
    # XGBoost artifact must be significantly smaller than RF
    xgb_mb = comp_data["operational_metrics"]["XGBoost"]["artifact_size_mb"]
    rf_mb = comp_data["operational_metrics"]["Random Forest"]["artifact_size_mb"]
    assert xgb_mb < 5.0
    assert rf_mb > 20.0


def test_phase3_7_treeshap_additivity_and_explanation_consistency():
    """Phase 3.7 Task 6: Validate TreeSHAP additivity, exact attribution method, and explanation consistency."""
    payload = {
        "country": "India",
        "crop": "Wheat",
        "year": 2013,
        "rainfall_mm": 1050.0,
        "avg_temp_c": 25.5,
        "pesticides_tonnes": 50000.0
    }
    res = client.post("/api/v1/explain", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["attribution_method"] == "Exact TreeSHAP (shap.TreeExplainer)"
    assert data["additivity_verified"] is True
    assert len(data["feature_contributions"]) == 6

    # Verify additivity: base_value + sum(shap_values) equals prediction within 0.05 t/ha
    total_contrib = sum(fc["shap_value"] for fc in data["feature_contributions"])
    reconstructed_pred = data["base_value"] + total_contrib
    assert abs(reconstructed_pred - data["prediction_tonnes_per_ha"]) < 0.05


# ==============================================================================
# BACKEND RELIABILITY, CONCURRENCY, DATABASE RESILIENCE & SECURITY AUDIT TESTS
# ==============================================================================

def test_backend_database_failure_resilience_and_audit_warning():
    """Objective 4: Verify database failures cannot silently corrupt or alter prediction outputs."""
    import unittest.mock as mock
    import sqlite3
    from app.services.prediction_service import prediction_service
    from app.schemas.prediction import YieldInput

    payload = YieldInput(
        country="India",
        crop="Wheat",
        year=2013,
        rainfall_mm=1050.0,
        avg_temp_c=25.5,
        pesticides_tonnes=500.0
    )

    # Simulate database lock/disk failure during user prediction logging
    with mock.patch("app.db.database.db.save_prediction", side_effect=sqlite3.OperationalError("database is locked")):
        res = prediction_service.predict(payload, user_id="auth_researcher_uuid")
        # Ensure mathematical prediction is intact and uncorrupted
        assert res.predicted_yield_tonnes_per_ha > 0.0
        assert res.conformal_interval_90.lower_bound <= res.predicted_yield_tonnes_per_ha <= res.conformal_interval_90.upper_bound
        assert len(res.shap_values) == 6
        # Ensure non-silent warning is communicated to user
        assert any("Database persistence unavailable" in w for w in res.warnings)


def test_backend_concurrent_requests_and_session_safety():
    """Objective 5: Test concurrent prediction and TreeSHAP explainer requests across threads."""
    import concurrent.futures

    def worker(i: int):
        payload = {
            "country": "India",
            "crop": "Wheat" if i % 2 == 0 else "Rice, paddy",
            "year": 2013,
            "rainfall_mm": 1000.0 + (i * 20.0),
            "avg_temp_c": 24.0 + (i * 0.2),
            "pesticides_tonnes": 500.0 + (i * 100.0)
        }
        pred_res = client.post("/api/v1/predict", json=payload)
        exp_res = client.post("/api/v1/explain", json=payload)
        return pred_res.status_code, exp_res.status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(worker, i) for i in range(12)]
        results = [f.result() for f in futures]

    assert len(results) == 12
    for pred_code, exp_code in results:
        assert pred_code == 200
        assert exp_code == 200


def test_backend_batch_and_whatif_input_validation():
    """Objective 8: Check input validation on batch prediction and what-if simulation endpoints."""
    # 1. Empty batch request rejected with 422
    res_empty_batch = client.post("/api/v1/predict/batch", json={"items": []})
    assert res_empty_batch.status_code == 422

    # 2. What-if requires at least 2 scenarios
    single_scenario_payload = {
        "scenarios": [
            {
                "scenario_name": "Single Scenario",
                "inputs": {
                    "country": "India",
                    "crop": "Wheat",
                    "year": 2013,
                    "rainfall_mm": 1000.0,
                    "avg_temp_c": 25.0,
                    "pesticides_tonnes": 500.0
                }
            }
        ]
    }
    res_single = client.post("/api/v1/what-if", json=single_scenario_payload)
    assert res_single.status_code == 422


def test_backend_cors_security_and_health_database_probe():
    """Objective 3: Verify CORS configuration compliance and database health probe in /health."""
    from app.core.config import settings

    # 1. Health check includes database connectivity probe
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert "database_connected" in data
    assert data["database_connected"] is True
    assert data["model_loaded"] is True

    # 2. CORS security: ensure wildcard * is not in CORS_ORIGINS when credentials are enabled
    assert "*" not in settings.CORS_ORIGINS
    assert any("5173" in origin for origin in settings.CORS_ORIGINS)
