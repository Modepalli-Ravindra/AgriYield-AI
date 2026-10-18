# Phase 3 Research Reproducibility Guide

**Project**: *An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors*  
**Verified Platform**: Python 3.14.5 / Node.js v22.18 / Windows 11 AMD64  
**Workspace**: `C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction`  

---

## 1. Environment & Package Versions

To reproduce all findings independently, ensure the following core libraries are installed:

| Library | Verified Version | Purpose |
| :--- | :--- | :--- |
| **Python** | 3.14.5 | Core execution runtime |
| **PyTorch** | 2.13.0+cpu | Tabular MLP Deep Learning engine |
| **Scikit-Learn** | 1.9.0 | Pipelines, Random Forest, Metrics |
| **XGBoost** | 3.4.1 | Gradient-boosted decision trees |
| **LightGBM** | 4.7.0 | Histogram-based gradient boosting |
| **SHAP** | 0.54.1 | TreeSHAP feature attributions |
| **FastAPI** | 0.115+ | REST API routing and OpenAPI |
| **Argon2-cffi** | 25.1.0 | Argon2id password hashing |
| **PyJWT / python-jose** | 3.3.0 | HMAC-SHA256 JWT tokens |
| **Pytest** | 9.1.1 | Automated testing framework |
| **Node.js** | 22.18+ / npm 10.9+ | Frontend runtime |
| **Vite** | 8.3.4 | Frontend build tool |
| **React** | 19.0.0 | Frontend UI framework |

---

## 2. Step-by-Step Reproduction Commands

### Step A: Dataset Audit & Baseline Verification
Run the data integrity check to inspect raw vs. deduplicated record counts:
```powershell
python -c "
import pandas as pd
df = pd.read_csv('data/yield_df.csv')
print('Raw shape:', df.shape)
if 'Unnamed: 0' in df.columns: df = df.drop(columns=['Unnamed: 0'])
clean_df = df.drop_duplicates()
print('Clean shape:', clean_df.shape)
print('Exact duplicate rows removed:', len(df) - len(clean_df))
"
```
*Expected Output*: Raw shape = (28242, 8), Clean shape = (25932, 7), Duplicates removed = 2310.

---

### Step B: Run Independent Empirical Benchmark Suite
Execute the independent benchmark script to evaluate Random Split, Chronological Split, Geographic Split, Conformal UQ, and Missingness:
```powershell
python scripts/independent_verification.py
```
This script executes:
1. **Random Split (80/20, seed=42)**: Trains RF, XGBoost, LightGBM, PyTorch Tabular MLP, and Stacking Meta-Ensemble.
2. **Chronological Split**: Trains on years $\le 2008$ ($N=20,182$), tests on years $2009\text{--}2013$ ($N=5,750$).
3. **Geographic Grouped Split**: GroupKFold holding out 16 whole countries ($N=5,197$ test).
4. **Conformal Uncertainty Quantification**: Evaluates empirical coverage overall and across 10 crops and 3 yield tiers.
5. **Robustness**: Evaluates MCAR and MAR missingness (0% to 50%) and sensor noise.
6. **Artifact Output**: Saves all numerical results to `PHASE3_EXPERIMENT_RESULTS.json`.

---

### Step C: Run Automated Backend Verification Tests
Execute the 13 automated test cases covering health, options, predictions, conformal intervals, zero-OTP auth, bad credentials, token expiry, user isolation, physical bounds, and input validation:
```powershell
python -m pytest tests/test_api.py -v
```
*Expected Result*: 13 passed in ~6.5 seconds.

---

### Step D: Build & Verify Frontend Research Dashboard
Compile the TypeScript and Vite frontend:
```powershell
cd frontend
npm install
npm run build
```
*Expected Result*: `✓ built in ~1.0s` with 0 TypeScript errors.

---

### Step E: Run Full Application Locally
1. Start FastAPI Backend:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
2. Start React Frontend:
   ```powershell
   cd frontend
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
- API Docs: `http://127.0.0.1:8000/docs`
- Research UI: `http://127.0.0.1:5173/`

---

## 3. Fixed Random Seeds & Split Configurations

- **Primary Train/Dev/Test Seed**: `random_state = 42`
- **Train/Calibration/Test Proportions**: 64% Train ($N=16,596$), 16% Calibration ($N=4,149$), 20% Test ($N=5,187$).
- **Chronological Split Year Threshold**: Train $\le 2008$, Test $\ge 2009$.
- **Geographic Split Strategy**: 5-Fold GroupKFold grouped by `Area` column.
- **Conformal Prediction Significance Level**: $\alpha = 0.10$ ($1 - \alpha = 0.90$ nominal coverage).
- **Missingness Mechanisms**: MCAR (uniform random masking), MAR (conditioned on $T > 70\text{th percentile}$).
