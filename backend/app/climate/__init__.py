"""Climate observation ingestion and validation package."""
from app.climate.schema import DailyClimateObservation, AnnualClimateMetrics, GeographicCoordinate
from app.climate.coordinates import get_country_coordinate, list_supported_countries
from app.climate.pipeline import ClimateDataPipeline
from app.climate.linker import ClimateDatasetLinker

__all__ = [
    "DailyClimateObservation",
    "AnnualClimateMetrics",
    "GeographicCoordinate",
    "get_country_coordinate",
    "list_supported_countries",
    "ClimateDataPipeline",
    "ClimateDatasetLinker",
]
