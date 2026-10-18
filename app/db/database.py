"""Database persistence layer supporting InsForge PostgreSQL and SQLite."""
from __future__ import annotations

import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import logging
from pathlib import Path
import threading

from app.core.config import settings

logger = logging.getLogger(__name__)

# Attempt to import psycopg2 for PostgreSQL support
try:
    import psycopg2
    from psycopg2.pool import ThreadedConnectionPool
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    logger.warning("psycopg2 is not installed; PostgreSQL operations will be unavailable.")

class Database:
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or settings.DATABASE_URL
        self.is_postgres = self.db_url.startswith(("postgresql://", "postgres://"))
        self._pool: Optional[ThreadedConnectionPool] = None
        self._lock = threading.Lock()

        if self.is_postgres:
            if not PSYCOPG2_AVAILABLE:
                raise RuntimeError("PostgreSQL URL configured but psycopg2 is not available in the Python environment.")
            self._ensure_pool()

        self._init_db()

    def _ensure_pool(self):
        """Thread-safe pool initialization and recovery."""
        if not self.is_postgres:
            return
        if self._pool is None or self._pool.closed:
            with self._lock:
                if self._pool is None or self._pool.closed:
                    try:
                        self._pool = ThreadedConnectionPool(minconn=1, maxconn=20, dsn=self.db_url)
                        logger.info("Initialized PostgreSQL ThreadedConnectionPool (1-20 connections).")
                    except Exception as e:
                        logger.error("Failed to initialize PostgreSQL connection pool: %s", e)
                        raise

    @contextmanager
    def _get_cursor(self):
        """Context manager providing a database cursor with automatic transaction commit/rollback."""
        if self.is_postgres:
            self._ensure_pool()
            conn = self._pool.getconn()
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    yield cur
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                if not self._pool.closed:
                    self._pool.putconn(conn)
        else:
            if self.db_url.startswith("sqlite:///"):
                path = self.db_url.replace("sqlite:///", "")
            else:
                path = str(settings.BASE_DIR / "crop_yield_platform.db")

            conn = sqlite3.connect(path, timeout=30.0, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON;")
            try:
                with conn:
                    cur = conn.cursor()
                    yield cur
            finally:
                conn.close()

    def _init_db(self):
        """Initialize required application tables and concurrency pragmas."""
        try:
            with self._get_cursor() as cur:
                if self.is_postgres:
                    cur.execute("""
                    CREATE TABLE IF NOT EXISTS public.app_users (
                        id TEXT PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        hashed_password TEXT NOT NULL,
                        full_name TEXT,
                        organization TEXT,
                        created_at TEXT NOT NULL
                    );
                    """)
                    cur.execute("""
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
                    """)
                    cur.execute("""
                    CREATE TABLE IF NOT EXISTS public.robustness_benchmark_runs (
                        id TEXT PRIMARY KEY,
                        test_type VARCHAR(100) NOT NULL,
                        model_name VARCHAR(100) NOT NULL,
                        baseline_rmse DOUBLE PRECISION NOT NULL,
                        baseline_mae DOUBLE PRECISION NOT NULL,
                        results_json TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    );
                    """)
                    cur.execute("CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);")
                    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_user ON public.prediction_history(user_id);")
                    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_created_at ON public.prediction_history(created_at DESC);")
                    logger.info("PostgreSQL database tables and indexes verified successfully.")
                else:
                    cur.execute("PRAGMA journal_mode = WAL;")
                    cur.execute("PRAGMA synchronous = NORMAL;")
                    cur.execute("""
                    CREATE TABLE IF NOT EXISTS app_users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        hashed_password TEXT NOT NULL,
                        full_name TEXT,
                        organization TEXT,
                        created_at TEXT NOT NULL
                    );
                    """)
                    cur.execute("""
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
                    """)
                    cur.execute("""
                    CREATE TABLE IF NOT EXISTS robustness_benchmark_runs (
                        id TEXT PRIMARY KEY,
                        test_type TEXT NOT NULL,
                        model_name TEXT NOT NULL,
                        baseline_rmse REAL NOT NULL,
                        baseline_mae REAL NOT NULL,
                        results_json TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    );
                    """)
                    cur.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON app_users(email);")
                    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_user ON prediction_history(user_id);")
                    logger.info("SQLite database initialized successfully with WAL journal mode.")
        except Exception as e:
            logger.error("Error during database schema initialization: %s", e)

    def check_health(self) -> bool:
        """Lightweight database connectivity check."""
        try:
            with self._get_cursor() as cur:
                cur.execute("SELECT 1;")
                row = cur.fetchone()
                if row is None:
                    return False
                if isinstance(row, dict):
                    val = list(row.values())[0]
                else:
                    val = row[0]
                return val == 1
        except Exception as e:
            logger.error("Database health check ping failed: %s", e)
            return False

    # --- User operations ---
    def create_user(self, email: str, hashed_password: str, full_name: Optional[str] = None, organization: Optional[str] = None) -> Dict[str, Any]:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        with self._get_cursor() as cur:
            if self.is_postgres:
                cur.execute(
                    """INSERT INTO public.app_users (id, email, hashed_password, full_name, organization, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s);""",
                    (user_id, email.lower().strip(), hashed_password, full_name, organization, now)
                )
            else:
                cur.execute(
                    "INSERT INTO app_users (id, email, hashed_password, full_name, organization, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, email.lower().strip(), hashed_password, full_name, organization, now)
                )
        return {
            "id": user_id,
            "email": email.lower().strip(),
            "full_name": full_name,
            "organization": organization,
            "created_at": now
        }

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self._get_cursor() as cur:
            if self.is_postgres:
                cur.execute("SELECT * FROM public.app_users WHERE email = %s;", (email.lower().strip(),))
            else:
                cur.execute("SELECT * FROM app_users WHERE email = ?", (email.lower().strip(),))
            row = cur.fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self._get_cursor() as cur:
            if self.is_postgres:
                cur.execute("SELECT id, email, full_name, organization, created_at FROM public.app_users WHERE id = %s;", (user_id,))
            else:
                cur.execute("SELECT id, email, full_name, organization, created_at FROM app_users WHERE id = ?", (user_id,))
            row = cur.fetchone()
            return dict(row) if row else None

    # --- Prediction history operations ---
    def save_prediction(
        self,
        country: str,
        crop: str,
        year: int,
        rainfall_mm: float,
        avg_temp_c: float,
        pesticides_tonnes: float,
        predicted_yield_hg_per_ha: float,
        predicted_yield_tonnes_per_ha: float,
        conformal_lower_bound: float,
        conformal_upper_bound: float,
        model_version: str = "Production-XGBoost-v2",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        pred_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        with self._get_cursor() as cur:
            if self.is_postgres:
                cur.execute(
                    """INSERT INTO public.prediction_history (
                        id, user_id, country, crop, year, rainfall_mm, avg_temp_c, pesticides_tonnes,
                        predicted_yield_hg_per_ha, predicted_yield_tonnes_per_ha,
                        conformal_lower_bound, conformal_upper_bound, model_version, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);""",
                    (
                        pred_id, user_id, country, crop, year, rainfall_mm, avg_temp_c, pesticides_tonnes,
                        predicted_yield_hg_per_ha, predicted_yield_tonnes_per_ha,
                        conformal_lower_bound, conformal_upper_bound, model_version, now
                    )
                )
            else:
                cur.execute(
                    """INSERT INTO prediction_history (
                        id, user_id, country, crop, year, rainfall_mm, avg_temp_c, pesticides_tonnes,
                        predicted_yield_hg_per_ha, predicted_yield_tonnes_per_ha,
                        conformal_lower_bound, conformal_upper_bound, model_version, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        pred_id, user_id, country, crop, year, rainfall_mm, avg_temp_c, pesticides_tonnes,
                        predicted_yield_hg_per_ha, predicted_yield_tonnes_per_ha,
                        conformal_lower_bound, conformal_upper_bound, model_version, now
                    )
                )
        return {
            "id": pred_id,
            "country": country,
            "crop": crop,
            "year": year,
            "predicted_yield_tonnes_per_ha": predicted_yield_tonnes_per_ha,
            "conformal_interval": [conformal_lower_bound, conformal_upper_bound],
            "created_at": now
        }

    def get_predictions(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_cursor() as cur:
            if self.is_postgres:
                if user_id:
                    cur.execute(
                        "SELECT * FROM public.prediction_history WHERE user_id = %s ORDER BY created_at DESC LIMIT %s;",
                        (user_id, limit)
                    )
                else:
                    cur.execute(
                        "SELECT * FROM public.prediction_history ORDER BY created_at DESC LIMIT %s;",
                        (limit,)
                    )
            else:
                if user_id:
                    cur.execute(
                        "SELECT * FROM prediction_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                        (user_id, limit)
                    )
                else:
                    cur.execute(
                        "SELECT * FROM prediction_history ORDER BY created_at DESC LIMIT ?",
                        (limit,)
                    )
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def close(self):
        """Cleanly close connection pools during application shutdown."""
        with self._lock:
            if self._pool is not None and not self._pool.closed:
                self._pool.closeall()
                logger.info("Closed PostgreSQL ThreadedConnectionPool.")

db = Database()
