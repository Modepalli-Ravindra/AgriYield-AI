"""Database persistence layer supporting InsForge PostgreSQL and SQLite."""
from __future__ import annotations

import os
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or settings.DATABASE_URL
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Get database connection (SQLite engine with row factory, WAL-safe concurrency, and foreign keys)."""
        if self.db_url.startswith("sqlite:///"):
            path = self.db_url.replace("sqlite:///", "")
        else:
            path = str(settings.BASE_DIR / "crop_yield_platform.db")
            
        conn = sqlite3.connect(path, timeout=30.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_db(self):
        """Initialize required application tables and concurrency pragmas."""
        conn = self._get_connection()
        try:
            with conn:
                # Enable WAL mode and normal synchronous for robust multi-threaded throughput
                conn.execute("PRAGMA journal_mode = WAL;")
                conn.execute("PRAGMA synchronous = NORMAL;")
                conn.execute("""
                CREATE TABLE IF NOT EXISTS app_users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    hashed_password TEXT NOT NULL,
                    full_name TEXT,
                    organization TEXT,
                    created_at TEXT NOT NULL
                );
                """)
                conn.execute("""
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
                conn.execute("""
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
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON app_users(email);")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_history_user ON prediction_history(user_id);")
            logger.info("Database initialized successfully with WAL journal mode.")
        finally:
            conn.close()

    def check_health(self) -> bool:
        """Lightweight database connectivity check."""
        try:
            conn = self._get_connection()
            try:
                cur = conn.cursor()
                cur.execute("SELECT 1;")
                row = cur.fetchone()
                return row is not None and row[0] == 1
            finally:
                conn.close()
        except Exception as e:
            logger.error("Database health check ping failed: %s", e)
            return False

    # --- User operations ---
    def create_user(self, email: str, hashed_password: str, full_name: Optional[str] = None, organization: Optional[str] = None) -> Dict[str, Any]:
        conn = self._get_connection()
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        try:
            with conn:
                conn.execute(
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
        finally:
            conn.close()

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM app_users WHERE email = ?", (email.lower().strip(),))
            row = cur.fetchone()
            if row:
                return dict(row)
            return None
        finally:
            conn.close()

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, email, full_name, organization, created_at FROM app_users WHERE id = ?", (user_id,))
            row = cur.fetchone()
            if row:
                return dict(row)
            return None
        finally:
            conn.close()

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
        conn = self._get_connection()
        pred_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        try:
            with conn:
                conn.execute(
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
        finally:
            conn.close()

    def get_predictions(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        try:
            cur = conn.cursor()
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
        finally:
            conn.close()

db = Database()
