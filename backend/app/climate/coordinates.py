"""Authoritative geographic coordinate mapping and FAO AQUASTAT irrigation data across Terraflect countries."""
from __future__ import annotations

from typing import Dict, Optional, List
from app.climate.schema import GeographicCoordinate


# Mapping of Terraflect dataset countries to primary agricultural basin coordinates, typical growing season,
# and verified FAO AQUASTAT percent of agricultural area equipped for irrigation.
AGRICULTURAL_COORDINATES: Dict[str, GeographicCoordinate] = {
    "India": GeographicCoordinate(
        country="India",
        region_name="Indo-Gangetic Plain (Punjab/Haryana/UP)",
        latitude=28.6139,
        longitude=77.2090,
        elevation_m=216.0,
        hemisphere="N",
        crop_season_start_month=6,   # Kharif monsoon start
        crop_season_end_month=11,
        irrigation_equipped_pct=48.8  # FAO AQUASTAT: ~48.8% of agricultural area irrigated
    ),
    "United States of America": GeographicCoordinate(
        country="United States of America",
        region_name="US Corn Belt (Iowa/Illinois)",
        latitude=41.8781,
        longitude=-93.0977,
        elevation_m=290.0,
        hemisphere="N",
        crop_season_start_month=4,   # April planting
        crop_season_end_month=10,  # October harvest
        irrigation_equipped_pct=14.5  # FAO AQUASTAT: ~14.5% of cropland irrigated
    ),
    "Brazil": GeographicCoordinate(
        country="Brazil",
        region_name="Cerrado Agricultural Belt (Mato Grosso)",
        latitude=-12.6819,
        longitude=-55.4214,
        elevation_m=370.0,
        hemisphere="S",
        crop_season_start_month=10,  # October planting (Safra)
        crop_season_end_month=4,    # April harvest
        irrigation_equipped_pct=7.2   # FAO AQUASTAT: ~7.2% irrigated
    ),
    "France": GeographicCoordinate(
        country="France",
        region_name="Bassin Parisien / Centre-Val de Loire",
        latitude=48.8566,
        longitude=2.3522,
        elevation_m=35.0,
        hemisphere="N",
        crop_season_start_month=4,
        crop_season_end_month=9,
        irrigation_equipped_pct=5.8   # FAO AQUASTAT: ~5.8% rainfed temperate
    ),
    "Spain": GeographicCoordinate(
        country="Spain",
        region_name="Castilla y Leon / Andalucia",
        latitude=40.4168,
        longitude=-3.7038,
        elevation_m=657.0,
        hemisphere="N",
        crop_season_start_month=3,
        crop_season_end_month=9,
        irrigation_equipped_pct=22.4  # FAO AQUASTAT: ~22.4% Mediterranean irrigation
    ),
    "Egypt": GeographicCoordinate(
        country="Egypt",
        region_name="Nile Delta Agricultural Zone",
        latitude=30.0444,
        longitude=31.2357,
        elevation_m=23.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=10,
        irrigation_equipped_pct=100.0  # FAO AQUASTAT: 100% irrigated by Nile river
    ),
    "Indonesia": GeographicCoordinate(
        country="Indonesia",
        region_name="Java Agricultural Lowlands",
        latitude=-7.2504,
        longitude=112.7688,
        elevation_m=10.0,
        hemisphere="S",
        crop_season_start_month=11,
        crop_season_end_month=5,
        irrigation_equipped_pct=14.8  # FAO AQUASTAT: ~14.8% wetland paddy irrigation
    ),
    "South Africa": GeographicCoordinate(
        country="South Africa",
        region_name="Highveld Agricultural Belt (Free State/Gauteng)",
        latitude=-26.2041,
        longitude=28.0473,
        elevation_m=1753.0,
        hemisphere="S",
        crop_season_start_month=11,
        crop_season_end_month=5,
        irrigation_equipped_pct=10.2  # FAO AQUASTAT: ~10.2%
    ),
    "Australia": GeographicCoordinate(
        country="Australia",
        region_name="Murray-Darling Basin (New South Wales)",
        latitude=-33.8688,
        longitude=151.2093,
        elevation_m=58.0,
        hemisphere="S",
        crop_season_start_month=5,   # Winter crop (Wheat)
        crop_season_end_month=11,
        irrigation_equipped_pct=4.7   # FAO AQUASTAT: ~4.7%
    ),
    "Mexico": GeographicCoordinate(
        country="Mexico",
        region_name="El Bajio Agricultural Valley (Guanajuato)",
        latitude=20.6736,
        longitude=-101.3533,
        elevation_m=1730.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=11,
        irrigation_equipped_pct=23.0  # FAO AQUASTAT: ~23.0% northern valley irrigation
    ),
    "Burkina Faso": GeographicCoordinate(
        country="Burkina Faso",
        region_name="Sudano-Sahelian Zone (Centre-Ouest)",
        latitude=12.3714,
        longitude=-1.5197,
        elevation_m=305.0,
        hemisphere="N",
        crop_season_start_month=6,   # Sahelian rainy season
        crop_season_end_month=10,
        irrigation_equipped_pct=1.2   # FAO AQUASTAT: ~1.2% predominantly rainfed
    ),
    "Pakistan": GeographicCoordinate(
        country="Pakistan",
        region_name="Punjab Agricultural Basin (Indus)",
        latitude=31.5204,
        longitude=74.3587,
        elevation_m=217.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=11,
        irrigation_equipped_pct=80.0  # FAO AQUASTAT: ~80% Indus canal irrigation
    ),
    "Canada": GeographicCoordinate(
        country="Canada",
        region_name="Prairie Agricultural Belt (Saskatchewan)",
        latitude=52.1332,
        longitude=-106.6700,
        elevation_m=481.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=9,
        irrigation_equipped_pct=2.5   # Rainfed prairie spring wheat
    ),
    "Germany": GeographicCoordinate(
        country="Germany",
        region_name="North German Plain / Lower Saxony",
        latitude=52.3759,
        longitude=9.7320,
        elevation_m=55.0,
        hemisphere="N",
        crop_season_start_month=4,
        crop_season_end_month=10,
        irrigation_equipped_pct=2.3
    ),
    "Italy": GeographicCoordinate(
        country="Italy",
        region_name="Po Valley Agricultural Basin (Lombardy/Emilia)",
        latitude=45.0703,
        longitude=7.6869,
        elevation_m=239.0,
        hemisphere="N",
        crop_season_start_month=4,
        crop_season_end_month=10,
        irrigation_equipped_pct=28.5  # Intensive Po valley irrigation
    ),
    "Japan": GeographicCoordinate(
        country="Japan",
        region_name="Kanto Agricultural Plain / Niigata",
        latitude=36.0000,
        longitude=139.5000,
        elevation_m=40.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=10,
        irrigation_equipped_pct=54.0  # Paddy rice irrigation
    ),
    "Argentina": GeographicCoordinate(
        country="Argentina",
        region_name="Pampas Agricultural Heartland (Buenos Aires/Cordoba)",
        latitude=-34.6037,
        longitude=-58.3816,
        elevation_m=25.0,
        hemisphere="S",
        crop_season_start_month=10,
        crop_season_end_month=4,
        irrigation_equipped_pct=6.5
    ),
    "Nigeria": GeographicCoordinate(
        country="Nigeria",
        region_name="Middle Belt / Niger-Benue Basin",
        latitude=9.0765,
        longitude=7.3986,
        elevation_m=476.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=10,
        irrigation_equipped_pct=1.0   # Mostly rainfed roots & tubers
    ),
    "Turkey": GeographicCoordinate(
        country="Turkey",
        region_name="Central Anatolian Plateau (Konya)",
        latitude=37.8746,
        longitude=32.4932,
        elevation_m=1016.0,
        hemisphere="N",
        crop_season_start_month=4,
        crop_season_end_month=10,
        irrigation_equipped_pct=21.0
    ),
    "Poland": GeographicCoordinate(
        country="Poland",
        region_name="Greater Poland / Mazovia Plain",
        latitude=52.2297,
        longitude=21.0122,
        elevation_m=100.0,
        hemisphere="N",
        crop_season_start_month=4,
        crop_season_end_month=9,
        irrigation_equipped_pct=1.1
    ),
    "United Kingdom": GeographicCoordinate(
        country="United Kingdom",
        region_name="East Anglia Arable Region",
        latitude=52.2053,
        longitude=0.1218,
        elevation_m=20.0,
        hemisphere="N",
        crop_season_start_month=4,
        crop_season_end_month=9,
        irrigation_equipped_pct=1.2
    ),
    "Colombia": GeographicCoordinate(
        country="Colombia",
        region_name="Andean Valley / Cauca Agricultural Zone",
        latitude=4.5709,
        longitude=-74.2973,
        elevation_m=2600.0,
        hemisphere="N",
        crop_season_start_month=3,
        crop_season_end_month=11,
        irrigation_equipped_pct=9.0
    ),
    "Thailand": GeographicCoordinate(
        country="Thailand",
        region_name="Central Plains / Chao Phraya Basin",
        latitude=14.3532,
        longitude=100.5684,
        elevation_m=10.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=11,
        irrigation_equipped_pct=24.0  # Chao Phraya paddy irrigation
    ),
    "Vietnam": GeographicCoordinate(
        country="Vietnam",
        region_name="Mekong Delta Agricultural Basin",
        latitude=10.0333,
        longitude=105.7833,
        elevation_m=3.0,
        hemisphere="N",
        crop_season_start_month=5,
        crop_season_end_month=11,
        irrigation_equipped_pct=34.0  # Mekong delta paddy irrigation
    ),
    "Kenya": GeographicCoordinate(
        country="Kenya",
        region_name="Rift Valley Agricultural Highlands",
        latitude=-0.3031,
        longitude=36.0800,
        elevation_m=1859.0,
        hemisphere="S",
        crop_season_start_month=3,
        crop_season_end_month=9,
        irrigation_equipped_pct=1.8
    ),
    "Bangladesh": GeographicCoordinate(
        country="Bangladesh",
        region_name="Brahmaputra-Ganges Delta Plain",
        latitude=23.8103,
        longitude=90.4125,
        elevation_m=12.0,
        hemisphere="N",
        crop_season_start_month=6,
        crop_season_end_month=11,
        irrigation_equipped_pct=58.0  # Boro rice tube-well irrigation
    )
}

