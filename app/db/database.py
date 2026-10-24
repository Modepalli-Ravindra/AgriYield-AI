"""Database persistence layer supporting InsForge PostgreSQL and SQLite."""
from __future__ import annotations

import logging
import sqlite3
import threading
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Attempt to import psycopg2 for PostgreSQL / InsForge support
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from psycopg2.pool import ThreadedConnectionPool

    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    logger.warning("psycopg2 is not installed; PostgreSQL operations will be unavailable.")


class Database:
    """Unified database persistence engine with connection pooling and dialect abstraction."""

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or settings.DATABASE_URL
        self.is_postgres = self.db_url.startswith(("postgresql://", "postgres://"))
        self._pool: Optional[ThreadedConnectionPool] = None
        self._lock = threading.Lock()

        if self.is_postgres:
            if not PSYCOPG2_AVAILABLE:
                logger.warning(
                    "PostgreSQL URL configured but psycopg2 is not available; falling back to local SQLite database."
                )
                self.is_postgres = False
                self.db_url = f"sqlite:///{settings.BASE_DIR / 'crop_yield_platform.db'}"
            else:
                self._ensure_pool()

        self._init_db()

    def _ensure_pool(self) -> None:
        """Thread-safe PostgreSQL pool initialization and recovery."""
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
            broken = False
            try:
                # Fast liveness check
                if conn.closed:
                    self._pool.putconn(conn, close=True)
                    conn = self._pool.getconn()

                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    yield cur
                conn.commit()
            except Exception:
                broken = True
                try:
                    if not conn.closed:
                        conn.rollback()
                except Exception:
                    pass
                raise
            finally:
                if not self._pool.closed:
                    try:
                        self._pool.putconn(conn, close=broken)
                    except Exception:
                        pass
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

    def _sql(self, query: str) -> str:
        """Adapt standard query for PostgreSQL vs SQLite syntax."""
        if self.is_postgres:
            return query
        return query.replace("public.", "").replace("%s", "?")

    def _init_db(self) -> None:
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
                val = list(row.values())[0] if isinstance(row, dict) else row[0]
                return val == 1
        except Exception as e:
            logger.error("Database health check ping failed: %s", e)
            return False

    # --- User operations ---
    def create_user(
        self,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        organization: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Insert a newly registered user into the database."""
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        normalized_email = email.lower().strip()

        query = self._sql(
            "INSERT INTO public.app_users (id, email, hashed_password, full_name, organization, created_at) "
            "VALUES (%s, %s, %s, %s, %s, %s);"
        )
        with self._get_cursor() as cur:
            cur.execute(query, (user_id, normalized_email, hashed_password, full_name, organization, now))

        return {
            "id": user_id,
            "email": normalized_email,
            "full_name": full_name,
            "organization": organization,
            "created_at": now,
        }

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Fetch user record by normalized email address."""
        query = self._sql("SELECT * FROM public.app_users WHERE email = %s;")
        with self._get_cursor() as cur:
            cur.execute(query, (email.lower().strip(),))
            row = cur.fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user record by unique identifier."""
        query = self._sql("SELECT id, email, full_name, organization, created_at FROM public.app_users WHERE id = %s;")
        with self._get_cursor() as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()
            return dict(row) if row else None

    def update_user_password(self, email: str, new_hashed_password: str) -> bool:
        """Update password hash for a registered user."""
        query = self._sql("UPDATE public.app_users SET hashed_password = %s WHERE email = %s;")
        with self._get_cursor() as cur:
            cur.execute(query, (new_hashed_password, email.lower().strip()))
            return cur.rowcount > 0

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
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Record an inference event and its calibrated bounds into prediction history."""
        pred_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        query = self._sql(
            """INSERT INTO public.prediction_history (
                id, user_id, country, crop, year, rainfall_mm, avg_temp_c, pesticides_tonnes,
                predicted_yield_hg_per_ha, predicted_yield_tonnes_per_ha,
                conformal_lower_bound, conformal_upper_bound, model_version, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"""
        )
        params = (
            pred_id, user_id, country, crop, year, rainfall_mm, avg_temp_c, pesticides_tonnes,
            predicted_yield_hg_per_ha, predicted_yield_tonnes_per_ha,
            conformal_lower_bound, conformal_upper_bound, model_version, now,
        )

        with self._get_cursor() as cur:
            cur.execute(query, params)

        return {
            "id": pred_id,
            "country": country,
            "crop": crop,
            "year": year,
            "predicted_yield_tonnes_per_ha": predicted_yield_tonnes_per_ha,
            "conformal_interval": [conformal_lower_bound, conformal_upper_bound],
            "created_at": now,
        }

    def get_predictions(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch recent prediction history filtered by user or globally."""
        if user_id:
            query = self._sql("SELECT * FROM public.prediction_history WHERE user_id = %s ORDER BY created_at DESC LIMIT %s;")
            params = (user_id, limit)
        else:
            query = self._sql("SELECT * FROM public.prediction_history ORDER BY created_at DESC LIMIT %s;")
            params = (limit,)

        with self._get_cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def close(self) -> None:
        """Cleanly close connection pools during application shutdown."""
        with self._lock:
            if self._pool is not None and not self._pool.closed:
                self._pool.closeall()
                logger.info("Closed PostgreSQL ThreadedConnectionPool.")


db = Database()
