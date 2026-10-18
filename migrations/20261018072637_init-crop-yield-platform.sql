-- Migration: init-crop-yield-platform
-- Description: PostgreSQL schema for Crop Yield Prediction Research Platform

CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name TEXT,
    organization TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);

CREATE TABLE IF NOT EXISTS public.prediction_history (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.app_users(id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    avg_temp_c DOUBLE PRECISION NOT NULL,
    pesticides_tonnes DOUBLE PRECISION,
    predicted_yield_hg_per_ha DOUBLE PRECISION NOT NULL,
    predicted_yield_tonnes_per_ha DOUBLE PRECISION NOT NULL,
    conformal_lower_bound DOUBLE PRECISION NOT NULL,
    conformal_upper_bound DOUBLE PRECISION NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_user ON public.prediction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON public.prediction_history(created_at DESC);

CREATE TABLE IF NOT EXISTS public.robustness_benchmark_runs (
    id TEXT PRIMARY KEY,
    test_type VARCHAR(100) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    baseline_rmse DOUBLE PRECISION NOT NULL,
    baseline_mae DOUBLE PRECISION NOT NULL,
    results_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_robustness_test_type ON public.robustness_benchmark_runs(test_type);
