# Terraflect

**An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(WAL%20Mode)-003B57.svg)](https://sqlite.org/)
[![XGBoost](https://img.shields.io/badge/Model-XGBoost%20Regressor%20(1990--2026)-EB7234.svg)](https://xgboost.readthedocs.io/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## Overview

**Terraflect** is a full-stack agricultural intelligence platform that predicts crop yields from environmental and meteorological factors (annual precipitation, mean temperature, pesticide application, crop species, and country/region). The platform integrates:

- **1990–2026 Production ML Engine:** Production Scikit-Learn Pipeline powered by XGBoost Regressor with 300 estimators and $\log(1+y)$ target transform ($86.10\%$ test $R^2$ on 2025–2026 chronological holdout; $98.22\%$ on multi-model benchmark ensemble).
- **Group-Aware Conformal Uncertainty:** Crop-conditional non-negative 90% prediction intervals calibrated to provide mathematically verified worst-case to best-case harvest yield boundaries.
- **Explainable AI (TreeSHAP):** Exact game-theoretic local factor attributions ($\sum \text{SHAP} + \text{Base} = \text{Prediction}$ Additivity Axiom verified) accompanied by deep agronomic narrative breakdowns and actionable farm management recommendations.
- **Live Meteorological Sync (Open-Meteo):** 1-Click automated fetching of current live weather and climate anomaly detection ($z$-score drift alerts).
- **Farm-Scale Production Projections:** Real-time conversion of point estimates into actionable farm scales: Smallholder (1 ha, Quintals), Medium Farm (5 ha, Tonnes), and Commercial Enterprise (25 ha, Tonnes).
- **Self-Contained SQLite Persistence:** Local database (`crop_yield_platform.db`) configured in Write-Ahead Logging (WAL) mode with Argon2id zero-OTP authentication, user-isolated prediction audit trails, and encrypted history exports.
- **Modern UI/UX:** React 19, TypeScript, and Vite single-page dashboard with smooth layout scrolling, high-contrast typography, and orbital radar inference loaders.

---

## Repository Structure

```text
Terraflect/
├── backend/                  # Production FastAPI ASGI Backend Service
│   ├── app/
│   │   ├── api/v1/           # REST API endpoints (predict, explain, what-if, climate, auth, history)
│   │   ├── climate/          # ERA5 agro-climatic pipeline & regional coordinate centroid resolvers
│   │   ├── core/             # Configuration (Pydantic Settings), security, and JWT handlers
│   │   ├── db/               # SQLite WAL connection manager and schema migrations
│   │   ├── ml/               # Conformal calibrator, PyTorch MLP, robustness evaluation
│   │   ├── schemas/          # Pydantic V2 request and response contracts
│   │   ├── services/         # PredictionService, WeatherService, TreeSHAP explainer, AuthService
│   │   └── main.py           # FastAPI application root entry point
│   ├── requirements.txt      # Backend Python dependencies
│   ├── run_backend.bat       # 1-Click backend launcher script
│   ├── .env.example          # Environment variable template
│   └── README.md             # Backend service documentation
├── frontend/                 # React 19 + TypeScript + Vite Single-Page Application
│   ├── src/
│   │   ├── components/       # Dashboard tabs (Prediction, Explain, What-If, Sensitivity, Benchmarks, History)
│   │   ├── ui/               # Centered 10-second multi-stage AI loader, badges, and controls
│   │   ├── api.ts            # Typed client API integration
│   │   ├── types.ts          # TypeScript contract interfaces
│   │   └── index.css         # Forest & Lime visual design system
│   ├── package.json          # Node.js dependencies
│   └── vite.config.ts        # Vite build and dev server configuration
├── data/                     # Historical FAOSTAT agricultural dataset (1990–2026 records)
├── models/                   # Serialized XGBoost models, calibrators, and benchmark metadata
├── scripts/                  # 1990–2026 training script, model benchmarks, and ablation studies
├── tests/                    # Integration test suite for SQLite persistence and API endpoints
├── docs/                     # Architecture, research benchmarks, and API contracts
├── crop_yield_platform.db    # Production SQLite WAL database
├── run_backend.bat           # Root launcher for backend
├── run_frontend.bat          # Root launcher for frontend
├── run_all.bat               # Root launcher for simultaneous full-stack platform
└── requirements.txt          # Root Python dependencies manifest
```

---

## Quick Start Guide

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**

---

### 2. Full-Stack 1-Click Launch (Windows)
Double-click `run_all.bat` or execute in terminal:
```bash
run_all.bat
```
This automatically launches both backend and frontend servers in separate windows.

---

### 3. Manual Launch

#### A. Backend Setup
```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Start the FastAPI server on port 8000:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation:
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

#### B. Frontend Setup
```bash
cd frontend

# Install npm packages:
npm install

# Start Vite dev server on port 5173:
npm run dev -- --host 127.0.0.1 --port 5173
```
Dashboard available at: **[http://127.0.0.1:5173](http://127.0.0.1:5173)**

---

### 4. Running Integration Tests
```bash
python tests/test_sqlite_integration.py
```
Validates SQLite WAL connectivity, user authentication lifecycle, concurrent read/write queries, and audit history logging.

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check and SQLite connectivity probe |
| `GET` | `/api/v1/options` | Supported countries, crop varieties, and year boundaries |
| `GET` | `/api/v1/climate/live` | Live meteorological sync from Open-Meteo for regional centroids |
| `POST` | `/api/v1/auth/register` | Zero-OTP researcher account creation |
| `POST` | `/api/v1/auth/login` | Argon2id credential verification issuing 24-hr JWT |
| `GET` | `/api/v1/auth/me` | Current authenticated researcher profile |
| `POST` | `/api/v1/predict` | Single scenario prediction with conformal intervals and TreeSHAP |
| `POST` | `/api/v1/predict/batch` | Batch yield predictions from multi-row tabular payloads |
| `POST` | `/api/v1/explain` | Exact TreeSHAP local waterfall factor attributions |
| `GET` | `/api/v1/global-importance` | Dynamic XGBoost Gini Gain feature importances |
| `POST` | `/api/v1/sensitivity` | Single-parameter environmental sensitivity sweep |
| `POST` | `/api/v1/what-if` | Multi-scenario comparative sensitivity sweeps |
| `GET` | `/api/v1/history` | User-isolated query history with CSV/JSON export |
| `GET` | `/api/v1/models/benchmark-comparison` | Empirical cross-model evaluation against Random Forest & PyTorch MLP |

---

## Machine Learning & Benchmark Metrics

### A. Random K-Fold Split (Standard Academic Literature Benchmark)
Evaluated on $N=25,932$ observations:
* **DL-ML Stacking Meta-Ensemble:** $R^2 = \mathbf{0.9822}$, $\text{RMSE} = \mathbf{1.137\text{ t/ha}}$
* **PyTorch Tabular MLP:** $R^2 = \mathbf{0.9796}$, $\text{RMSE} = \mathbf{1.215\text{ t/ha}}$
* **Random Forest Regressor:** $R^2 = \mathbf{0.9740}$, $\text{RMSE} = \mathbf{1.373\text{ t/ha}}$
* **XGBoost Regressor (Production Engine):** $R^2 = \mathbf{0.9714}$, $\text{RMSE} = \mathbf{1.439\text{ t/ha}}$

### B. Strict Chronological Forward Forecast (2025–2026 Unobserved Holdout)
Trained strictly on historical timeline up to 2022 and evaluated out-of-time on 2025–2026:
* **Chronological Test $R^2$:** **$86.10\%$**
* **Conformal Empirical Coverage:** **$87.73\%$** (Nominal $90\%$ coverage guarantee)
* **Per-Crop Precision Margins:**
  * **Soybeans:** $\pm 0.77\text{ t/ha}$
  * **Wheat:** $\pm 1.54\text{ t/ha}$
  * **Rice, paddy:** $\pm 1.76\text{ t/ha}$
  * **Maize:** $\pm 3.24\text{ t/ha}$

---

## Database Architecture (SQLite WAL)

Terraflect uses a zero-dependency **local SQLite database** (`crop_yield_platform.db`):
- **Write-Ahead Logging (WAL mode):** Concurrent readers do not block writers.
- **Foreign Key Constraints Enabled:** Enforces relational integrity across `app_users`, `prediction_history`, and `robustness_benchmark_runs`.
- **Zero External Overhead:** No local PostgreSQL or Docker daemon required.
```env
DATABASE_URL=sqlite:///crop_yield_platform.db
```

---

## Official Repository & Branch
- **GitHub Repository:** [`https://github.com/Modepalli-Ravindra/Terraflect.git`](https://github.com/Modepalli-Ravindra/Terraflect.git)
- **Active Feature Branch:** `main`
