# Phase 3.7 ? Reproducibility Log: Model Selection & Production Reliability Engineering

**Project**: An AI-Driven DL?ML Integrated Framework for Crop Yield Prediction Using Environmental Factors  
**Branch**: `feature/dl-ml-research-framework`  
**Baseline Commit**: `2b96e90660bbee4121319002b5ff14d8e1bb1669`  
**Execution Environment**: Python 3.14.5 (AMD64 win32), Node v22.23.2, FastAPI 0.115.12, Pydantic 2.13.4, Scikit-Learn 1.9.0, XGBoost 3.4.1, LightGBM 4.7.0, SHAP 0.54.1, Vite 8.3.4  
**Date**: October 18, 2026  

---

## 1. Reproduction Commands

### 1.1 Multi-Regime Model Selection Benchmark
To reproduce the empirical evaluation comparing Random Forest, XGBoost, and LightGBM across all three split regimes and operational latency/footprint metrics:
```powershell
python scripts/model_selection_benchmark.py
```
**Expected Output Artifact**: `models/model_selection_comparison.json` containing:
- Grouped Leakage-Aware Split metrics
- Chronological Future-Year Split metrics
- Geographic Zero-Shot Transfer Split metrics
- Operational metrics (Artifact size, Cold load time, Inference latency, TreeSHAP latency)
- Formally recorded production model decision: `RETAIN_XGBOOST`

### 1.2 Automated Backend Regression Tests (29 Tests)
To run the full regression test suite covering input validation, NaN/Inf rejection, non-blocking advisory warnings, prediction parity, conformal consistency, and TreeSHAP additivity:
```powershell
python -m pytest tests/test_api.py -v
```
**Expected Output**:
`======================= 29 passed, 4 warnings in ~8.5s =======================`

### 1.3 Production Frontend Compilation
To compile the TypeScript/React frontend bundle:
```powershell
cd frontend
npm run build
```
**Expected Output**:
`? built in ~730ms` with zero TypeScript errors.

---

## 2. API Input Validation & Warning Verification

### 2.1 Verification of Rejection (NaN / Inf / Invalid Physical Ranges)
```powershell
python -c "
import urllib.request, urllib.error
try:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/predict',
        data=b'{"country": "India", "crop": "Wheat", "year": 2013, "rainfall_mm": NaN, "avg_temp_c": 25.5, "pesticides_tonnes": 500.0}',
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print('HTTP Status:', e.code)
    print('Error Detail:', e.read().decode())
"
```
**Expected Output**:
`HTTP Status: 422` with clean JSON error detailing `Input should be less than or equal to 12000`.

### 2.2 Verification of Non-Blocking Distribution Shift Warnings
```powershell
python -c "
import urllib.request, json
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/predict',
    data=json.dumps({
        'country': 'Atlantis',
        'crop': 'Wheat',
        'year': 2026,
        'rainfall_mm': 25.0,
        'avg_temp_c': 38.0,
        'pesticides_tonnes': 500.0
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res = urllib.request.urlopen(req)
data = json.loads(res.read())
print('Status: 200 OK')
print('Predicted Yield:', data['predicted_yield_tonnes_per_ha'], 't/ha')
print('Warnings Count:', len(data['warnings']))
for w in data['warnings']:
    print(' -', w)
"
```
**Expected Output**:
Status 200 OK with point prediction (~4.99 t/ha), conformal bounds [4.19, 5.81] t/ha, and 4 non-blocking warnings covering year drift, hydrological low, thermal stress, and geographic transfer.

---

## 3. Provenance of Artifacts & Files

| Artifact / File | Role & Status |
| :--- | :--- |
| `scripts/model_selection_benchmark.py` | Benchmark script executing RF vs XGBoost vs LightGBM multi-regime evaluation. |
| `models/model_selection_comparison.json` | Recorded empirical metrics, latency measurements, and selection decision (`RETAIN_XGBOOST`). |
| `app/schemas/prediction.py` | Pydantic schema validation rejecting NaN/Inf/empty strings and returning advisory warnings. |
| `app/services/prediction_service.py` | Service checking training distribution limits [1990-2013, 51-3240mm, 1.3-30.65C] without clipping. |
| `app/main.py` | Lifespan and custom `RequestValidationError` handler sanitizing NaN/Inf in HTTP 422 responses. |
| `frontend/src/types.ts` | Extended `PredictionResponse` interface with optional `warnings?: string[]`. |
| `frontend/src/App.tsx` | Added amber advisory warnings banner and updated header badge to Production XGBoost (v2). |
| `tests/test_api.py` | Expanded test suite from 24 to 29 tests covering all Phase 3.7 reliability requirements. |
