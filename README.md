# AgriYield AI

**An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors**

[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-InsForge%20PostgreSQL-336791.svg)](https://insforge.dev/)
[![XGBoost](https://img.shields.io/badge/Model-XGBoost%20Regressor-EB7234.svg)](https://xgboost.readthedocs.io/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## Overview

AgriYield AI is an agricultural intelligence platform that predicts crop yields from environmental factors (annual precipitation, mean temperature, pesticide application, crop species, and country/region). The platform integrates:

- **Production ML Engine:** Scikit-Learn Pipeline powered by XGBoost Regressor with 300 tree estimators ($R^2 = 0.9822$).
- **Group-Aware Conformal Uncertainty:** Crop-conditional non-negative 90% prediction intervals calibrated on disjoint Area-Item-Year groups.
- **Explainable AI (XAI):** Exact TreeSHAP local waterfall attributions and parameter sensitivity curves.
- **Modern Backend:** FastAPI ASGI backend with Zero-OTP Argon2id authentication, JWT authorization, and non-blocking multi-threaded concurrency.
- **Managed Database:** InsForge Managed PostgreSQL with connection pooling (`ThreadedConnectionPool`), foreign-key enforcement, and user-isolated prediction history.
- **Modern Frontend:** React 19, TypeScript, and Vite single-page research dashboard.

---

## Repository Structure

```text
Crop_Yield_Prediction/
├── frontend/           # React 19 + TypeScript + Vite SPA
├── app/                # Production FastAPI Backend Application
│   ├── api/v1/         # Modular REST endpoints (predict, explain, what-if, auth, history)
│   ├── core/           # Configuration (Pydantic Settings) and Argon2id security
│   ├── db/             # ThreadedConnectionPool persistence (PostgreSQL / SQLite)
│   ├── ml/             # Conformal calibrator, PyTorch MLP, robustness tests
│   ├── schemas/        # Pydantic V2 request and response contracts
│   └── services/       # PredictionService, TreeSHAP explainer, artifact manager
├── database/           # Reference PostgreSQL schema and architecture documentation
├── migrations/         # Official InsForge database migrations (CLI managed)
├── models/             # Serialized production models and conformal calibrators
├── data/               # FAOSTAT agricultural environmental dataset (25,932 records)
├── tests/              # Automated test suites (33 core regression + 8 PostgreSQL tests)
├── docs/               # Architecture, API integration contract, and research reports
│   ├── api/            # FRONTEND_INTEGRATION_CONTRACT.md
│   ├── architecture/   # PROJECT_STRUCTURE.md
│   ├── testing/        # FINAL_BACKEND_READINESS_REPORT.md
│   ├── reports/        # Complete historical verification reports archive
│   └── research/       # Exploratory analysis plots and experiment results
├── scripts/            # Conformal calibration, leakage audit, and migration scripts
└── requirements.txt    # Authoritative Python dependencies manifest
```

---

## Quick Start Guide

### 1. Prerequisites
- Python 3.11+ (Python 3.14 recommended)
- Node.js 18+ and npm
- Git

### 2. Backend Setup
```bash
# Clone the repository:
git clone https://github.com/Modepalli-Ravindra/AgriYield-AI.git
cd AgriYield-AI

# Create and activate a virtual environment:
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Configure environment variables:
cp .env.example .env
# Edit .env to supply your DATABASE_URL (or leave unset for local SQLite fallback)

# Run the FastAPI server:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Dashboard will be available at: [http://127.0.0.1:5173](http://127.0.0.1:5173)

### 4. Running Tests
```bash
# Run complete test suite (41 tests):
python -m pytest tests/test_api.py tests/test_postgres_integration.py -v
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check and database connectivity probe |
| `GET` | `/api/v1/options` | Supported countries, crops, and year boundaries |
| `POST` | `/api/v1/auth/register` | Zero-OTP researcher account registration |
| `POST` | `/api/v1/auth/login` | Argon2id login issuing 24-hour signed JWT |
| `GET` | `/api/v1/auth/me` | Fetch authenticated researcher profile |
| `POST` | `/api/v1/predict` | Crop yield prediction with 90% conformal intervals & TreeSHAP |
| `POST` | `/api/v1/predict/batch` | Batch prediction across multiple regional scenarios |
| `POST` | `/api/v1/explain` | Exact TreeSHAP feature impact waterfall attribution |
| `POST` | `/api/v1/sensitivity` | Single-parameter environmental sensitivity sweep |
| `POST` | `/api/v1/what-if` | Multi-scenario hypothetical comparative analysis |
| `GET` | `/api/v1/history` | User-isolated prediction audit history trail |
| `GET` | `/api/v1/global-importance` | Global XGBoost feature importance scores |

For detailed request and response contracts, consult [docs/api/FRONTEND_INTEGRATION_CONTRACT.md](docs/api/FRONTEND_INTEGRATION_CONTRACT.md).

---

## Database Configuration (InsForge PostgreSQL)

AgriYield AI uses InsForge Managed PostgreSQL for production persistence. Migrations are tracked under `migrations/` and applied using the InsForge CLI:
```bash
npx -y @insforge/cli db migrations up --all
```
For local offline development, the system automatically falls back to SQLite in WAL mode if `DATABASE_URL` is configured with `sqlite:///...`.

---

## Official Repository & Branch
- **GitHub Repository:** [`https://github.com/Modepalli-Ravindra/AgriYield-AI.git`](https://github.com/Modepalli-Ravindra/AgriYield-AI.git)
- **Active Feature Branch:** `feature/dl-ml-research-framework`
