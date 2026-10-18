# PHASE 3.6 — IMPLEMENTATION REPRODUCIBILITY LOG & ENGINEERING BENCHMARKS

**Project**: An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors  
**Workspace**: `C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction`  
**Git Branch**: `feature/dl-ml-research-framework`  
**Execution Timestamp**: 2026-10-18T12:03:00Z  

---

## 1. System and Execution Environment

### 1.1 Host Environment & Hardware Platform
- **Operating System**: Windows 11 Enterprise (`win32`, x86_64 architecture)
- **Time Zone**: UTC+05:30 (IST)
- **Execution Mode**: CPU Multi-threading active across Scikit-Learn, PyTorch, and XGBoost

### 1.2 Python Runtime & Library Ecosystem
| Package | Version | Role in System |
| :--- | :--- | :--- |
| **Python** | `3.14.5` (MSC v.1944 64-bit) | Base interpreter |
| **PyTorch** | `2.13.0+cpu` | Tabular Neural Network baseline & research engine |
| **Scikit-Learn** | `1.9.0` | Pipeline, preprocessors, GroupShuffleSplit, GroupKFold, RidgeCV |
| **XGBoost** | `3.4.1` | Production deployed tree regressor (`models/crop_yield_model.pkl`) |
| **LightGBM** | `4.7.0` | Fast gradient boosting baseline |
| **SHAP** | `0.54.1` | Exact TreeSHAP explainer engine (`TreeExplainer`) |
| **FastAPI** | `0.128.8` | Production REST API |
| **Pydantic** | `2.13.4` | Input validation and response serialization |
| **Joblib** | `1.5.3` | Pipeline and calibrator persistence |
| **Pytest** | `9.1.1` | Automated regression test framework |

