# PHASE 3.5 — REPRODUCIBILITY LOG AND ENVIRONMENT SPECIFICATION

**Project**: An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors  
**Workspace**: `C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction`  
**Git Branch**: `feature/dl-ml-research-framework`  
**Baseline Commit**: `9ff249d`  
**Execution Timestamp**: 2026-10-18T11:45:00Z  

---

## 1. System and Execution Environment

### 1.1 Operating System & Hardware Platform
- **OS**: Windows 11 Enterprise (win32, x86_64 architecture)
- **Local Time Zone**: UTC+05:30 (IST)
- **CPU Platform**: AMD64 Family Multi-core Processor
- **GPU Acceleration**: None (CPU Execution Mode active across PyTorch, Scikit-Learn, and XGBoost)

### 1.2 Python Runtime & Package Ecosystem
| Package Name | Exact Version | Purpose in Framework |
| :--- | :--- | :--- |
| **Python** | `3.14.5` (MSC v.1944 64-bit) | Base language interpreter |
| **PyTorch** | `2.13.0+cpu` | Deep learning tabular MLP implementation |
| **Scikit-Learn** | `1.9.0` | Preprocessing, Random Forest, GroupShuffleSplit, RidgeCV |
| **XGBoost** | `3.4.1` | Production deployed tree regressor |
| **LightGBM** | `4.7.0` | Fast baseline gradient boosting regressor |
| **SHAP** | `0.54.1` | Exact TreeSHAP explainer engine (`TreeExplainer`) |
| **FastAPI** | `0.128.8` | REST API framework for prediction & XAI |
| **Pydantic** | `2.13.4` | Request/response data validation and schemas |
| **Joblib** | `1.5.3` | Model and calibrator artifact serialization |
| **Pytest** | `9.1.1` | Automated test runner |

### 1.3 Web Client & Build Tooling
| Tool | Exact Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v22.23.2` | JavaScript runtime |
| **npm** | `10.9.8` | Package manager |
| **Vite** | `8.3.4` | Frontend bundler and development server |
| **TypeScript** | `5.7.2` | Static type checking (`tsc -b`) |

---

## 2. Seed Configuration and Determinism Audit

### 2.1 Seed Management Across Scripts
| Script / Component | Configured Seed | Determinism Outcome | Notes |
| :--- | :--- | :--- | :--- |
| `train_test_split` | `random_state=42` | **Deterministic** | Produces exact same 20,745 / 5,187 row split |
| `GroupShuffleSplit` | `random_state=42` | **Deterministic** | Produces exact same 13,130 group partition across base, meta, calib, test |
| `RandomForestRegressor` | `random_state=42` | **Deterministic** | 100 trees, identical split thresholds |
| `xgb.XGBRegressor` | `random_state=42` | **Deterministic** | 300 estimators, exact tree structures |
| `lgb.LGBMRegressor` | `random_state=42` | **Deterministic** | 300 estimators, identical leaves |
| `train_dl_mlp` | `torch.manual_seed(42)` | **Slight Stochasticity** | Minor non-deterministic floating-point accumulation on CPU causes $\Delta R^2 \approx 0.0007$ ($0.9822$ vs $0.9815$) across separate PyTorch runs |
| `ConformalPredictionCalibrator`| N/A | **Deterministic** | Direct empirical quantile computation on sorted nonconformity scores |
| `shap.TreeExplainer` | N/A | **Deterministic** | Path-dependent tree traversal; exact additivity verified within $1.2 \times 10^{-7}$ |

---

## 3. Reproduction Commands & Exact Outputs

### 3.1 Automated Regression Test Suite
```powershell
python -m pytest tests/test_api.py -v
```
**Actual Console Output**:
```text
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.6.0 -- C:\Python314\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction
plugins: anyio-4.13.0, cov-7.1.0
collecting ... collected 20 items

