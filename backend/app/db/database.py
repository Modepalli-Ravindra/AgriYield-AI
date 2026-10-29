"""SQLite Database persistence layer for Crop Yield Intelligence Platform."""
from __future__ import annotations

import logging
import os
import sqlite3
import threading
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class Database:
    """SQLite persistence engine with WAL mode, foreign keys, and thread safety."""

    def __init__(self, db_url: Optional[str] = None):
        raw_url = db_url or settings.DATABASE_URL
        self.db_path = self._parse_sqlite_path(raw_url)
        self._lock = threading.Lock()
        self._init_db()

    @staticmethod
    def _parse_sqlite_path(raw_url: str) -> Path:
        """Parse DATABASE_URL into a concrete Path for sqlite3."""
        if raw_url.startswith("sqlite:///"):
            clean = raw_url.replace("sqlite:///", "")
            path = Path(clean)
            if not path.is_absolute():
                path = settings.BASE_DIR / clean
            return path
        elif raw_url.startswith("sqlite://"):
            clean = raw_url.replace("sqlite://", "")
            path = Path(clean)
            if not path.is_absolute():
                path = settings.BASE_DIR / clean
            return path
        # Fallback to default SQLite file
        return settings.BASE_DIR / "crop_yield_platform.db"

    @contextmanager
    def _get_connection(self):
        """Provide a thread-safe connection with foreign keys and WAL pragmas enabled."""
        conn = sqlite3.connect(
            str(self.db_path),
            timeout=30.0,
            check_same_thread=False,
        )
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        try:
            yield conn
        finally:
            conn.close()

    @contextmanager
    def _get_cursor(self):
        """Context manager providing a database cursor with automatic transaction commit/rollback."""
        with self._get_connection() as conn:
            try:
                with conn:
                    cur = conn.cursor()
                    yield cur
            except Exception:
                raise

    def _init_db(self) -> None:
        """Initialize required application tables and concurrency pragmas."""
        try:
            with self._get_connection() as conn:
                conn.execute("PRAGMA journal_mode = WAL;")
                conn.execute("PRAGMA synchronous = NORMAL;")
                conn.execute("PRAGMA foreign_keys = ON;")
                with conn:
                    cur = conn.cursor()
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
                    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_created_at ON prediction_history(created_at DESC);")
                    logger.info("SQLite database verified successfully at %s (WAL mode)", self.db_path)
        except Exception as e:
            logger.error("Error during SQLite database initialization: %s", e)

    def check_health(self) -> bool:
        """Lightweight database connectivity check."""
        try:
            with self._get_cursor() as cur:
                cur.execute("SELECT 1;")
                row = cur.fetchone()
                if row is None:
                    return False
                return row[0] == 1
        except Exception as e:
            logger.error("SQLite database health check ping failed: %s", e)
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

        query = (
            "INSERT INTO app_users (id, email, hashed_password, full_name, organization, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?);"
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
        query = "SELECT * FROM app_users WHERE email = ?;"
        with self._get_cursor() as cur:
            cur.execute(query, (email.lower().strip(),))
            row = cur.fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user record by unique identifier."""
        query = "SELECT id, email, full_name, organization, created_at FROM app_users WHERE id = ?;"
        with self._get_cursor() as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()
            return dict(row) if row else None

    def update_user_password(self, email: str, new_hashed_password: str) -> bool:
        """Update password hash for a registered user."""
        query = "UPDATE app_users SET hashed_password = ? WHERE email = ?;"
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

        # Validate user_id exists in app_users to respect foreign key constraint
        if user_id:
            try:
                with self._get_cursor() as cur:
                    cur.execute("SELECT 1 FROM app_users WHERE id = ?;", (user_id,))
                    if cur.fetchone() is None:
                        user_id = None
            except Exception:
                user_id = None

        query = """INSERT INTO prediction_history (
            id, user_id, country, crop, year, rainfall_mm, avg_temp_c, pesticides_tonnes,
            predicted_yield_hg_per_ha, predicted_yield_tonnes_per_ha,
            conformal_lower_bound, conformal_upper_bound, model_version, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"""
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
        """Fetch recent prediction history. If user_id provided, returns user's predictions; falls back to platform runs so history is never empty."""
        with self._get_cursor() as cur:
            if user_id:
                query = "SELECT * FROM prediction_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?;"
                cur.execute(query, (user_id, limit))
                rows = cur.fetchall()
                if rows:
                    return [dict(r) for r in rows]
                # If specific user has no personal runs yet, fallback to recent platform runs
                query = "SELECT * FROM prediction_history ORDER BY created_at DESC LIMIT ?;"
                cur.execute(query, (limit,))
                return [dict(r) for r in cur.fetchall()]
            else:
                query = "SELECT * FROM prediction_history ORDER BY created_at DESC LIMIT ?;"
                cur.execute(query, (limit,))
                return [dict(r) for r in cur.fetchall()]

    def close(self) -> None:
        """Cleanly handle application shutdown."""
        logger.info("SQLite database connection closed.")


db = Database()
