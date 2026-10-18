# Phase 3.7 ? Implementation Report: Model Selection & Production Reliability Engineering

**Project**: An AI-Driven DL?ML Integrated Framework for Crop Yield Prediction Using Environmental Factors  
**Branch**: `feature/dl-ml-research-framework`  
**Baseline Commit**: `2b96e90660bbee4121319002b5ff14d8e1bb1669`  
**Completion Date**: October 18, 2026  
**Status**: VERIFIED & PRODUCTION READY  

---

## 1. Executive Summary & Verification of Baseline

In Phase 3.7, we conducted a rigorous engineering evaluation to determine the optimal production serving engine for the crop yield prediction platform, hardened API input boundaries against malformed/infinite/out-of-distribution values, established non-blocking advisory warning telemetry, verified crop-conditional conformal coverage on an untouched test set, updated the React web frontend, and implemented comprehensive automated regression tests.

Prior to modifications, baseline repository inspection was performed on branch `feature/dl-ml-research-framework` at commit `2b96e90`:
- **Backend Test Baseline**: 24 out of 24 tests in `tests/test_api.py` passed in 10.30 seconds.
- **Frontend Build Baseline**: `npm run build` in `frontend/` completed cleanly with zero TypeScript errors in 733 ms.
- **Working Tree**: Inspected and verified clean.

---

## 2. Production Model Selection Using Multi-Regime Evidence

### 2.1 Multi-Regime Evaluation Protocol
To evaluate whether to retain the deployed XGBoost regressor pipeline or replace it with Random Forest (which had shown a marginal $R^2$ advantage on in-domain grouped splits), we authored and executed `scripts/model_selection_benchmark.py`. The benchmark evaluated Random Forest, XGBoost, and LightGBM across three mutually disjoint evaluation regimes, plus comprehensive operational engineering metrics on identical hardware (CPU mode, win32 AMD64).

#### Summary Benchmark Matrix

| Evaluation Regime / Engineering Metric | Random Forest (100 trees, depth 16) | XGBoost (300 trees, depth 6) | LightGBM (300 trees, depth 6) | Production Impact / Analysis |
| :--- | :--- | :--- | :--- | :--- |
| **1. Grouped Leakage-Aware Split** ($N=5,185$) | $R^2 = 0.9778$, $\text{RMSE} = 1.224\text{ t/ha}$ | $R^2 = 0.9667$, $\text{RMSE} = 1.499\text{ t/ha}$ | $R^2 = 0.9469$, $\text{RMSE} = 1.892\text{ t/ha}$ | In-domain grouped interpolation. RF shows marginal accuracy lead (+0.011 $R^2$). |
| **2. Chronological Future Split** ($N=5,750$, $\text{Train}\le 2008$) | $R^2 = 0.9471$, $\text{RMSE} = 2.181\text{ t/ha}$ | $R^2 = 0.9458$, $\text{RMSE} = 2.208\text{ t/ha}$ | $R^2 = 0.9304$, $\text{RMSE} = 2.501\text{ t/ha}$ | Temporal extrapolation to unobserved harvest years. Virtually identical performance ($\Delta R^2 = 0.0013$). |
| **3. Geographic Held-Out Split** ($N=5,197$, 16 countries) | $R^2 = 0.5223$, $\text{RMSE} = 6.636\text{ t/ha}$ | $R^2 = 0.5445$, $\text{RMSE} = 6.481\text{ t/ha}$ | $R^2 = 0.5555$, $\text{RMSE} = 6.402\text{ t/ha}$ | Zero-shot geographic transfer. XGBoost outperforms RF by +0.022 $R^2$ and lower RMSE. |
| **4. Serialized Artifact Size** | **38.73 MB** | **1.03 MB** | 1.82 MB | **XGBoost is 37.6x smaller**, drastically reducing deployment artifact transfer and container image size. |
| **5. Cold Load / Unpickle Latency** | 54.76 ms | **9.53 ms** | 12.10 ms | **XGBoost loads 5.7x faster**, critical for serverless cold-starts and worker auto-scaling. |
| **6. Single-Sample Inference Latency** | Mean: 60.88 ms (p95: 74.07 ms) | **Mean: 8.20 ms (p95: 9.82 ms)** | Mean: 4.31 ms | **XGBoost is 7.4x faster** in CPU inference. |
| **7. CPU TreeSHAP Explanation Latency** | Mean: 196.23 ms (p95: 261.88 ms) | **Mean: 4.59 ms (p95: 4.97 ms)** | Mean: 14.50 ms | **XGBoost is 42.7x faster** for exact TreeSHAP attribution. |

