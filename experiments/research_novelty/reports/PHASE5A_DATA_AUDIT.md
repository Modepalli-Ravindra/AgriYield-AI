# Terraflect — Phase 5A: Comprehensive Dataset, Feature Pipeline, and Temporal Continuity Audit

**Date:** October 19, 2026  
**Auditor:** Antigravity AI Research Pair Programmer  
**Dataset Path:** `data/yield_df_1990_2024.csv`  
**Baseline Artifact:** `models/crop_yield_model.pkl` (Log1p XGBoost Champion)  
**Experiment Root:** `experiments/research_novelty/`  
**Status:** **RESEARCH AUDIT COMPLETE — ZERO PRODUCTION CODE MODIFIED**  

---

## 1. Executive Summary & Audit Objectives

Phase 5A initiates a controlled research study to establish evidence-backed methodological improvements for multi-crop yield prediction. Before introducing new algorithmic architectures or conformal inference frameworks, this audit rigorously investigates:
1. Dataset hygiene, row counts, duplicate keys, and missingness in `data/yield_df_1990_2024.csv`.
2. Reproduction of the production champion model baseline (Log1p XGBoost) metrics on the held-out test partition.
3. Feature variability over time, specifically verifying whether climate features vary dynamically or remain static constants.
4. Time-series continuity across individual country–crop series to determine the feasibility of deep sequence models (e.g., Temporal Fusion Transformers).
5. Prediction-time feature availability and potential target leakage in operational agricultural settings.

---

## 2. Dataset Overview and Structural Hygiene

### 2.1 Tabular Schema and Record Counts
- **Total Clean Records:** $19,996$
- **Feature Columns ($7$):**
  1. `Area` (Categorical, String): Country name ($101$ unique countries).
  2. `Item` (Categorical, String): Crop commodity ($10$ unique crops).
  3. `Year` (Integer): Calendar year ($1990\text{--}2024$, spanning $35$ continuous years).
  4. `average_rain_fall_mm_per_year` (Float): Average precipitation.
  5. `pesticides_tonnes` (Float): National annual pesticide consumption.
  6. `avg_temp` (Float): Mean temperature (°C).
  7. `hg/ha_yield` (Target, Integer/Float): Crop yield in hectograms per hectare ($1\text{ tonne/ha} = 10,000\text{ hg/ha}$).
- **Missing Values:** Exactly **0 nulls** across all $7$ columns.
- **Duplicate Records on Composite Key `(Area, Item, Year)`:** Exactly **0 duplicate entries**. Every record represents a unique country–crop–year observation.

### 2.2 Distribution by Crop Family
The $10$ agricultural commodities exhibit severe scale and sample size disparity:
| Crop Commodity | Family / Classification | Record Count | Sample Proportion (%) | Mean Yield (`t/ha`) |
| :--- | :--- | :---: | :---: | :---: |
| **Potatoes** | Tuber / Root | 3,203 | 16.02% | 23.3 t/ha |
| **Maize** | Cereal Grain | 3,094 | 15.47% | 5.1 t/ha |
| **Wheat** | Cereal Grain | 2,755 | 13.78% | 3.9 t/ha |
| **Rice, paddy** | Cereal Grain | 2,269 | 11.35% | 4.5 t/ha |
| **Sorghum** | Cereal Grain | 2,188 | 10.94% | 2.1 t/ha |
| **Soybeans** | Oilseed Legume | 1,917 | 9.59% | 1.9 t/ha |
| **Sweet potatoes** | Tuber / Root | 1,747 | 8.74% | 13.9 t/ha |
| **Cassava** | Tuber / Root | 1,409 | 7.05% | 15.1 t/ha |
| **Plantains and others** | Perennial Fruit / Staple | 713 | 3.57% | 13.2 t/ha |
| **Yams** | Tuber / Root | 701 | 3.51% | 13.7 t/ha |
| **Total** | — | **19,996** | **100.00%** | **9.81 t/ha** |

