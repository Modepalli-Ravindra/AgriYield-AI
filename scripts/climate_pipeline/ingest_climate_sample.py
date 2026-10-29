"""Ingest authentic historical climate observations for representative agricultural countries."""
from __future__ import annotations

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
import hashlib

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))
sys.path.insert(0, str(BASE_DIR))

from app.climate.pipeline import ClimateDataPipeline, CLIMATE_BASE_DIR
from app.climate.coordinates import AGRICULTURAL_COORDINATES
from app.climate.linker import ClimateDatasetLinker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def compute_sha256(file_path: Path) -> str:
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def run_climate_ingestion():
    pipeline = ClimateDataPipeline(base_dir=CLIMATE_BASE_DIR)
    
    from app.climate.coordinates import list_supported_countries
    target_countries = list_supported_countries()
    
    # Target continuous years covering baseline, validation, and untouched chronological test sets (2010 to 2024)
    target_years = list(range(2010, 2025))
    
    logger.info("Starting genuine climate observation ingestion for %d countries across years %d-%d...",
                len(target_countries), target_years[0], target_years[-1])

    ingested_metrics_count = 0
    country_stats = {}

    for country in target_countries:
        logger.info("Processing genuine climate series for: %s", country)
        metrics = pipeline.process_country_series(country, target_years)
        ingested_metrics_count += len(metrics)
        country_stats[country] = {
            "years_ingested": len(metrics),
            "mean_annual_precip_mm": round(float(sum(m.annual_precip_mm for m in metrics) / len(metrics)), 1),
            "mean_annual_temp_c": round(float(sum(m.annual_temp_mean_c for m in metrics) / len(metrics)), 2),
            "mean_heat_days": round(float(sum(m.heat_stress_days_above_30c for m in metrics) / len(metrics)), 1)
        }

    logger.info("Total annual climate metrics ingested and validated: %d", ingested_metrics_count)

    # Execute dataset linking
    linker = ClimateDatasetLinker()
    yield_csv = BASE_DIR / "data" / "yield_df_1990_2024.csv"
    merged_df, link_manifest = linker.link_with_yield_dataset(yield_csv)

    logger.info("Climate linkage complete: %d rows (%d with genuine climate observations, %.1f%% coverage)",
                len(merged_df), link_manifest["genuine_climate_records"], link_manifest["coverage_percentage"])

    # Generate comprehensive Climate Manifest
    manifest_data = {
        "manifest_version": "1.0.0",
        "dataset_name": "Terraflect Genuine Climate Observations (ECMWF ERA5-Land)",
        "source": pipeline.SOURCE_NAME,
        "license": pipeline.SOURCE_LICENSE,
        "generation_timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "geographic_units": "Agricultural basin centroids with documented crop calendar windows",
        "variables": [
            {"name": "annual_precip_mm", "unit": "mm/year", "description": "Actual measured annual precipitation sum"},
            {"name": "annual_temp_mean_c", "unit": "deg C", "description": "Measured annual mean 2m air temperature"},
            {"name": "growing_season_precip_mm", "unit": "mm", "description": "Rainfall during crop calendar window"},
            {"name": "growing_season_temp_c", "unit": "deg C", "description": "Mean temperature during crop calendar window"},
            {"name": "heat_stress_days_above_30c", "unit": "days", "description": "Days exceeding 30 deg C threshold"},
            {"name": "dry_spell_max_days", "unit": "days", "description": "Maximum consecutive days with rain < 1mm"}
        ],
        "countries_ingested": country_stats,
        "linkage_summary": link_manifest
    }

    manifest_path = CLIMATE_BASE_DIR / "CLIMATE_DATA_MANIFEST.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    logger.info("Climate manifest written to %s", manifest_path)
    return manifest_data


if __name__ == "__main__":
    run_climate_ingestion()
