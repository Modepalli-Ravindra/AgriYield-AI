# Terraflect — Comprehensive Data Quality and Meteorological Integrity Report

**Phase:** Phase 5B Technical & Research Audit  
**Date:** October 19, 2026  
**Status:** Completed Dataset Quality Audit  
**Target Path:** `experiments/research_novelty/phase5b_research_audit/DATA_QUALITY_REPORT.md`

---

## 1. Executive Summary

This report delivers a thorough data quality audit of the active Terraflect dataset:
- **File:** `data/yield_df_1990_2024.csv`
- **SHA-256:** `c89d272f569e6ec0f98114f941c78e5d015540b6ad19956886c8c30a56e4748a`
- **Total Rows:** $19,996$ observations
- **Temporal Span:** $1990 - 2024$ ($35$ continuous calendar years)
- **Entities:** $101$ countries, $10$ crop commodities

---

## 2. Dataset Hygiene & Integrity Verification

| Quality Dimension | Measured Value | Standard / Requirement | Status | Audit Findings |
| :--- | :---: | :---: | :---: | :--- |
| **Row Count** | $19,996$ | $\ge 19,000$ | **PASSED** | Clean ingestion across all 35 years |
| **Duplicate Keys** | **$0$** | **$0$** | **PASSED** | Perfect uniqueness of `(Area, Item, Year)` primary keys |
| **Missing / Null Values** | **$0$** across all columns | **$0$** | **PASSED** | Complete feature matrix |
| **Negative Yields** | **$0$** | **$0$** | **PASSED** | Min yield $= 50.0\text{ hg/ha}$ ($0.005\text{ t/ha}$) |
| **Negative Pesticides** | **$0$** | **$0$** | **PASSED** | Min pesticide $= 0.04\text{ tonnes}$ |
| **Yield Extreme Outliers** | Max $= 103.2\text{ t/ha}$ (Potatoes) | Agronomically feasible | **PASSED** | High-efficiency commercial potato yields |
| **Continuous Series Span** | $464$ of $639$ series ($72.6\%$) | $> 50\%$ | **PASSED** | $464$ country-crop combinations have all 35 uninterrupted years |

---

## 3. Weather Feature Integrity & Scientific Analysis

### 3.1 The Rainfall Feature (`average_rain_fall_mm_per_year`)
- **Measured Variance:** Within-country standard deviation is **$\sigma_{\text{rain}} = 0.0000\text{ mm}$ for 100% of the 101 countries**.
- **Distribution:**
  - Minimum: $51.0\text{ mm}$ (Egypt / arid zones)
  - Mean: $1,156.4\text{ mm}$
  - Maximum: $3,240.0\text{ mm}$ (Colombia / tropical rainforest zones)
- **Scientific Implication:**
  This feature does **NOT reflect annual rainfall or drought events**. It represents a fixed national climatological constant. 
  - *What it CAN do:* Informs the machine learning model of the geographic climatic zone (e.g., distinguishing arid Egypt from tropical Colombia).
  - *What it CANNOT do:* It cannot capture seasonal drought anomalies, monsoon failures, or localized flooding events.

### 3.2 The Temperature Feature (`avg_temp`)
- **Measured Variance:** Within-country standard deviation is **$\sigma_{\text{temp}} = 0.5562^\circ\text{C}$**.
- **Temporal Distribution:**
  - Pre-2019 Baseline Mean: $20.01^\circ\text{C}$
  - 2019–2024 Test Period Mean: $20.42^\circ\text{C}$
  - **Mean Warming Drift:** **$+0.4124^\circ\text{C}$**
- **Scientific Implication:**
  Temperature captures real, dynamic annual climate warming. In the 2019–2024 test period, warming anomalies triggered widespread shift detection in SACAP, providing a realistic test of model robustness under climate drift.

---

## 4. What Additional Weather Data Would Enable vs. Current Limitations

| Capability | Current Dataset Capability | What Gridded / Sub-Annual Data (ERA5) Would Enable |
| :--- | :--- | :--- |
| **Drought Impact Analysis** | **Impossible** (Rainfall is static) | **Enabled:** Ingesting monthly precipitation would allow computing the Standardized Precipitation Evapotranspiration Index (SPEI) and identifying drought-induced crop loss. |
| **Heat-Stress at Flowering** | **Impossible** (Only annual mean temperature) | **Enabled:** Daily maximum temperatures allow calculating Extreme Degree Days (EDD) during critical reproductive phenology stages. |
| **Subnational Field Precision** | **Impossible** (Country-level aggregates) | **Enabled:** High-resolution satellite vegetation indices (NDVI/EVI from Sentinel-2) enable field-level yield forecasts. |
| **Temporal Deep Learning (TFT)** | **Unsuitable** (35 annual steps overfits static IDs) | **Enabled:** Multi-horizon self-attention thrives on weekly or 10-day time series. |

---

## 5. Summary Recommendation for Stakeholders

The current dataset is clean, leakage-safe, and well-curated for macro-level tabular gradient boosting. However, stakeholders must be given an accurate technical appraisal: **it is a macro-economic and annual agro-climatic dataset, not a field-level precision agriculture dataset**. Maintaining transparency on this distinction preserves Terraflect's scientific authority.
