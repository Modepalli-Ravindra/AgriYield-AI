"""Automated tests for climate pipeline, schema validation, temporal alignment, and leakage prevention."""
from __future__ import annotations

import os
import json
import pytest
import pandas as pd
import numpy as np
from pathlib import Path

from app.climate.schema import DailyClimateObservation, AnnualClimateMetrics, GeographicCoordinate
from app.climate.coordinates import get_country_coordinate, list_supported_countries
from app.climate.pipeline import ClimateDataPipeline, CLIMATE_BASE_DIR
from app.climate.linker import ClimateDatasetLinker


def test_climate_observation_schema_and_physical_bounds():
    """Verify DailyClimateObservation schema validation and physical bounds constraints."""
    # 1. Valid observation
    obs = DailyClimateObservation(
        date="2020-07-15",
        t2m_mean_c=28.5,
        t2m_max_c=34.2,
        t2m_min_c=24.1,
        precipitation_mm=12.4
    )
    assert obs.date == "2020-07-15"
    assert obs.t2m_mean_c == 28.5
    assert obs.precipitation_mm == 12.4

    # 2. Reject negative precipitation
    with pytest.raises(Exception):
        DailyClimateObservation(
            date="2020-07-15",
            t2m_mean_c=25.0,
            precipitation_mm=-5.0
        )

    # 3. Reject non-physical temperatures (> 60C or < -60C)
    with pytest.raises(Exception):
        DailyClimateObservation(
            date="2020-07-15",
            t2m_mean_c=75.0,
            precipitation_mm=10.0
        )


def test_geographic_coordinates_and_crop_seasons():
    """Verify agricultural coordinate repository and crop calendar windows."""
    supported = list_supported_countries()
    assert "India" in supported
    assert "Spain" in supported
    assert "Brazil" in supported
    assert len(supported) >= 10

    coord_india = get_country_coordinate("India")
    assert coord_india is not None
    assert coord_india.hemisphere == "N"
    assert coord_india.crop_season_start_month == 6
    assert coord_india.crop_season_end_month == 11
    assert -90.0 <= coord_india.latitude <= 90.0
    assert -180.0 <= coord_india.longitude <= 180.0

    coord_brazil = get_country_coordinate("Brazil")
    assert coord_brazil is not None
    assert coord_brazil.hemisphere == "S"


def test_temporal_alignment_and_aggregation_logic():
    """Verify daily-to-annual temporal aggregation, growing season window, and heat-stress count."""
    pipeline = ClimateDataPipeline(base_dir=CLIMATE_BASE_DIR)
    coord = get_country_coordinate("Spain")
    assert coord is not None

    # Construct synthetic 365-day observation sequence for deterministic test
    days = []
    for month in range(1, 13):
        for day in [5, 15, 25]:  # 36 sample days spanning all months
            date_str = f"2022-{month:02d}-{day:02d}"
            # Summer days hotter, winter cooler
            temp = 10.0 if month in [1, 2, 12] else (32.0 if month in [6, 7, 8] else 20.0)
            rain = 5.0 if month in [4, 5, 9, 10] else 0.0
            days.append(DailyClimateObservation(
                date=date_str,
                t2m_mean_c=temp,
                t2m_max_c=temp + 3.0,
                t2m_min_c=temp - 3.0,
                precipitation_mm=rain
            ))

    metrics = pipeline.aggregate_annual_metrics(coord, 2022, days)
    assert metrics.country == "Spain"
    assert metrics.year == 2022
    assert metrics.annual_precip_mm == sum(d.precipitation_mm for d in days)
    assert metrics.observation_count_days == len(days)
    # Growing season for Spain is months 3 to 9
    assert metrics.growing_season_precip_mm <= metrics.annual_precip_mm
    # Heat stress days: days with max >= 30C (summer months 6,7,8 have max 35C)
    assert metrics.heat_stress_days_above_30c == 9


