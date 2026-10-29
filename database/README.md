# Database Architecture — SQLite

## Overview
Terraflect uses **SQLite** (`crop_yield_platform.db`) as its persistence layer. The database operates in Write-Ahead Logging (WAL) mode with foreign keys enabled, providing high concurrent read performance, zero-configuration local portability, and robust data integrity.

## Connection Architecture
- **Engine:** Pure Python `sqlite3` driver implemented in `app/db/database.py`.
- **Concurrency Mode:** WAL mode (`PRAGMA journal_mode = WAL;`) allowing concurrent reads alongside active writes without database lock contention.
- **Relational Integrity:** Foreign keys strictly enforced on all connections via `PRAGMA foreign_keys = ON;`.
- **Transaction Safety:** Managed via context manager `_get_cursor()` providing automatic commit on success and rollback upon exception.
- **Data File:** `crop_yield_platform.db` located at the project workspace root.

## Tables
1. `app_users`: User registration, profile details, and authentication hashes.
2. `prediction_history`: Audited inference logs with country, crop, year, environmental factors, predicted yields, and 90% conformal prediction bounds.
3. `robustness_benchmark_runs`: Persisted results of missingness and noise robustness experiments.