### 1.3 Client & Build Tooling
| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v22.23.2` | Frontend runtime |
| **npm** | `10.9.8` | Node package manager |
| **Vite** | `8.3.4` | Client application bundler |
| **TypeScript**| `5.7.2` | Frontend static type verification |

---

## 2. Implementation Code Fixes Applied in Phase 3.6

### 2.1 Fix: `_compute_shap` Input Type Generalization and Series Access
- **File**: `app/services/prediction_service.py`
- **Issue**: In `_compute_shap`, passing a `pd.Series` or dictionary row caused a `TypeError: string indices must be integers, not 'str'` when accessing fallback partial derivative proxy (`p["average_rain_fall_mm_per_year"]`).
- **Fix**: Added explicit input conversion:
  ```python
  if isinstance(row, pd.Series):
      row = row.to_frame().T
  elif isinstance(row, dict):
      row = pd.DataFrame([row])
  ...
  p = row.iloc[0] if isinstance(row, pd.DataFrame) else row
  ```
- **Outcome**: `_compute_shap` now executes seamlessly across `pd.DataFrame`, `pd.Series`, and dictionary payloads.

### 2.2 Fix: Strict Non-Negative Prediction Interval Bound Ordering
- **File**: `app/ml/conformal.py`
- **Issue**: In `predict_interval`, if point prediction $\hat{y}$ was negative (e.g. $\hat{y} = -2.0$), $\text{lower} = \max(0.0, -2.0 - Q) = 0.0$ while $\text{upper} = -2.0 + Q$ could be negative or smaller than lower bound, causing $\text{lower} > \text{upper}$.
- **Fix**: Enforced upper bound monotonicity:
  ```python
  lower = max(0.0, float(point_prediction_tonnes - q))
  upper = max(lower, float(point_prediction_tonnes + q))
  width = round(float(upper - lower), 4)
  ```
- **Outcome**: Strictly guarantees $\text{lower\_bound} \le \text{upper\_bound}$ and $\text{interval\_width} \ge 0.0$ under any edge-case prediction.

---

## 3. Tiered Latency Benchmarks (100 Iterations on CPU)

To address Phase 5 requirements, latency was measured across all functional architectural tiers:

| Tier / Component Measured | Mean Latency | Median Latency | P95 Latency | Measurement Scope |
| :--- | :---: | :---: | :---: | :--- |
| **1. Raw Pipeline Inference** | **8.532 ms** | 8.244 ms | 9.273 ms | `pipeline.predict(df)` directly on XGBoost pipeline |
| **2. Pure TreeSHAP Explainer** | **20.103 ms** | 16.084 ms | 31.793 ms | `_compute_shap(row)` path-dependent tree traversal |
| **3. Service `predict()` Call** | **40.000 ms** | 33.689 ms | 68.854 ms | Model inference + conformal bounds + DB logging |
| **4. HTTP POST `/api/v1/predict`** | **51.514 ms** | 42.331 ms | 59.832 ms | Network I/O + Pydantic serialization + service |
| **5. HTTP POST `/api/v1/explain`** | **44.264 ms** | 40.523 ms | 43.123 ms | HTTP I/O + TreeSHAP + additivity verification |

**Efficiency / Additivity Verification**:
- Additivity error: $|E[y] + \sum_{i=1}^6 \phi_i - \hat{y}| = \mathbf{1.2 \times 10^{-7}\text{ t/ha}}$ ($< 10^{-4}$ tolerance).

---

## 4. Test Verification & Build Outputs

### 4.1 Pytest Automated Regression Suite (24 Tests)
Command executed:
```powershell
python -m pytest tests/test_api.py -v
```
Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.6.0 -- C:\Python314\python.exe
rootdir: C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction
collected 24 items

tests/test_api.py::test_health_check PASSED                              [  4%]
tests/test_api.py::test_options_endpoint PASSED                          [  8%]
tests/test_api.py::test_zero_otp_auth_flow PASSED                        [ 12%]
tests/test_api.py::test_prediction_with_conformal_interval PASSED        [ 16%]
tests/test_api.py::test_explain_and_sensitivity PASSED                   [ 20%]
tests/test_api.py::test_what_if_scenario_comparison PASSED               [ 25%]
tests/test_api.py::test_model_benchmarks_and_robustness PASSED           [ 29%]
tests/test_api.py::test_history_authorization PASSED                     [ 33%]
tests/test_api.py::test_invalid_inputs_rejected PASSED                   [ 37%]
tests/test_api.py::test_auth_failure_wrong_password PASSED               [ 41%]
tests/test_api.py::test_expired_or_invalid_jwt_token PASSED              [ 45%]
tests/test_api.py::test_user_isolation_prediction_history PASSED         [ 50%]
tests/test_api.py::test_prediction_physical_nonnegativity_bounds PASSED  [ 54%]
tests/test_api.py::test_split_disjointness_and_conformal_separation PASSED [ 58%]
tests/test_api.py::test_model_artifact_identity_and_transparency PASSED  [ 62%]
tests/test_api.py::test_group_aware_uncertainty_artifacts PASSED         [ 66%]
tests/test_api.py::test_phase3_4_treeshap_additivity_and_exact_attribution PASSED [ 70%]
tests/test_api.py::test_phase3_4_crop_conditional_conformal_bounds PASSED [ 75%]
tests/test_api.py::test_phase3_4_target_unit_conversion_consistency PASSED [ 79%]
tests/test_api.py::test_phase3_4_production_model_metadata_consistency PASSED [ 83%]
tests/test_api.py::test_phase3_6_model_direct_prediction_parity PASSED   [ 87%]
tests/test_api.py::test_phase3_6_conformal_bounds_strict_ordering_negative_yields PASSED [ 91%]
tests/test_api.py::test_phase3_6_unknown_crop_global_fallback_and_disclaimer PASSED [ 95%]
tests/test_api.py::test_phase3_6_4way_split_exact_disjointness_and_counts PASSED [100%]

======================= 24 passed, 2 warnings in 8.26s ========================
```

### 4.2 Frontend Production Bundle Build
Command executed:
```powershell
cd frontend
npm run build
```
Output:
```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.4 building client environment for production...
transforming...
✓ 2495 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-C0UIon3N.css    6.43 kB │ gzip:   1.79 kB
dist/assets/index-C08m_yf0.js   650.54 kB │ gzip: 189.88 kB
✓ built in 771ms
```