---

## 3. Baseline Reproduction (Production Log1p XGBoost)

To maintain absolute experimental integrity, the production champion model (`models/crop_yield_model.pkl`) was evaluated on the identical held-out test partition ($2019\text{--}2024$, $N=3,409$):

| Metric Dimension | Phase 4F Reported | Phase 5A Reproduced | Discrepancy | Verification Status |
| :--- | :---: | :---: | :---: | :---: |
| **Global Test $R^2$** | 0.8034 | **0.8034** | $0.0000$ | **EXACT MATCH** |
| **Global Test RMSE** | $4.6357\text{ t/ha}$ | **$4.6357\text{ t/ha}$** | $0.0000\text{ t/ha}$ | **EXACT MATCH** |
| **Global Test MAE** | $2.0821\text{ t/ha}$ | **$2.0821\text{ t/ha}$** | $0.0000\text{ t/ha}$ | **EXACT MATCH** |
| **Macro-Averaged $R^2$** | 0.6082 | **0.6082** | $0.0000$ | **EXACT MATCH** |
| **Potatoes $R^2$** | 0.7623 | **0.7623** | $0.0000$ | **EXACT MATCH** |
| **Wheat $R^2$** | 0.6729 | **0.6729** | $0.0000$ | **EXACT MATCH** |
| **Maize $R^2$** | 0.6533 | **0.6533** | $0.0000$ | **EXACT MATCH** |
| **Cassava $R^2$** | 0.6203 | **0.6203** | $0.0000$ | **EXACT MATCH** |
| **Soybeans $R^2$** | 0.6066 | **0.6066** | $0.0000$ | **EXACT MATCH** |
| **Rice, paddy $R^2$** | 0.5737 | **0.5737** | $0.0000$ | **EXACT MATCH** |
| **Yams $R^2$** | 0.5618 | **0.5618** | $0.0000$ | **EXACT MATCH** |
| **Sorghum $R^2$** | 0.5188 | **0.5188** | $0.0000$ | **EXACT MATCH** |
| **Sweet potatoes $R^2$** | 0.3593 | **0.3593** | $0.0000$ | **EXACT MATCH** |
| **Plantains $R^2$** | 0.7533 | **0.7533** | $0.0000$ | **EXACT MATCH** |

The baseline is verified down to the fourth decimal place.

---

## 4. Critical Environmental Feature Audit: Temporal Variation

A critical requirement of the Phase 5A audit was establishing whether climate features genuinely vary dynamically across time.

### 4.1 The Static Rainfall Finding
Analysis of `average_rain_fall_mm_per_year` across all 35 calendar years revealed:
- **Within-Country Standard Deviation:** $\sigma_{\text{rain}} = \mathbf{0.0000\text{ mm}}$ for **$101$ out of $101$ countries ($100.0\%$)**.
- **Agronomic Meaning:** In this benchmark dataset, `average_rain_fall_mm_per_year` is **NOT an annual weather observation**. It represents a static, long-term climatological country average originally tabulated by the FAO/World Bank.
- **Scientific Implication:** 
  1. The feature behaves mathematically as a **static country-level geographic descriptor** (analogous to latitude, elevation, or a continuous country embedding).
  2. The model cannot learn drought or extreme precipitation shocks from this column.
  3. **It is scientifically impermissible to treat static rainfall as a time-varying sequence input for recurrent or attention-based deep learning architectures.**

### 4.2 Dynamic Features
In contrast, two inputs exhibit genuine temporal dynamics:
1. `avg_temp` (Annual Mean Temperature):
   - Mean within-country standard deviation across years: $\sigma_{\text{temp}} = 0.5563^\circ\text{C}$ ($\min = 0.2542^\circ\text{C}$, $\max = 0.9639^\circ\text{C}$).
   - Reflects national annual warming trends and regional heat anomalies from Berkeley Earth observations.
