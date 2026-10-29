"""Integration test suite for SQLite persistence layer."""
from __future__ import annotations

import os
import sys
import uuid
import threading
import concurrent.futures
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.db.database import Database, db
from app.schemas.prediction import YieldInput

client = TestClient(app)


def test_sqlite_connectivity_and_health():
    """Verify live SQLite connectivity and health check probe."""
    assert db.check_health() is True
    with db._get_cursor() as cur:
        cur.execute("SELECT sqlite_version();")
        row = cur.fetchone()
        assert row is not None
        assert len(row[0]) > 0


def test_sqlite_schema_and_tables():
    """Verify required application tables exist in SQLite."""
    with db._get_cursor() as cur:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = {row[0] for row in cur.fetchall()}
        required = {"app_users", "prediction_history", "robustness_benchmark_runs"}
        assert required.issubset(tables), f"Missing tables: {required - tables}"


def test_sqlite_user_lifecycle():
    """Verify user creation, retrieval, and password update."""
    test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    hashed_pw = "$argon2id$v=19$m=65536,t=3,p=4$fakehash$fakesalt"

    # Create user
    user = db.create_user(
        email=test_email,
        hashed_password=hashed_pw,
        full_name="Dr. Test Researcher",
        organization="Agricultural Research Lab",
    )
    assert user["id"] is not None
    assert user["email"] == test_email.lower()

    # Retrieve by email
    fetched = db.get_user_by_email(test_email)
    assert fetched is not None
    assert fetched["id"] == user["id"]
    assert fetched["full_name"] == "Dr. Test Researcher"

    # Retrieve by ID
    fetched_id = db.get_user_by_id(user["id"])
    assert fetched_id is not None
    assert fetched_id["email"] == test_email.lower()

    # Update password
    new_pw = "$argon2id$v=19$m=65536,t=3,p=4$updatedhash$fakesalt"
    assert db.update_user_password(test_email, new_pw) is True
    updated = db.get_user_by_email(test_email)
    assert updated["hashed_password"] == new_pw


def test_sqlite_prediction_history():
    """Verify prediction recording and retrieval with foreign key relation."""
    # Create test user
    test_email = f"pred_user_{uuid.uuid4().hex[:8]}@example.com"
    user = db.create_user(email=test_email, hashed_password="pw_hash")

    # Save prediction
    pred = db.save_prediction(
        country="India",
        crop="Potatoes",
        year=2024,
        rainfall_mm=1200.0,
        avg_temp_c=25.0,
        pesticides_tonnes=50000.0,
        predicted_yield_hg_per_ha=190264.8,
        predicted_yield_tonnes_per_ha=19.0265,
        conformal_lower_bound=6.8079,
        conformal_upper_bound=31.2451,
        model_version="Test-SQLite-v1",
        user_id=user["id"],
    )
    assert pred["id"] is not None
    assert pred["predicted_yield_tonnes_per_ha"] == 19.0265

    # Retrieve user predictions
    user_preds = db.get_predictions(user_id=user["id"], limit=10)
    assert len(user_preds) >= 1
    assert user_preds[0]["id"] == pred["id"]
    assert user_preds[0]["country"] == "India"


def test_sqlite_concurrency():
    """Verify concurrent reads and writes in WAL mode without lock contention."""
    num_threads = 8
    success_count = 0
    lock = threading.Lock()

    def worker(i: int):
        nonlocal success_count
        test_email = f"worker_{uuid.uuid4().hex[:8]}@concurrent.internal"
        u = db.create_user(email=test_email, hashed_password=f"hash_{i}")
        p = db.save_prediction(
            country="United States",
            crop="Maize",
            year=2023,
            rainfall_mm=850.0,
            avg_temp_c=18.5,
            pesticides_tonnes=10000.0,
            predicted_yield_hg_per_ha=76754.0,
            predicted_yield_tonnes_per_ha=7.6754,
            conformal_lower_bound=4.5123,
            conformal_upper_bound=10.8385,
            model_version="Concurrent-Test-v1",
            user_id=u["id"],
        )
        preds = db.get_predictions(user_id=u["id"], limit=5)
        if len(preds) > 0 and preds[0]["id"] == p["id"]:
            with lock:
                success_count += 1

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(worker, i) for i in range(num_threads)]
        concurrent.futures.wait(futures)

    assert success_count == num_threads, f"Expected {num_threads} successes, got {success_count}"


if __name__ == "__main__":
    test_sqlite_connectivity_and_health()
    print("[PASS] SQLite connectivity & health check passed")
    test_sqlite_schema_and_tables()
    print("[PASS] SQLite schema & tables passed")
    test_sqlite_user_lifecycle()
    print("[PASS] SQLite user lifecycle passed")
    test_sqlite_prediction_history()
    print("[PASS] SQLite prediction history passed")
    test_sqlite_concurrency()
    print("[PASS] SQLite multi-threaded concurrency passed")
    print("\nALL SQLITE TESTS PASSED SUCCESSFULLY!")
