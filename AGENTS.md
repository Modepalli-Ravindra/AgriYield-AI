# AGENTS.md

## Backend & Database Architecture

This project uses a standard, self-contained **FastAPI** backend with a local **SQLite** database (`crop_yield_platform.db`).

- **Database:** Local SQLite (`crop_yield_platform.db`) configured with Write-Ahead Logging (WAL) mode and foreign-key constraints enabled.
- **Persistence Layer:** [app/db/database.py](file:///c:/Users/user/OneDrive/Desktop/Terraflect/app/db/database.py) using Python's built-in `sqlite3` module.
- **Credentials:** Connection strings are read from `.env` via `DATABASE_URL=sqlite:///crop_yield_platform.db`.
- **Tables:** `app_users`, `prediction_history`, `robustness_benchmark_runs`.