def test_leakage_prevention_in_climate_manifest_and_cache():
    """Verify that target yield and future data do not leak into climate observations."""
    manifest_path = CLIMATE_BASE_DIR / "CLIMATE_DATA_MANIFEST.json"
    assert manifest_path.exists(), "Climate manifest must exist"

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # Check variables: no target yield in climate variables
    var_names = [v["name"] for v in manifest["variables"]]
    assert "hg/ha_yield" not in var_names
    assert "yield" not in var_names

    # Check raw climate files: ensure no target yield column or label exists
    raw_files = list((CLIMATE_BASE_DIR / "raw").glob("*.json"))
    assert len(raw_files) > 0
    with open(raw_files[0], "r", encoding="utf-8") as f:
        raw_sample = json.load(f)
    assert "yield" not in raw_sample
    assert "daily" in raw_sample
    assert "_provenance" in raw_sample


def test_climate_dataset_linker_and_fallback():
    """Verify dataset linker, join integrity, and graceful fallback for missing climate records."""
    linker = ClimateDatasetLinker()
    yield_csv = Path(__file__).resolve().parent.parent / "data" / "yield_df_1990_2024.csv"
    assert yield_csv.exists()

    df_linked, manifest = linker.link_with_yield_dataset(yield_csv)
    
    # 1. Total row count matches original dataset exactly
    assert len(df_linked) == 19996
    
    # 2. Check fallback logic on rows without genuine climate observations
    missing_climate = df_linked[~df_linked["has_genuine_climate"]]
    assert len(missing_climate) > 0
    # Effective precip falls back to average_rain_fall_mm_per_year
    assert (missing_climate["effective_precip_mm"] == missing_climate["average_rain_fall_mm_per_year"]).all()
    # Effective temp falls back to avg_temp
    assert (missing_climate["effective_temp_c"] == missing_climate["avg_temp"]).all()

    # 3. Check genuine climate rows
    genuine_climate = df_linked[df_linked["has_genuine_climate"]]
    assert len(genuine_climate) > 0
    assert (genuine_climate["effective_precip_mm"] == genuine_climate["annual_precip_mm"]).all()
    assert not genuine_climate["annual_precip_mm"].isna().any()
    assert (genuine_climate["effective_precip_mm"] >= 0.0).all()

    # 4. Check irrigation feature presence and bounds
    assert "irrigation_equipped_pct" in df_linked.columns
    assert (df_linked["irrigation_equipped_pct"] >= 0.0).all()
    assert (df_linked["irrigation_equipped_pct"] <= 100.0).all()
    # High-irrigation countries (e.g. Egypt > 90%)
    egypt_records = df_linked[df_linked["Area"] == "Egypt"]
    if len(egypt_records) > 0:
        assert (egypt_records["irrigation_equipped_pct"] > 90.0).all()


def test_subnational_basins_and_irrigation_constants():
    """Verify regional agricultural sub-basins for continental countries and irrigation data."""
    from app.climate.coordinates import SUBNATIONAL_REGIONAL_BASINS, get_irrigation_equipped_pct, GeographicCoordinate

    # India, USA, Brazil must have multi-basin definitions
    assert "India" in SUBNATIONAL_REGIONAL_BASINS
    assert "United States of America" in SUBNATIONAL_REGIONAL_BASINS
    assert "Brazil" in SUBNATIONAL_REGIONAL_BASINS

    for country, basins in SUBNATIONAL_REGIONAL_BASINS.items():
        assert len(basins) >= 2, f"Continental nation {country} must define at least 2 agricultural sub-basins"
        for b in basins:
            assert isinstance(b, GeographicCoordinate)
            assert b.country == country
            assert b.region_name is not None and len(b.region_name) > 0
            assert -90.0 <= b.latitude <= 90.0
            assert -180.0 <= b.longitude <= 180.0
            assert 0.0 <= b.irrigation_equipped_pct <= 100.0

    # Test FAO AQUASTAT lookup
    assert get_irrigation_equipped_pct("Egypt") == 100.0
    assert get_irrigation_equipped_pct("India") == 48.8
    assert get_irrigation_equipped_pct("Spain") == 22.4
    assert get_irrigation_equipped_pct("NonExistentCountry") == 10.0  # Global baseline default

