-- Terraflect - SQLite Database Schema
-- File: crop_yield_platform.db
-- Configuration: PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;

-- 1. Researcher Accounts Table
CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name TEXT,
    organization TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON app_users(email);

-- 2. Prediction History Audit Trail Table
CREATE TABLE IF NOT EXISTS prediction_history (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    country TEXT NOT NULL,
    crop TEXT NOT NULL,
    year INTEGER NOT NULL,
    rainfall_mm REAL NOT NULL,
    avg_temp_c REAL NOT NULL,
    pesticides_tonnes REAL,
    predicted_yield_hg_per_ha REAL NOT NULL,
    predicted_yield_tonnes_per_ha REAL NOT NULL,
    conformal_lower_bound REAL NOT NULL,
    conformal_upper_bound REAL NOT NULL,
    model_version TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_user ON prediction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON prediction_history(created_at DESC);

-- 3. Robustness Benchmark Runs Table
CREATE TABLE IF NOT EXISTS robustness_benchmark_runs (
    id TEXT PRIMARY KEY,
    test_type TEXT NOT NULL,
    model_name TEXT NOT NULL,
    baseline_rmse REAL NOT NULL,
    baseline_mae REAL NOT NULL,
    results_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_robustness_test_type ON robustness_benchmark_runs(test_type);
