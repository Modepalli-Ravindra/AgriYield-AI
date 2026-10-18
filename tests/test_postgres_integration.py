"""Integration and resilience test suite for InsForge PostgreSQL database layer."""
from __future__ import annotations

import os
import uuid
import threading
import concurrent.futures
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.db.database import Database, db
from app.services.prediction_service import prediction_service
from app.schemas.prediction import YieldInput

client = TestClient(app)

def test_postgres_connectivity_and_health():
    """Verify live PostgreSQL connectivity and health check probe."""
    assert db.is_postgres is True
    assert db.check_health() is True
    
    with db._get_cursor() as cur:
        cur.execute("SELECT current_database(), current_user, version();")
        row = cur.fetchone()
        assert row is not None
        assert "PostgreSQL" in row["version"]

def test_postgres_schema_and_tables():
    """Verify required application tables and columns exist in PostgreSQL public schema."""
    with db._get_cursor() as cur:
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_name IN ('app_users', 'prediction_history', 'robustness_benchmark_runs');
        """)
        tables = {row["table_name"] for row in cur.fetchall()}
        assert "app_users" in tables
        assert "prediction_history" in tables
        assert "robustness_benchmark_runs" in tables

def test_postgres_crud_user_lifecycle():
    """Test full CRUD lifecycle for users in PostgreSQL with clean cleanup."""
    test_email = f"test.user.{uuid.uuid4().hex[:8]}@agri-pg.internal"
    test_hash = "$argon2id$v=19$m=65536,t=3,p=4$somefaketestpwhash"
    
    created = db.create_user(
        email=test_email,
        hashed_password=test_hash,
        full_name="Postgres Test User",
        organization="Integration Lab"
    )
    assert created["id"] is not None
    assert created["email"] == test_email.lower()
    
    # Retrieve by email
    fetched_email = db.get_user_by_email(test_email)
    assert fetched_email is not None
    assert fetched_email["id"] == created["id"]
    assert fetched_email["full_name"] == "Postgres Test User"
    
    # Retrieve by ID
    fetched_id = db.get_user_by_id(created["id"])
    assert fetched_id is not None
    assert fetched_id["email"] == test_email.lower()
    
    # Cleanup test row
    with db._get_cursor() as cur:
        cur.execute("DELETE FROM public.app_users WHERE id = %s;", (created["id"],))

def test_postgres_user_isolation():
    """Verify strict user isolation: User A cannot see User B's prediction history."""
    user_a = db.create_user(
        email=f"usera.{uuid.uuid4().hex[:8]}@pg-iso.internal",
        hashed_password="hashA",
        full_name="Researcher A"
    )
    user_b = db.create_user(
        email=f"userb.{uuid.uuid4().hex[:8]}@pg-iso.internal",
        hashed_password="hashB",
        full_name="Researcher B"
    )
    
    try:
        # Save predictions for A and B
        pred_a = db.save_prediction(
            country="India", crop="Wheat", year=2013,
            rainfall_mm=1000.0, avg_temp_c=25.0, pesticides_tonnes=500.0,
            predicted_yield_hg_per_ha=30000.0, predicted_yield_tonnes_per_ha=3.0,
            conformal_lower_bound=1.5, conformal_upper_bound=4.5,
            user_id=user_a["id"]
        )
        pred_b = db.save_prediction(
            country="Brazil", crop="Maize", year=2012,
            rainfall_mm=1400.0, avg_temp_c=27.0, pesticides_tonnes=800.0,
            predicted_yield_hg_per_ha=50000.0, predicted_yield_tonnes_per_ha=5.0,
            conformal_lower_bound=3.0, conformal_upper_bound=7.0,
            user_id=user_b["id"]
        )
        
        # Query A's history
        history_a = db.get_predictions(user_id=user_a["id"])
        ids_a = {p["id"] for p in history_a}
        assert pred_a["id"] in ids_a
        assert pred_b["id"] not in ids_a
        
        # Query B's history
        history_b = db.get_predictions(user_id=user_b["id"])
        ids_b = {p["id"] for p in history_b}
        assert pred_b["id"] in ids_b
        assert pred_a["id"] not in ids_b
    finally:
        with db._get_cursor() as cur:
            cur.execute("DELETE FROM public.app_users WHERE id IN (%s, %s);", (user_a["id"], user_b["id"]))

def test_postgres_transaction_rollback_on_failure():
    """Verify transaction rollback: failed statements within a block do not leave partial state."""
    test_email = f"rollback.{uuid.uuid4().hex[:8]}@pg-roll.internal"
    user_id = str(uuid.uuid4())
    
    with pytest.raises(Exception):
        with db._get_cursor() as cur:
            cur.execute(
                "INSERT INTO public.app_users (id, email, hashed_password, created_at) VALUES (%s, %s, %s, %s);",
                (user_id, test_email, "somehash", datetime.now(timezone.utc).isoformat())
            )
            # Intentionally trigger duplicate primary key / syntax error to cause rollback
            cur.execute("INSERT INTO public.non_existent_table_xyz VALUES (1);")
            
    # Verify user was rolled back
    user = db.get_user_by_id(user_id)
    assert user is None

def test_postgres_database_outage_resilience():
    """Verify ML inference proceeds unaffected when database persistence encounters an outage."""
    import unittest.mock as mock
    import psycopg2
    
    payload = YieldInput(
        country="India",
        crop="Wheat",
        year=2013,
        rainfall_mm=1050.0,
        avg_temp_c=25.5,
        pesticides_tonnes=500.0
    )
    
    # Simulate DB disconnection/outage during save_prediction
    with mock.patch("app.db.database.db.save_prediction", side_effect=psycopg2.OperationalError("server closed the connection unexpectedly")):
        res = prediction_service.predict(payload, user_id="some_test_researcher_id")
        assert res.predicted_yield_tonnes_per_ha > 0.0
        assert res.conformal_interval_90.lower_bound <= res.predicted_yield_tonnes_per_ha <= res.conformal_interval_90.upper_bound
        assert any("Database persistence unavailable" in w for w in res.warnings)

def test_postgres_invalid_configuration_handling():
    """Verify that an invalid database connection string raises a clear error."""
    invalid_url = "postgresql://invalid_user:invalid_pass@127.0.0.1:54329/nonexistent_db?connect_timeout=1"
    with pytest.raises(Exception):
        bad_db = Database(db_url=invalid_url)
        bad_db.check_health()

def test_postgres_concurrency_and_connection_pool():
    """Verify concurrent worker threads safely borrow and return pooled connections."""
    def worker(idx: int):
        # Ping health and query record count concurrently
        is_healthy = db.check_health()
        preds = db.get_predictions(limit=2)
        return is_healthy, len(preds)
        
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(worker, i) for i in range(16)]
        results = [f.result() for f in futures]
        
    assert all(r[0] is True for r in results)
    assert all(r[1] >= 0 for r in results)