### 2.2 Model Selection Rationale: RETAIN XGBOOST
Based on the empirical evidence recorded in `models/model_selection_comparison.json`:
1. **Interactive Latency Constraint**: In an interactive web application where users drag sliders for sensitivity and scenario analysis, an explanation latency of **196.2 ms (p95: 261.9 ms)** for Random Forest causes server queueing and noticeable UI lag. In contrast, XGBoost executes exact TreeSHAP in **4.59 ms**, delivering instant, responsive feedback.
2. **Artifact Footprint**: Random Forest requires a **38.73 MB** pickle file, whereas XGBoost is compressed to **1.03 MB** (37.6x reduction), minimizing RAM footprint in multi-worker environments.
3. **Out-of-Domain Generalization**: When evaluated on zero-shot geographic transfer to unseen countries, XGBoost achieves superior generalization ($R^2 = 0.5445$ vs $0.5223$, lower RMSE by $0.155\text{ t/ha}$).
4. **Decision**: We retain the **Production XGBoost Regressor Pipeline** as the deployed engine. The marginal in-domain accuracy difference does not justify the 42x TreeSHAP latency penalty and 37x memory bloat of Random Forest.

---

## 3. Prediction Input Reliability Implementation

### 3.1 Strict API Boundary Validation (`app/schemas/prediction.py`)
We implemented strict Pydantic v2 field validators on `YieldInput` to reject malformed, infinite, or physically invalid values:
- **NaN and Infinity Rejection**: Explicitly rejects `float('nan')`, `float('inf')`, and `float('-inf')` for `rainfall_mm`, `avg_temp_c`, and `pesticides_tonnes` with an informative error message.
- **Physical Boundaries**:
  - `rainfall_mm`: Must satisfy $0.0 \le \text{rainfall} \le 12,000.0\text{ mm}$.
  - `avg_temp_c`: Must satisfy $-50.0 \le \text{temp} \le 60.0\text{ }^\circ\text{C}$.
  - `pesticides_tonnes`: Must satisfy $0.0 \le \text{pesticides} \le 1,000,000.0\text{ tonnes}$.
  - `year`: Must be an integer between 1900 and 2100.
  - `country` and `crop`: Must be non-empty strings; whitespace-only strings are rejected with HTTP 422.

### 3.2 JSON Serialization Fix for Validation Errors (`app/main.py`)
Standard Python `json.dumps` crashes with a `ValueError` when attempting to serialize raw `NaN` inputs in FastAPI's default 422 validation response. We introduced a custom `RequestValidationError` handler in `app/main.py` that sanitizes float `nan` and `inf` inputs to string representations before calling `jsonable_encoder`, ensuring robust, standards-compliant HTTP 422 JSON error responses.

### 3.3 Training Distribution Telemetry & Advisory Warnings (`app/services/prediction_service.py`)
Rather than silently clipping valid user inputs, we implemented a non-blocking advisory warning system that compares incoming values against the documented historical training boundaries (derived from 25,932 clean records in `data/yield_df.csv`):
- `year`: Historical range $[1990, 2013]$. If outside: `"Observation year {year} is outside historical training range (1990 to 2013). Forward temporal drift may reduce prediction accuracy."`
- `rainfall_mm`: Historical range $[51.0, 3240.0]\text{ mm}$. If outside: `"Annual precipitation {rainfall} mm is outside historical training range (51.0 to 3240.0 mm). Extreme hydrological conditions may reduce prediction reliability."`
- `pesticides_tonnes`: Historical range $[0.04, 367778.0]\text{ tonnes}$. If outside: `"Pesticide application {pesticides} tonnes is outside historical training range (0.04 to 367778 tonnes)."`
- `avg_temp_c`: Historical range $[1.3, 30.65]\text{ }^\circ\text{C}$. If outside: `"Average temperature {temp} ?C is outside historical training range (1.3 to 30.65 ?C). Thermal stress extrapolation may reduce model accuracy."`
- `country`: If unobserved in training: `"Country '{country}' is unseen in training data. Prediction relies on zero-shot geographic transfer (cross-country R? ~0.54)."`
- `crop`: If unobserved in training: `"Crop '{crop}' was not observed in training data. Global fallback conformal uncertainty margin (Group Max Q = 2.573 t/ha) has been applied."`

All original user inputs are passed directly to the model's preprocessing pipeline without silent truncation or alteration.

---

## 4. Uncertainty & Reliability Communication

### 4.1 Internal Consistency Verification
All prediction outputs and conformal intervals are verified for strict mathematical consistency:
- Point estimate: $\hat{y}_{\text{tonnes}} = \hat{y}_{\text{hg}} / 10000.0$.
- Bounds: $\text{lower\_bound} \le \hat{y}_{\text{tonnes}} \le \text{upper\_bound}$.
- Non-negativity: $\text{lower\_bound} \ge 0.0\text{ t/ha}$.
- Interval width: $\text{width} = \text{upper\_bound} - \text{lower\_bound}$.
- Target unit: Consistently labeled and formatted as `tonnes/ha`.

