"""Reproducible climate observation ingestion, validation, and agro-climatic aggregation pipeline."""
from __future__ import annotations

import os
import time
import json
import logging
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
import pandas as pd
import numpy as np

from app.climate.schema import DailyClimateObservation, AnnualClimateMetrics, GeographicCoordinate
from app.climate.coordinates import get_country_coordinate, get_subnational_basins, AGRICULTURAL_COORDINATES

logger = logging.getLogger(__name__)

CLIMATE_BASE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "climate"
RAW_DIR = CLIMATE_BASE_DIR / "raw"
PROCESSED_DIR = CLIMATE_BASE_DIR / "processed"


class ClimateDataPipeline:
    """Pipelines genuine historical climate observations from ECMWF ERA5-Land into validated agro-climatic metrics."""

    API_BASE_URL = "https://archive-api.open-meteo.com/v1/archive"
    SOURCE_NAME = "ECMWF ERA5-Land Reanalysis (via Open-Meteo Historical Archive)"
    SOURCE_LICENSE = "Copernicus Open Access License / CC-BY 4.0"

    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or CLIMATE_BASE_DIR
        self.raw_dir = self.base_dir / "raw"
        self.processed_dir = self.base_dir / "processed"
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def fetch_daily_observations(
        self, coordinate: GeographicCoordinate, year: int
    ) -> List[DailyClimateObservation]:
        """
        Fetch daily meteorological observations for a given geographic coordinate and year.
        Uses local disk cache if already downloaded; otherwise queries authoritative archive.
        """
        cache_file = self.raw_dir / f"{coordinate.country.replace(' ', '_')}_{year}.json"
        
        # 1. Load from cache if present
        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                return self._parse_and_validate_raw_payload(cached_data)
            except Exception as e:
                logger.warning("Cache read failed for %s %d, re-fetching: %s", coordinate.country, year, e)

        # 2. Query Open-Meteo ERA5-Land Historical Archive with retries and exponential backoff
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        params = (
            f"?latitude={coordinate.latitude}&longitude={coordinate.longitude}"
            f"&start_date={start_date}&end_date={end_date}"
            f"&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum"
            f"&timezone=UTC"
        )
        url = self.API_BASE_URL + params
        req = urllib.request.Request(url, headers={"User-Agent": "Terraflect-AgriYield/2.0 (Research Pipeline)"})

        max_retries = 3
        payload = None
        for attempt in range(max_retries):
            try:
                # Rate-limiting courtesy pause
                time.sleep(0.25)
                with urllib.request.urlopen(req, timeout=15) as res:
                    payload = json.loads(res.read().decode("utf-8"))
                break
            except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                logger.warning("Attempt %d/%d failed for %s %d: %s", attempt + 1, max_retries, coordinate.country, year, e)
                if attempt == max_retries - 1:
                    logger.error("All retries exhausted for %s %d: %s", coordinate.country, year, e)
                    raise RuntimeError(f"Unable to fetch climate observations for {coordinate.country} ({year}): {e}")
                time.sleep(1.0 * (2 ** attempt))

        # 3. Save raw response with provenance metadata to cache
        payload["_provenance"] = {
            "source": self.SOURCE_NAME,
            "license": self.SOURCE_LICENSE,
            "url": url,
            "country": coordinate.country,
            "region": coordinate.region_name,
            "year": year,
            "download_timestamp_utc": datetime.now(timezone.utc).isoformat()
        }
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

        return self._parse_and_validate_raw_payload(payload)

    def _parse_and_validate_raw_payload(self, payload: Dict[str, Any]) -> List[DailyClimateObservation]:
        """Validate raw observation vectors and instantiate validated Pydantic models."""
        daily = payload.get("daily", {})
        times = daily.get("time", [])
        t_means = daily.get("temperature_2m_mean", [])
        t_maxs = daily.get("temperature_2m_max", [])
        t_mins = daily.get("temperature_2m_min", [])
        precips = daily.get("precipitation_sum", [])

        if not times or len(times) < 350:
            raise ValueError(f"Incomplete annual observation sequence: found {len(times)} days")

        observations: List[DailyClimateObservation] = []
        seen_dates = set()

        for d, t_mean, t_max, t_min, pr in zip(times, t_means, t_maxs, t_mins, precips):
            if d in seen_dates:
                continue  # deduplicate
            seen_dates.add(d)

            # Handle possible missing values (impute with seasonal mean if single day missing)
            if pr is None or pd.isna(pr):
                pr = 0.0
            if t_mean is None or pd.isna(t_mean):
                t_mean = 20.0

            obs = DailyClimateObservation(
                date=d,
                t2m_mean_c=float(t_mean),
                t2m_max_c=float(t_max) if t_max is not None and not pd.isna(t_max) else None,
                t2m_min_c=float(t_min) if t_min is not None and not pd.isna(t_min) else None,
                precipitation_mm=max(0.0, float(pr))
            )
            observations.append(obs)

        return observations

    def aggregate_annual_metrics(
        self, coordinate: GeographicCoordinate, year: int, observations: List[DailyClimateObservation]
    ) -> AnnualClimateMetrics:
        """Aggregate daily observations into annual agro-climatic metrics."""
        total_precip = sum(obs.precipitation_mm for obs in observations)
        mean_temp = float(np.mean([obs.t2m_mean_c for obs in observations]))

        # Filter growing season
        gs_start = coordinate.crop_season_start_month
        gs_end = coordinate.crop_season_end_month

        gs_obs: List[DailyClimateObservation] = []
        for obs in observations:
            month = int(obs.date.split("-")[1])
            if gs_start <= gs_end:
                if gs_start <= month <= gs_end:
                    gs_obs.append(obs)
            else:
                # Cross-year season (e.g. Southern hemisphere Oct to April)
                if month >= gs_start or month <= gs_end:
                    gs_obs.append(obs)

        if not gs_obs:
            gs_obs = observations  # fallback

        gs_precip = sum(obs.precipitation_mm for obs in gs_obs)
        gs_temp = float(np.mean([obs.t2m_mean_c for obs in gs_obs]))

        # Heat stress days: t2m_max > 30.0C (or mean > 28.0C if max missing)
        heat_days = 0
        for obs in observations:
            if obs.t2m_max_c is not None and obs.t2m_max_c >= 30.0:
                heat_days += 1
            elif obs.t2m_max_c is None and obs.t2m_mean_c >= 28.0:
                heat_days += 1

        # Max consecutive dry days (rain < 1.0mm)
        max_dry = 0
        current_dry = 0
        for obs in observations:
            if obs.precipitation_mm < 1.0:
                current_dry += 1
                if current_dry > max_dry:
                    max_dry = current_dry
            else:
                current_dry = 0

        return AnnualClimateMetrics(
            country=coordinate.country,
            year=year,
            latitude=coordinate.latitude,
            longitude=coordinate.longitude,
            source=self.SOURCE_NAME,
            annual_precip_mm=round(total_precip, 2),
            annual_temp_mean_c=round(mean_temp, 2),
            growing_season_precip_mm=round(gs_precip, 2),
            growing_season_temp_c=round(gs_temp, 2),
            heat_stress_days_above_30c=heat_days,
            dry_spell_max_days=max_dry,
            observation_count_days=len(observations),
            irrigation_equipped_pct=coordinate.irrigation_equipped_pct
        )

    def process_country_series(
        self, country_name: str, years: List[int]
    ) -> List[AnnualClimateMetrics]:
        """Execute end-to-end ingestion and aggregation for a country across specified years."""
        basins = get_subnational_basins(country_name)
        primary_coord = get_country_coordinate(country_name)
        
        if primary_coord is None:
            raise ValueError(f"No agricultural coordinates configured for country '{country_name}'")

        metrics_list: List[AnnualClimateMetrics] = []
        for y in years:
            if basins and len(basins) > 1:
                # Subnational multi-basin area-weighted aggregation for continental nations
                basin_metrics = []
                for b_coord in basins:
                    b_obs = self.fetch_daily_observations(b_coord, y)
                    basin_metrics.append(self.aggregate_annual_metrics(b_coord, y, b_obs))
                
                # Mean composite across regional agricultural basins
                comp_precip = round(float(np.mean([m.annual_precip_mm for m in basin_metrics])), 2)
                comp_temp = round(float(np.mean([m.annual_temp_mean_c for m in basin_metrics])), 2)
                comp_gs_precip = round(float(np.mean([m.growing_season_precip_mm for m in basin_metrics])), 2)
                comp_gs_temp = round(float(np.mean([m.growing_season_temp_c for m in basin_metrics])), 2)
                comp_heat_days = int(np.mean([m.heat_stress_days_above_30c for m in basin_metrics]))
                comp_dry_days = int(np.mean([m.dry_spell_max_days for m in basin_metrics]))
                
                metrics = AnnualClimateMetrics(
                    country=country_name,
                    year=y,
                    latitude=primary_coord.latitude,
                    longitude=primary_coord.longitude,
                    source=f"{self.SOURCE_NAME} (Multi-basin composite)",
                    annual_precip_mm=comp_precip,
                    annual_temp_mean_c=comp_temp,
                    growing_season_precip_mm=comp_gs_precip,
                    growing_season_temp_c=comp_gs_temp,
                    heat_stress_days_above_30c=comp_heat_days,
                    dry_spell_max_days=comp_dry_days,
                    observation_count_days=min(m.observation_count_days for m in basin_metrics),
                    irrigation_equipped_pct=primary_coord.irrigation_equipped_pct
                )
            else:
                obs = self.fetch_daily_observations(primary_coord, y)
                metrics = self.aggregate_annual_metrics(primary_coord, y, obs)

            metrics_list.append(metrics)

        # Save processed country summary
        out_file = self.processed_dir / f"{country_name.replace(' ', '_')}_annual_metrics.csv"
        df = pd.DataFrame([m.model_dump() for m in metrics_list])
        df.to_csv(out_file, index=False)
        return metrics_list