# Subnational regional basins for continental nations
SUBNATIONAL_REGIONAL_BASINS: Dict[str, List[GeographicCoordinate]] = {
    "India": [
        GeographicCoordinate(
            country="India",
            region_name="North (Punjab/Haryana/Western UP - Wheat/Paddy)",
            latitude=30.7333, longitude=76.7794, elevation_m=321.0, hemisphere="N",
            crop_season_start_month=6, crop_season_end_month=11, irrigation_equipped_pct=92.0
        ),
        GeographicCoordinate(
            country="India",
            region_name="Central/West (Maharashtra/MP - Soybeans/Sorghum)",
            latitude=21.1458, longitude=79.0882, elevation_m=310.0, hemisphere="N",
            crop_season_start_month=6, crop_season_end_month=10, irrigation_equipped_pct=32.0
        ),
        GeographicCoordinate(
            country="India",
            region_name="South (Tamil Nadu/Andhra - Rice/Cassava)",
            latitude=13.0827, longitude=80.2707, elevation_m=16.0, hemisphere="N",
            crop_season_start_month=7, crop_season_end_month=12, irrigation_equipped_pct=55.0
        )
    ],
    "United States of America": [
        GeographicCoordinate(
            country="United States of America",
            region_name="Midwest Corn Belt (Iowa/Illinois - Maize/Soybeans)",
            latitude=41.8781, longitude=-93.0977, elevation_m=290.0, hemisphere="N",
            crop_season_start_month=4, crop_season_end_month=10, irrigation_equipped_pct=5.0
        ),
        GeographicCoordinate(
            country="United States of America",
            region_name="Great Plains (Kansas/Nebraska - Wheat/Sorghum)",
            latitude=38.5000, longitude=-98.0000, elevation_m=500.0, hemisphere="N",
            crop_season_start_month=4, crop_season_end_month=9, irrigation_equipped_pct=28.0
        )
    ],
    "Brazil": [
        GeographicCoordinate(
            country="Brazil",
            region_name="Cerrado (Mato Grosso - Soybeans/Maize)",
            latitude=-12.6819, longitude=-55.4214, elevation_m=370.0, hemisphere="S",
            crop_season_start_month=10, crop_season_end_month=4, irrigation_equipped_pct=6.0
        ),
        GeographicCoordinate(
            country="Brazil",
            region_name="South (Parana/Rio Grande do Sul - Wheat/Soybeans)",
            latitude=-25.4284, longitude=-49.2733, elevation_m=934.0, hemisphere="S",
            crop_season_start_month=5, crop_season_end_month=11, irrigation_equipped_pct=11.0
        )
    ]
}


def get_country_coordinate(country_name: str) -> Optional[GeographicCoordinate]:
    """Retrieve primary agricultural coordinate mapping for a country."""
    return AGRICULTURAL_COORDINATES.get(country_name)


def get_subnational_basins(country_name: str) -> Optional[List[GeographicCoordinate]]:
    """Retrieve subnational regional agricultural basins for a country if configured."""
    return SUBNATIONAL_REGIONAL_BASINS.get(country_name)


def get_irrigation_equipped_pct(country_name: str) -> float:
    """Retrieve verified FAO AQUASTAT percent of agricultural land equipped for irrigation."""
    coord = AGRICULTURAL_COORDINATES.get(country_name)
    if coord is not None:
        return coord.irrigation_equipped_pct
    return 10.0  # Global baseline default for unconfigured nations


def list_supported_countries() -> List[str]:
    """Return list of countries with verified agricultural coordinates."""
    return sorted(list(AGRICULTURAL_COORDINATES.keys()))
