"""Schemas and validation models for historical climate observation pipelines."""
from __future__ import annotations

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class GeographicCoordinate(BaseModel):
    """Geographic coordinate representing an agricultural region or country centroid."""
    country: str
    region_name: str
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 longitude")
    elevation_m: Optional[float] = None
    hemisphere: str = Field(default="N", pattern="^(N|S)$")
    crop_season_start_month: int = Field(default=4, ge=1, le=12, description="Growing season start month")
    crop_season_end_month: int = Field(default=10, ge=1, le=12, description="Growing season end month")
    irrigation_equipped_pct: float = Field(default=10.0, ge=0.0, le=100.0, description="FAO AQUASTAT % agricultural area equipped for irrigation")


class DailyClimateObservation(BaseModel):
    """Single-day meteorological observation from reanalysis or station data."""
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="ISO 8601 date YYYY-MM-DD")
    t2m_mean_c: float = Field(..., ge=-60.0, le=60.0, description="Daily mean 2m temperature in Celsius")
    t2m_max_c: Optional[float] = Field(None, ge=-60.0, le=65.0, description="Daily max 2m temperature in Celsius")
    t2m_min_c: Optional[float] = Field(None, ge=-70.0, le=55.0, description="Daily min 2m temperature in Celsius")
    precipitation_mm: float = Field(..., ge=0.0, le=1500.0, description="Daily precipitation sum in mm")

    @field_validator("precipitation_mm")
    @classmethod
    def validate_non_negative_rain(cls, v: float) -> float:
        if v < 0.0:
            raise ValueError("Precipitation must be non-negative")
        return round(v, 2)


class AnnualClimateMetrics(BaseModel):
    """Aggregated annual agro-climatic metrics for a specific country and year."""
    country: str
    year: int = Field(..., ge=1950, le=2030)
    latitude: float
    longitude: float
    source: str = "ECMWF ERA5-Land (via Open-Meteo Historical Archive)"
    
    # Measured climate variables replacing static constants
    annual_precip_mm: float = Field(..., ge=0.0, description="Total measured annual precipitation in mm")
    annual_temp_mean_c: float = Field(..., ge=-30.0, le=50.0, description="Annual mean 2m temperature in Celsius")
    growing_season_precip_mm: float = Field(..., ge=0.0, description="Growing season precipitation sum in mm")
    growing_season_temp_c: float = Field(..., ge=-30.0, le=50.0, description="Growing season mean temperature in Celsius")
    heat_stress_days_above_30c: int = Field(..., ge=0, le=366, description="Days with max temperature > 30C")
    dry_spell_max_days: int = Field(..., ge=0, le=366, description="Maximum consecutive days with rain < 1.0mm")
    observation_count_days: int = Field(..., ge=1, le=366, description="Valid daily observations in year")
    irrigation_equipped_pct: float = Field(default=10.0, ge=0.0, le=100.0, description="FAO AQUASTAT % area equipped for irrigation")


class ClimateLinkedRecord(BaseModel):
    """Joined record containing Terraflect agricultural features and genuine climate observations."""
    Area: str
    Item: str
    Year: int
    yield_hg_per_ha: float
    pesticides_tonnes: float
    
    # Original baseline environmental features
    legacy_rainfall_constant_mm: float
    legacy_avg_temp_c: float
    
    # Enhanced measured climate variables
    observed_annual_precip_mm: float
    observed_annual_temp_c: float
    growing_season_precip_mm: float
    growing_season_temp_c: float
    heat_stress_days: int
    irrigation_equipped_pct: float
    climate_source: str
    is_genuine_observation: bool = True
