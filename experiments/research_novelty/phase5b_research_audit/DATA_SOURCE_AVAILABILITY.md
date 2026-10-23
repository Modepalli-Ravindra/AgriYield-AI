# Terraflect — Data Source Availability and 1990–2026 Extension Audit

**Phase:** Phase 5B Technical & Research Audit  
**Date:** October 19, 2026  
**Status:** Completed Authoritative Data Audit  
**Target Path:** `experiments/research_novelty/phase5b_research_audit/DATA_SOURCE_AVAILABILITY.md`

---

## 1. Executive Summary

A primary objective of the client audit is to determine whether the Terraflect dataset (`data/yield_df_1990_2024.csv`, $N = 19,996$) can be **extended from 1990 through 2026 using verified actual observations**.

### Definitive Finding:
- **Calendar Year 2024:** **Verified Published Actual Data.** Official global crop yield census, pesticide usage, and temperature anomaly statistics are fully verified, ingested, and validated in the current dataset.
- **Calendar Year 2025:** **Unavailable in Harmonized Global Bulk Archives.** National agricultural statistical agencies are currently compiling post-harvest reports; the UN FAOSTAT QCL global bulk normalized release has not yet published calendar year 2025 yields.
- **Calendar Year 2026:** **Strictly Unavailable Globally.** As of October 2026, the 2026 agricultural calendar year is active and unfinalized. Crop harvests are ongoing, and annual national agricultural censuses have not occurred. Any dataset claiming verified 2026 annual crop yields would be fabricated or synthetic.
- **Conclusion:** The dataset **CANNOT be extended through 2026 with verified actual observations**. The latest scientifically verified year remains **2024**.

---

## 2. Authoritative Source Ingestion Status (Year-by-Year)

| Data Domain | Official Source / Agency | Endpoint / Archive URL | Latest Published Actual Year | Publication / Release Lag | Status for 2025 | Status for 2026 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Crop Yield Statistics** | UN FAOSTAT QCL (Crops & Livestock Products) | `https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip` | **2024** | $12\text{--}18\text{ months}$ post-harvest | **Unavailable** (Provisional national collection in progress) | **Unavailable** (Harvest year ongoing) |
| **Agricultural Pesticide Use** | UN FAOSTAT RP (Inputs: Pesticides Use) | `https://bulks-faostat.fao.org/production/Inputs_Pesticides_Use_E_All_Data_(Normalized).zip` | **2024** | $18\text{--}24\text{ months}$ post-year | **Unavailable** | **Unavailable** |
| **Land Temperature Anomalies** | UN FAOSTAT ET (Temperature Change on Land) | `https://bulks-faostat.fao.org/production/Environment_Temperature_change_E_All_Data_(Normalized).zip` | **2025** | $3\text{--}6\text{ months}$ post-year | **Provisional Published** | **Partial / Ongoing** (Monthly only) |
| **National Precipitation Constant** | FAO AQUASTAT / World Bank (AG.LND.PRCP.MM) | `https://data.worldbank.org/indicator/AG.LND.PRCP.MM` | Long-Term Baseline | Climatological Average | **Static Constant** ($\sigma=0$) | **Static Constant** ($\sigma=0$) |

---

## 3. Detailed Source Examination

### 3.1 UN FAOSTAT QCL (Crop Yields)
- **Official Element:** Yield (Code `5419`), reported in $\text{kg/ha}$ (converted to $\text{hg/ha}$ via $\times 10.0$ multiplier).
- **Inspection of Ingested Archive:** 
  The official normalized bulk file `Production_Crops_Livestock_E_All_Data_(Normalized).zip` (33.9 MB compressed, >100 MB uncompressed) was inspected directly. The maximum year value present in the archive across all countries and crops is **2024**.
- **Why 2025/2026 is Unavailable:**
  FAOSTAT compiles production data via annual agricultural census questionnaires distributed to national statistical ministries (e.g., USDA NASS, Eurostat, IBGE Brazil, Ministry of Agriculture India). Because harvest seasons in the Southern Hemisphere and late winter crops cross calendar years, harmonized global validation requires an 18-month aggregation cycle.

### 3.2 UN FAOSTAT RP (Pesticides Use)
- **Official Element:** Agricultural Use (Code `5157`), Item `Pesticides (total)`, unit $\text{tonnes}$.
- **Inspection of Ingested Archive:**
  The archive `Inputs_Pesticides_Use_E_All_Data_(Normalized).zip` contains records through **2024**. Pesticide sales and usage reporting is notoriously delayed; 2025 reporting is not yet compiled for $>80\%$ of member countries.

### 3.3 Land Surface Temperature Anomalies
- **Official Element:** Temperature change (Meteorological year), relative to 1951–1980 climatology.
- **Inspection of Ingested Archive:**
  `Environment_Temperature_change_E_All_Data_(Normalized).zip` contains data through **2025** (preliminary meteorological calculation). For 2026, only partial monthly anomalies exist; full meteorological year anomalies are finalized after December 2026.

### 3.4 Precipitation Data: The Static Climatology Reality
- **Official Element:** `average_rain_fall_mm_per_year`.
- **Finding:** As proven mathematically in Phase 5A, this feature has a within-country standard deviation of **$\sigma = 0.0000\text{ mm}$ for 100% of the 101 countries**.
- **Audit Clarification:** The World Bank indicator `AG.LND.PRCP.MM` represents long-term national average precipitation in depth, intended to reflect baseline agro-climatic zones rather than seasonal weather fluctuations. It must **never be described to the client as measured annual rainfall**.

---

## 4. Scientific Integrity Safeguard

In strict accordance with scientific integrity guidelines:
1. **Zero Fabrication:** We refuse to synthesize artificial 2025 or 2026 yield rows or impute values using autoregressive models without disclosing them as synthetic forecasts.
2. **Preservation of Golden Baseline:** `data/yield_df_1990_2024.csv` remains the verified, immutable dataset.
3. **No Phantom Extension:** Because verified 2025 and 2026 yields do not exist in official published databases, creating a pseudo-extended CSV would compromise the platform's credibility.

---

## 5. Requirements for Future Extension (When Data Becomes Available)

When FAOSTAT publishes the 2025 and 2026 QCL releases (anticipated in late 2026 / mid 2027), the existing ingestion script [update_historical_data_to_2024.py](file:///c:/Users/user/OneDrive/Desktop/Crop_Yield_Prediction/scripts/update_historical_data_to_2024.py) can be seamlessly executed with `target_years = [2025, 2026]` without altering core schemas.
