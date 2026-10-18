# Legacy Scripts Archive

## Purpose
This directory archives historical prototypes created during Phase 1 and Phase 2 exploratory research before the modular FastAPI backend and React frontend were established:

1. `main.py` (27 KB): Early monolithic FastAPI script before modularization into `app/`.
2. `streamlit_app.py` (38 KB): Exploratory Streamlit demonstration dashboard.

## Current Production System
The current production backend is located in `app/` and run using:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The modern frontend is located in `frontend/` (React 19, TypeScript, Vite).