2. `pesticides_tonnes` (National Chemical Pesticide Consumption):
   - Mean within-country standard deviation across years: $\sigma_{\text{pest}} = 8,269.7\text{ tonnes}$.
   - Reflects historical agricultural modernization, expansion of chemical inputs, and environmental regulatory phase-outs.

---

## 5. Time-Series Continuity and Deep Sequence Feasibility

To evaluate whether temporal deep learning architectures—specifically the **Temporal Fusion Transformer (TFT)** (Lim et al., 2021)—are methodologically defensible on this dataset, we audited the continuity of individual country–crop series `(Area, Item)`:

### 5.1 Series Length and Continuity Breakdown
- **Total Unique Time Series `(Area, Item)`:** $611$ distinct series.
- **Series Length:**
  - Minimum length: $1\text{ year}$
  - Median length: $35.0\text{ years}$ (full 1990–2024 period)
  - Mean length: $32.7\text{ years}$
  - Maximum length: $35.0\text{ years}$
- **Sequence Continuity:**
  - **Strictly Continuous (zero missing calendar years):** **$595$ series ($97.4\%$)**.
  - **Series with Gaps (missing intermediate years):** **$16$ series ($2.6\%$)**.
  - **Mean Maximum Consecutive Streak:** $32.6\text{ consecutive years}$.

### 5.2 Deep Learning Feasibility Verdict: Why Complex TFT is Unsuitable
While $97.4\%$ of series are continuous, deploying a Temporal Fusion Transformer (TFT) on this specific dataset has severe architectural limitations:

1. **Lack of Dynamic Intra-Annual Features:** TFT is designed to leverage high-frequency past time-varying covariates (e.g., daily precipitation, weekly NDVI vegetation indices, soil moisture, growing degree days). Here, we have only **one annual scalar observation per feature per year**.
2. **Static Climate Inputs:** As proven in Section 4.1, rainfall has **zero temporal variation**. Feeding a static scalar into temporal self-attention heads forces the attention mechanism to attend over duplicate static numbers, creating spurious correlations.
3. **Severe Data Paucity for Deep Attention:** With only $35$ annual time-steps per entity, the temporal receptive field is tiny ($T \le 35$). Modern deep transformers have millions of parameters; training them on 35-step annual sequences leads to immediate overfitting on historical trends rather than learning physical plant physiology.
4. **Conclusion:** **TFT is methodologically unsuitable for this dataset in its current annual form.** To legitimately benchmark TFT, the repository would require multi-temporal remote sensing data (e.g., monthly ERA5 reanalysis weather grids and MODIS/Sentinel NDVI time series).

---

## 6. Prediction-Time Feature Availability & Leakage Review

An operational machine learning system must only ingest inputs genuinely available at inference time.

### 6.1 Prediction Scenarios
In operational agriculture, crop yield predictions are requested at three distinct phases:
1. **Pre-Season / Planting Time (T-6 months):** Full-year observed weather is unavailable. Forecasts must rely on seasonal climate forecasts or historical country normals.
2. **Mid-Season / Reproductive Stage (T-3 months):** Partial-season weather is observed, but final harvest inputs remain uncertain.
3. **End-of-Season / Retrospective Aggregation (T-0 months):** Full calendar-year average temperature and total national pesticide use are known.

### 6.2 Data Leakage Audit
- The current dataset `yield_df_1990_2024.csv` operates at the **End-of-Season retrospective aggregation level**.
- For forward pre-season forecasting, using end-of-year `avg_temp` and total `pesticides_tonnes` would represent partial lookahead leakage if deployed in real-time before the calendar year concludes.
- For our research benchmark (Phase 5A), we evaluate models strictly within the defined annual retrospective paradigm while ensuring strict chronological train/test separation ($\max(\text{Year}_{\text{train}}) = 2018 < \min(\text{Year}_{\text{test}}) = 2019$).
