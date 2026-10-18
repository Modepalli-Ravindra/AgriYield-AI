# Terraflect — Repository Architecture & Directory Structure

**Document Version:** 2.0.0  
**Project:** An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors  
**Target Environment:** FastAPI (Backend) + React 19/Vite (Frontend) + InsForge Managed PostgreSQL (Database)

---

## 1. Directory Tree Layout

```text
Crop_Yield_Prediction/
│
├── frontend/                               # React 19 + TypeScript + Vite Single Page Application
│   ├── public/                             # Static web assets (favicon, icons)
│   ├── src/                                # Application source code
│   │   ├── assets/                         # UI icons and graphic assets
│   │   ├── api.ts                          # Frontend API client communicating with backend
│   │   ├── types.ts                        # TypeScript interfaces matching backend Pydantic schemas
│   │   ├── App.tsx                         # Core research dashboard UI component
│   │   ├── App.css                         # Application layout and tab styling
│   │   ├── index.css                       # Modern CSS design tokens, themes, typography
│   │   └── main.tsx                        # React application DOM entrypoint
│   ├── package.json                        # Frontend dependencies & npm run dev/build scripts
│   ├── tsconfig.json                       # TypeScript compiler configuration
│   └── vite.config.ts                      # Vite development server and proxy bundler
│
├── app/                                    # Production FastAPI Backend Application
│   ├── api/                                # API routing layer
│   │   └── v1/                             # Version 1 API router and modular endpoints
│   │       ├── endpoints/
│   │       │   ├── auth.py                 # Zero-OTP registration, login, and JWT /me profile
│   │       │   ├── predict.py              # Single and batch prediction endpoints, reference data
│   │       │   ├── explain.py              # Exact TreeSHAP attribution, sensitivity curves, what-if
│   │       │   ├── history.py              # User-isolated prediction history retrieval
│   │       │   ├── models_compare.py       # Model performance comparisons and test R² metrics
│   │       │   └── robustness.py           # Robustness perturbation testing endpoints
│   │       └── api.py                      # Aggregated API v1 router definition
│   ├── core/                               # Core configuration and security
│   │   ├── config.py                       # Pydantic Settings, environment variables, path anchors
│   │   └── security.py                     # Argon2id password hashing and HS256 JWT operations
│   ├── db/                                 # Database persistence layer
│   │   └── database.py                     # ThreadedConnectionPool, PostgreSQL/SQLite dual-engine
│   ├── ml/                                 # Machine learning support classes
│   │   ├── conformal.py                    # Group-aware conformal calibrator and crop quantiles
│   │   ├── dl_model.py                     # PyTorch MLP deep learning benchmark architecture
│   │   ├── robustness.py                   # Environmental noise and extreme shock evaluators
│   │   └── train_all.py                    # 4-way disjoint group-aware training pipeline script
│   ├── schemas/                            # Pydantic V2 request and response contracts
│   │   ├── auth.py                         # Registration, Login, Token, and Profile schemas
│   │   ├── explanation.py                  # ExplainResponse, Sensitivity, and WhatIf schemas
│   │   ├── prediction.py                   # YieldInput, PredictionResponse, Batch schemas
│   │   └── robustness.py                   # RobustnessTestRequest and RobustnessTestResponse schemas
│   ├── services/                           # Business logic and inference orchestration
│   │   └── prediction_service.py           # Artifact loader, TreeSHAP explainer, inference engine
│   └── main.py                             # FastAPI application factory, CORS, lifespan, /health
│
├── database/                               # Database Schema Documentation & Tooling
│   ├── schema.sql                          # Reference PostgreSQL DDL schema export
│   └── README.md                           # InsForge PostgreSQL architecture and connection guide
│
├── migrations/                             # Official InsForge Database Migrations (CLI managed)
│   └── 20261018072637_init-crop-yield-platform.sql  # Initial applied DDL migration
│
├── models/                                 # Serialized Production ML Models & Calibration Artifacts
│   ├── crop_yield_model.pkl                # Production XGBoost Regressor Pipeline (1.03 MB)
│   ├── conformal_calibrator.pkl            # Group-aware crop-conditional conformal calibrator
│   ├── model_metadata.pkl                  # Model performance metrics, feature names, R²
│   ├── dl_mlp_model.pt                     # PyTorch Deep Learning MLP benchmark checkpoint
│   ├── benchmark_results.json              # Model comparison evaluation results
│   └── model_selection_comparison.json     # Comprehensive selection benchmark audit report
│
├── data/                                   # Agricultural Environmental Datasets
│   ├── yield_df.csv                        # FAOSTAT historical yield and climate dataset (25,932 rows)
│   └── README.md                           # Dataset documentation, features, and units
│
├── tests/                                  # Automated Test Suites
│   ├── test_api.py                         # 33 core backend API regression tests
│   └── test_postgres_integration.py        # 8 dedicated InsForge PostgreSQL integration tests
│
├── docs/                                   # Comprehensive Research, Architecture & API Documentation
│   ├── api/
│   │   └── FRONTEND_INTEGRATION_CONTRACT.md # Detailed frontend developer integration specification
│   ├── architecture/
│   │   └── PROJECT_STRUCTURE.md            # Repository organization guide (this file)
│   ├── testing/
│   │   └── FINAL_BACKEND_READINESS_REPORT.md # Comprehensive production readiness audit report
│   ├── reports/                            # Complete archive of Phase 2 and Phase 3 verification reports
│   └── research/                           # Research plots, images, and experiment result logs
│       └── images/                         # Exploratory data analysis visualization plots
│
├── scripts/                                # Audit, Calibration & Migration Tooling
│   ├── migrate_sqlite_to_postgres.py       # Automated SQLite to PostgreSQL data migration script
│   ├── group_aware_conformal_audit.py      # Conformal prediction interval auditor
│   ├── leakage_integrity_audit.py          # Data leakage and disjoint group split auditor
│   ├── model_selection_benchmark.py        # Multi-model evaluation and selection benchmark script
│   ├── independent_verification.py         # Full independent research verification suite
│   ├── reconcile_audit.py                  # Audit metric reconciliation script
│   ├── verify_splits.py                    # 4-way group disjointness verifier
│   ├── conformal_math_check.py             # Numerical conformal bounds test script
│   ├── investigate_repeats.py              # Dataset tuple repeat investigator
│   └── legacy/                             # Archived historical prototypes
│       ├── main.py                         # Monolithic pre-modular FastAPI script
│       ├── streamlit_app.py                # Early Streamlit exploration prototype
│       └── README.md                       # Legacy archive documentation
│
├── notebooks/                              # Jupyter Notebooks
│   └── Crop_Yield_Prediction.ipynb         # Interactive exploratory research notebook
│
├── .env.example                            # Safe environment variable template with placeholders
├── .gitignore                              # Strict exclusion of .env, *.db, .insforge, and caches
├── AGENTS.md                               # InsForge agent guidance and project context
├── requirements.txt                        # Authoritative Python dependencies manifest
└── README.md                               # Project entrypoint, setup, and developer guide
```

---

## 2. Component Boundaries and Path Rationale

1. **Top-Level `app/` Directory:**
   The production FastAPI backend is maintained in `app/`. This conforms to standard Python / ASGI conventions (`uvicorn app.main:app`), ensuring clean relative imports and eliminating path manipulation in production servers or container entrypoints.
2. **Top-Level `frontend/` Directory:**
   The frontend is an isolated React 19 + TypeScript + Vite project. It manages its own `package.json`, dependencies, and build pipeline without mixing with the Python backend.
3. **Dedicated `models/` Directory:**
   Serialized production models and calibration objects are kept in `models/`. Paths are anchored in `app/core/config.py` using `BASE_DIR / "models"`, making deployments deterministic regardless of execution working directory.
4. **InsForge `migrations/` Directory:**
   `migrations/` is preserved at the workspace root to conform to the default discovery mechanism of `@insforge/cli`. Additional architectural documentation and SQL exports are located under `database/`.
5. **Clean Root Directory:**
   All 22 historical markdown reports, JSON logs, and exploratory charts have been relocated under `docs/reports/` and `docs/research/`, leaving the project root clean, concise, and professional for incoming developers.
