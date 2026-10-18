# 🌾 AI-Driven DL–ML Integrated Framework for Crop Yield Prediction

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An advanced, research-grade, deep learning and machine learning integrated framework for agricultural crop yield forecasting under climate perturbations and environmental variations.

Developed as **Phase 2 Implementation** extending the open-source foundation (`https://github.com/Kashaf537/crop_yield_prediction`), this repository incorporates modular architecture, strict data leakage prevention, genuine PyTorch Tabular Deep Learning integration, Stacking Meta-Ensembling, Conformal Uncertainty Quantification (UQ), comprehensive Missingness and Noise Stress-Testing, and a modern TypeScript + React research dashboard.

---

## 🔬 Key Research & Architectural Contributions

1. **Empirical Deduplication & Leakage-Safe Splits**:
   - Identified and resolved 2,310 duplicate records in the raw FAO/World Bank dataset (28,242 $\to$ 25,932 clean records).
   - Eliminated data leakage where identical records previously crossed train/test splits artificially inflating $R^2$.
   - Validated both spatial-stratified and temporal split evaluations (1990–2008 train vs 2009–2013 test).

2. **Genuine Tabular Deep Learning Integration**:
   - Developed `TabularCropYieldMLP` in PyTorch: embedding categorical factors (Country, Crop) + dense residual projection with LayerNorm, ReLU, and Dropout for numerical climate features.
   - Outperforms individual tree models with an $R^2$ of **0.9796** and RMSE of **1.215 tonnes/ha**.

3. **Leakage-Safe Stacking Meta-Ensemble**:
   - Integrates Random Forest, LightGBM, XGBoost, and PyTorch Tabular MLP via a Ridge meta-regressor trained on out-of-fold cross-validated predictions.
   - Achieves the leading performance: **$R^2 = 0.9822$**, **$\text{RMSE} = 1.137\text{ tonnes/ha}$**, and **$\text{MAE} = 0.607\text{ tonnes/ha}$**.

4. **Nominal 90% Conformal Prediction Intervals**:
   - Provides distribution-free, non-parametric prediction intervals via Conformalized Quantile Calibration.
   - Tested on untouched evaluation data: calibrated margin $Q = 1.327\text{ tonnes/ha}$ yielding **88.99% empirical test coverage** (tight to nominal 90.0%).

5. **Degradation & Robustness Benchmarking**:
   - Automated stress tests under Missing Completely at Random (MCAR) and Missing at Random (MAR) across missingness levels (10%, 20%, 30%, 40%, 50%), alongside sensor Gaussian noise perturbations.

6. **Strict Zero-OTP JWT Authentication**:
   - Fully compliant with zero-OTP constraints: Email/Password registration, Argon2id password hashing, and PyJWT bearer token issuance. No email OTP, SMS OTP, or magic links.
   - SQLite local database support with seamless integration for InsForge PostgreSQL.

---

## 📊 Verified Empirical Benchmark Results

All metrics evaluated on identical, strictly held-out test data (5,187 test samples from 25,932 deduplicated records):

| Model Architecture | MAE (t/ha) | RMSE (t/ha) | $R^2$ Score | Primary Strength |
| :--- | :---: | :---: | :---: | :--- |
| **Random Forest Regressor** | 0.658 | 1.373 | 0.9740 | Robust non-linear interactions |
| **XGBoost Regressor** | 0.722 | 1.439 | 0.9714 | Gradient boosted tree baseline |
| **LightGBM Regressor** | 0.671 | 1.383 | 0.9736 | Fast histogram-based tree learning |
| **PyTorch Tabular MLP** | 0.643 | 1.215 | **0.9796** | Continuous categorical representations |
| **Stacking Meta-Ensemble** | **0.607** | **1.137** | **0.9822** | Optimal multi-paradigm variance reduction |

*Conformal Calibration at $\alpha = 0.10$: Calibrated Margin $Q = 1.3272\text{ t/ha}$, Empirical Coverage $= 88.99\%$.*

---

## 🏗️ System Architecture