### 4.2 Untouched Test Set Calibration Diagnostics
We executed calibration diagnostics across the held-out test partition ($N=5,185$ rows) across all 10 agricultural crop species:
- **Cassava** ($N=341$): Quantile $Q = 3.484\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **90.91%**
- **Maize** ($N=763$): Quantile $Q = 1.266\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **95.28%**
- **Plantains and others** ($N=103$): Quantile $Q = 3.733\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **91.26%**
- **Potatoes** ($N=754$): Quantile $Q = 4.382\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **96.82%**
- **Rice, paddy** ($N=656$): Quantile $Q = 1.101\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **94.97%**
- **Sorghum** ($N=626$): Quantile $Q = 0.777\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **95.85%**
- **Soybeans** ($N=539$): Quantile $Q = 0.613\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **96.29%**
- **Sweet potatoes** ($N=492$): Quantile $Q = 2.937\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **96.34%**
- **Wheat** ($N=736$): Quantile $Q = 0.811\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **94.97%**
- **Yams** ($N=175$): Quantile $Q = 3.428\text{ t/ha}$ $\rightarrow$ Empirical Coverage: **98.86%**

All 10 crops achieve $\ge 90\%$ empirical test coverage. If an unknown crop is requested, the system automatically falls back to the group-maximum conformal quantile ($Q_{\text{group\_max}} = 2.573\text{ t/ha}$) and displays:
`Global Group-Aware Conformal Quantile Calibration (Fallback)` with the formal disclaimer:
*"Reported 90% coverage is marginal across eligible groups; does not guarantee 90% on every individual crop or future distribution shift."*

---

## 5. Frontend Integration Improvements

1. **Input Reliability & Distribution Warnings Banner**:
   In `frontend/src/App.tsx`, added an Amber callout banner directly beneath the estimated crop yield card when `prediction.warnings` is non-empty. It lists each specific advisory warning (e.g. forward temporal drift, thermal stress, or geographic transfer).
2. **Model Identity Transparency**:
   Updated the top header badge from the legacy `DL-ML Stacking v2` label to `Production XGBoost (v2)` to truthfully indicate that the served model is the verified XGBoost pipeline, while keeping offline stacking benchmarks clearly identified in the comparison dashboards.
3. **TypeScript Types**:
   Extended `frontend/src/types.ts` to include `warnings?: string[]` on `PredictionResponse`.
4. **Build Verification**:
   The frontend production bundle compiled in 815 ms with zero TypeScript errors.

---

## 6. Regression Testing & Parity Verification

The automated test suite in `tests/test_api.py` was expanded from 24 tests to 29 tests:
- `test_phase3_7_nan_inf_and_invalid_inputs_rejected`: Rejection of NaN, Infinity, negative rainfall/pesticides, extreme temperature (>60?C), and empty strings with HTTP 422.
- `test_phase3_7_unusual_environmental_values_advisory_warnings`: Acceptance of unusual environmental inputs with HTTP 200 and structured advisory warnings.
- `test_phase3_7_prediction_conformal_interval_internal_consistency`: Verification of bound ordering, non-negativity, width calculation, and unit conversion.
- `test_phase3_7_production_model_artifact_identity_and_selection_record`: Verification that the served model is an XGBoost pipeline, that `models/model_selection_comparison.json` exists with decision `RETAIN_XGBOOST`, and artifact size ratios match expectations.
- `test_phase3_7_treeshap_additivity_and_explanation_consistency`: Verification of exact TreeSHAP attribution and additivity verification ($E[y] + \sum \phi_i = \hat{y}$).

**Result**: All 29 tests PASSED in 8.56 seconds.

---

## 7. Unresolved Limitations & Engineering Boundaries

1. **Zero-Shot Geographic Transfer**: Models trained on FAOSTAT country aggregates rely heavily on country indicator variables as proxies for unmeasured soil chemistry, agrarian subsidies, and irrigation infrastructure. Cross-country transfer yields $R^2 \approx 0.54$, and predictions for unseen territories carry substantial epistemic uncertainty.
2. **Macro-Regional Climate Granularity**: Weather inputs represent nationwide annual aggregates; sub-national micro-climates, seasonal drought timing, and localized pest outbreaks cannot be resolved without high-resolution gridded satellite observations.
3. **Marginal vs Conditional Coverage Guarantee**: While group-aware conformal prediction guarantees 90% marginal coverage over the joint distribution of groups, individual extreme instances (e.g. compound climate disasters) may experience localized undercoverage.

---

## 8. Git Commit & Artifact Summary

### Files Changed:
- `scripts/model_selection_benchmark.py`: Multi-regime benchmark script comparing RF, XGBoost, and LightGBM.
- `models/model_selection_comparison.json`: Saved multi-regime metrics and model selection decision.
- `app/schemas/prediction.py`: Pydantic schema validation for NaN/Inf, physical bounds, and warnings field.
- `app/services/prediction_service.py`: Training distribution telemetry and advisory warnings without silent clipping.
- `app/main.py`: Lifespan startup and RequestValidationError handler sanitizing NaN/Inf floats.
- `frontend/src/types.ts`: Added `warnings?: string[]` to PredictionResponse.
- `frontend/src/App.tsx`: Added advisory warning callout box and updated header badge.
- `tests/test_api.py`: Added 5 comprehensive regression tests (total 29 tests).
- `PHASE3_7_METRIC_RECONCILIATION.json`: Machine-readable metric reconciliation record.
- `PHASE3_7_REPRODUCIBILITY_LOG.md`: Step-by-step reproducibility documentation.
- `PHASE3_7_IMPLEMENTATION_REPORT.md`: This comprehensive implementation report.