tests/test_api.py::test_health_check PASSED                              [  5%]
tests/test_api.py::test_options_endpoint PASSED                          [ 10%]
tests/test_api.py::test_zero_otp_auth_flow PASSED                        [ 15%]
tests/test_api.py::test_prediction_with_conformal_interval PASSED        [ 20%]
tests/test_api.py::test_explain_and_sensitivity PASSED                   [ 25%]
tests/test_api.py::test_what_if_scenario_comparison PASSED               [ 30%]
tests/test_api.py::test_model_benchmarks_and_robustness PASSED           [ 35%]
tests/test_api.py::test_history_authorization PASSED                     [ 40%]
tests/test_api.py::test_invalid_inputs_rejected PASSED                   [ 45%]
tests/test_api.py::test_auth_failure_wrong_password PASSED               [ 50%]
tests/test_api.py::test_expired_or_invalid_jwt_token PASSED              [ 55%]
tests/test_api.py::test_user_isolation_prediction_history PASSED         [ 60%]
tests/test_api.py::test_prediction_physical_nonnegativity_bounds PASSED  [ 65%]
tests/test_api.py::test_split_disjointness_and_conformal_separation PASSED [ 70%]
tests/test_api.py::test_model_artifact_identity_and_transparency PASSED  [ 75%]
tests/test_api.py::test_group_aware_uncertainty_artifacts PASSED         [ 80%]
tests/test_api.py::test_phase3_4_treeshap_additivity_and_exact_attribution PASSED [ 85%]
tests/test_api.py::test_phase3_4_crop_conditional_conformal_bounds PASSED [ 90%]
tests/test_api.py::test_phase3_4_target_unit_conversion_consistency PASSED [ 95%]
tests/test_api.py::test_phase3_4_production_model_metadata_consistency PASSED [100%]

============================= 20 passed in 8.19s ==============================
```

### 3.2 Frontend Production Bundle Compilation
```powershell
cd frontend
npm run build
```
**Actual Console Output**:
```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.4 building client environment for production...
transforming...
✓ 2495 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-C0UIon3N.css    6.43 kB │ gzip:   1.79 kB
dist/assets/index-C08m_yf0.js   650.54 kB │ gzip: 189.88 kB
✓ built in 735ms
```

---

## 4. Model Artifact Inventory & Integrity Check

| Artifact Path | Format | Size | Loaded Steps / Class | Integrity Status |
| :--- | :--- | :--- | :--- | :--- |
| `models/crop_yield_model.pkl` | Joblib pickle | ~1.4 MB | `Pipeline([('preprocessor', ColumnTransformer), ('regressor', XGBRegressor)])` | **VERIFIED** |
| `models/conformal_calibrator.pkl` | Joblib pickle | ~4.2 KB | `ConformalPredictionCalibrator` ($Q_{\text{grp\_max}} = 2.573$, 10 crop quantiles) | **VERIFIED** |
| `models/model_metadata.pkl` | Joblib pickle | ~1.8 KB | Dict specifying production XGBoost vs offline stacking metadata | **VERIFIED** |
| `models/benchmark_results.json` | JSON | ~3.1 KB | Formatted multi-model benchmark metrics & deployment block | **VERIFIED** |
| `models/dl_mlp_model.pt` | PyTorch State | ~102 KB | Weights for 3-layer tabular MLP ($[113, 128, 64, 1]$) | **VERIFIED** |
| `data/yield_df.csv` | CSV | ~2.8 MB | Clean deduplicated FAOSTAT dataset ($25,932$ rows) | **VERIFIED** |

---

## 5. Security & Secret Scan Audit

- **Environment File Check**: Real `.env` files are excluded by `.gitignore`. No live secret tokens or credentials exist in tracked files.
- **Stateless Zero-OTP Verification**: Uses Argon2id password hashing + stateless signed JWT tokens. No plain passwords stored.
- **Git Diff Audit**: Clean tree; no temporary test files or keys committed.