```
candidate-1/
├── app/                              # Modular FastAPI Backend Application
│   ├── api/v1/                       # Versioned API routes
│   │   ├── endpoints/
│   │   │   ├── auth.py               # Zero-OTP Argon2id/JWT Register & Login
│   │   │   ├── predict.py            # Crop yield inference & Conformal UQ
│   │   │   ├── explain.py            # SHAP attribution & feature hierarchy
│   │   │   ├── models_compare.py     # ML vs DL empirical benchmarks
│   │   │   ├── robustness.py         # MCAR/MAR & noise stress tests
│   │   │   └── history.py            # User-isolated prediction history
│   │   └── api.py                    # Root router
│   ├── core/                         # Config, security, and JWT tokens
│   ├── db/                           # SQLAlchemy models and SQLite/InsForge integration
│   ├── ml/                           # ML & Deep Learning engine
│   │   ├── dl_model.py               # PyTorch Tabular MLP implementation
│   │   ├── conformal.py              # Distribution-free Conformal UQ
│   │   ├── robustness.py             # Degradation benchmark suite
│   │   └── train_all.py              # Full reproducible training pipeline
│   ├── schemas/                      # Pydantic request/response schemas
│   ├── services/                     # Business logic and cached pipeline service
│   └── main.py                       # FastAPI application entrypoint with lifespan
├── data/
│   ├── crop_yield_dataset.csv        # Deduplicated FAO/World Bank dataset (25,932 rows)
│   └── yield_df.csv                  # Original raw export (28,242 rows)
├── frontend/                         # Modern React + TypeScript + Vite Dashboard
│   ├── src/
│   │   ├── api.ts                    # Backend client with bearer token injection
│   │   ├── App.tsx                   # Multi-tab research workstation UI
│   │   ├── index.css                 # Custom glassmorphic styling system
│   │   └── types.ts                  # Shared TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── models/                           # Serialized models & artifacts
│   ├── crop_yield_model.pkl          # Trained Stacking Meta-Ensemble
│   ├── dl_mlp_model.pt               # Trained PyTorch Tabular MLP weights
│   ├── conformal_calibrator.pkl      # Calibrated conformal quantiles
│   ├── model_metadata.pkl            # Preprocessor, encoders & feature schema
│   └── benchmark_results.json        # Reproducible empirical metrics
├── tests/                            # Automated test suite
│   └── test_api.py                   # 8 end-to-end pytest verification cases
├── IMPLEMENTATION_LOG.md             # Comprehensive audit & execution log
├── .env.example                      # Template configuration
└── requirements.txt                  # Python dependencies
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.11 & 3.14)
- Node.js 18+ & npm

### 2. Backend Setup & Startup
```powershell
# Navigate to the repository root
cd candidate-1

# Install Python dependencies
python -m pip install -r requirements.txt

# (Optional) Retrain all models and reproduce benchmarks
python app/ml/train_all.py

# Launch the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger Documentation will be available at: `http://127.0.0.1:8000/docs`*
*Health Check Endpoint: `http://127.0.0.1:8000/health`*

### 3. Frontend Setup & Startup
```powershell
# In a separate terminal, navigate to the frontend directory
cd candidate-1/frontend

# Install dependencies (already built, or run npm install)
npm install

# Launch Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend Research Dashboard will be accessible at: `http://127.0.0.1:5173/`*

### 4. Running Backend Automated Tests
```powershell
cd candidate-1
python -m pytest tests/test_api.py -v
```
All 8 verification tests (Health, Options, Prediction & Conformal Intervals, SHAP, Benchmarks, Robustness, and Zero-OTP Auth) run and pass in under 5 seconds.

---

## 🔒 Security & Data Integrity

- **Zero-OTP Authentication**: Implemented using Argon2id with salt generation for password hashing. JWT access tokens are signed using HMAC-SHA256 with 24-hour expiration.
- **Cross-User Data Isolation**: User prediction histories are partitioned at the database layer using authenticated user IDs extracted from validated JWT bearer tokens.
- **Input Validation**: Strict environmental boundaries via Pydantic (`rainfall_mm` $\ge 0$, `avg_temp_c` between $-30$ and $60^\circ\text{C}$, `pesticides_tonnes` $\ge 0$). Invalid inputs return HTTP 422 with descriptive validation error payloads.

---

## 📄 License
This project is licensed under the MIT License.
