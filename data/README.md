# Dataset Documentation — FAO Agricultural Environmental Records

## Overview
The platform uses the global crop yield and environmental dataset located at `data/yield_df.csv` (25,932 records).

## Features and Units
1. **Area** (`str`): Country name (101 unique nations represented, including India, Brazil, United States, France, etc.).
2. **Item** (`str`): Crop species (10 primary crops: Maize, Potatoes, Rice, paddy, Sorghum, Soybeans, Wheat, Cassava, Sweet potatoes, Yams, Plantains).
3. **Year** (`int`): Observation year (1990 to 2013).
4. **hg/ha_yield** (`float`): Target crop yield in hectograms per hectare ($10,000\text{ hg/ha} = 1\text{ tonne/ha}$).
5. **average_rain_fall_mm_per_year** (`float`): Annual precipitation in millimeters.
6. **pesticides_tonnes** (`float`): Aggregate pesticide application in metric tonnes.
7. **avg_temp** (`float`): Mean ambient surface temperature in degrees Celsius.

## Preprocessing & Validation
- Loaded and cached in memory by `app.services.prediction_service.prediction_service._load_artifacts()`.
- Reference row statistics and ranges are exposed to the frontend via `GET /api/v1/options` and `GET /api/v1/reference-data`.
