# Database Architecture — InsForge Managed PostgreSQL

## Overview
AgriYield AI uses **InsForge Managed PostgreSQL** (`PostgreSQL 15.18 on aarch64-unknown-linux-gnu`) as its production persistence layer. The database provides strict ACID guarantees, foreign-key relational integrity, and user-isolated prediction history.

## Connection Architecture
- **Connection Engine:** Dual-engine persistence layer implemented in `app/db/database.py`.
- **Driver:** `psycopg2` with `psycopg2.pool.ThreadedConnectionPool` (1–20 connections).
- **Self-Recovery:** Thread-safe lazy recovery (`_ensure_pool()`) ensures the pool re-initializes seamlessly if connections are interrupted or reset during testing.
- **Transaction Safety:** Managed via context manager `_get_cursor()` providing automatic commit on success and rollback upon exception.
- **Local Fallback:** If `DATABASE_URL` is set to `sqlite:///...`, `Database` automatically operates with SQLite in WAL mode with `PRAGMA foreign_keys = ON;`.

## InsForge Project Details
- **Project Name:** `verity`
- **Region:** `us-east`
- **Project ID:** `45dfdddd-6bd8-4ee6-83e0-a0016c0c9c85`
- **AppKey:** `xga5neu3`
- **CLI Commands:**
  - `npx -y @insforge/cli db query "SELECT 1;"`
  - `npx -y @insforge/cli db tables`
  - `npx -y @insforge/cli db migrations list`
  - `npx -y @insforge/cli db migrations up --all`

## Migration Files
- `migrations/20261018072637_init-crop-yield-platform.sql`: Initial PostgreSQL DDL migration applied via `@insforge/cli`.
- `scripts/migrate_sqlite_to_postgres.py`: Data migration script that transferred 61 users and 987 historical predictions from SQLite with exact count verification.

## Synthetic Benchmark Users
During the SQLite migration, 20 synthetic test accounts (`user_0` through `user_19`, email `user_N@benchmark.internal`) were registered with placeholder password hashes (`$argon2id$...$syntheticbenchmarkhash$placeholder`). These exist solely to satisfy foreign-key constraints for historical concurrency benchmark records and cannot be logged into or used to access researcher data.
