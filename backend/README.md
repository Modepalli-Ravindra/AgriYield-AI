# Terraflect Backend (FastAPI)

FastAPI service powering Terraflect — Crop Yield Intelligence Platform.

## Directory Structure
- `app/`
  - `api/`: API v1 endpoints (`auth`, `predict`, `explain`, `models_compare`, `robustness`, `history`)
  - `climate/`: Historical and real-time agro-climatic ingest and processing
  - `core/`: Application settings, security, and JWT auth
  - `db/`: SQLite database persistence layer (`crop_yield_platform.db` in WAL mode)
  - `ml/`: Model training pipelines and Conformal Prediction calibrator
  - `schemas/`: Pydantic request and response schemas
  - `services/`: Production prediction, weather, explainability, and auth services
  - `main.py`: FastAPI application entrypoint
- `requirements.txt`: Python package dependencies
- `run_backend.bat`: 1-click launcher for the backend server
- `.env`: Environment configuration

## Running the Backend
From the repository root:
```bash
run_backend.bat
```
Or directly from `backend/`:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API docs available at: `http://127.0.0.1:8000/docs`

