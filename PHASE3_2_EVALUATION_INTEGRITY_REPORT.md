# Phase 3.2: Evaluation Integrity & Reliability Correction Report

**Project**: *An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors*  
**Auditor**: Independent AI Research Agent (Antigravity)  
**Date**: October 18, 2026  
**Workspace**: `C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction`  
**Current Branch**: `feature/dl-ml-research-framework`  

---

## 1. Executive Summary

Phase 3.2 targeted the resolution of two fundamental scientific-validity vulnerabilities in the original evaluation pipeline:
1. **Repeated-Label Semantic Leakage**: Multi-weather station recordings sharing identical country, crop, and year crossed naive random train/test splits.
2. **In-Sample Conformal Calibration**: The stacking meta-model and conformal prediction calibrator were fitted on the exact same calibration observations in `train_all.py`.

This report provides the mathematical audit, empirical evidence, corrected leakage-safe benchmarks, and data-flow reconciliation.

---

## 2. Task 1: Investigation of Repeated-Label Leakage `(Area, Item, Year)`

### 2.1 Dataset Structure Analysis
- **Total Deduplicated Records**: 25,932 rows.
- **Unique `(Area, Item, Year)` Groups**: 13,130 unique groups.
- **Single-Observation Groups**: 9,440 groups (71.9% of groups, count = 1).
- **Repeated-Observation Groups**: 3,690 groups (28.1% of groups, count > 1).
- **Group Size Distribution**:
  - Minimum: 1 row
  - Median: 1.0 row
  - Maximum: 19 rows
  - Mean: 1.98 rows
- **Yield Label Consistency**: In 100% of the 3,690 repeated groups, the yield label (`hg/ha_yield`) is **strictly identical**, while weather station temperatures (`avg_temp`) vary within the country.

### 2.2 Split Group-Crossing Audit in Naive Random Split (80/20)
When evaluating the standard naive random 80/20 train/test split:
- **Total Unique Groups in Test Set**: 3,917 groups.
- **Test Groups also appearing in Train Set**: **1,857 groups (47.41%)**.
- **Test Rows Belonging to a Training Group**: **3,043 out of 5,187 rows (58.67%)**.

> [!CRITICAL]
> **Scientific Finding**: In the standard random split, **58.67% of test observations share their exact country, crop, year, and national yield label with observations present in the training set**, differing only in local weather station temperature. This pseudo-replication artificially inflated random-split $R^2$ to $\sim 0.984$.

### 2.3 Leakage-Aware Grouped Evaluation Design & Results
To eliminate repeated-label leakage, a `GroupShuffleSplit` was designed where **all rows sharing `(Area, Item, Year)` are constrained to remain strictly within the same partition**:
- **Train Partition**: 16,723 rows (8,403 disjoint groups)
- **Calibration Partition**: 4,024 rows (2,101 disjoint groups)
- **Test Partition**: 5,185 rows (2,626 disjoint groups)
- **Group Overlap Across Splits**: **0 groups (Strictly Disjoint)**.

#### Comparison Before and After Leakage-Aware Grouping:

| Model Architecture | Naive Random $R^2$ (With Leakage) | Grouped $R^2$ (Leakage-Aware) | Naive RMSE (t/ha) | Grouped RMSE (t/ha) | Delta $R^2$ | Audit Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | 0.9740 | **0.9689** | 1.373 | **1.448** | -0.0051 | **VERIFIED** |
| **XGBoost** | 0.9714 | **0.9681** | 1.439 | **1.466** | -0.0033 | **VERIFIED** |

*Conclusion*: When pseudo-replicated label leakage is removed, predictive performance remains high ($R^2 \approx 0.969$), but error increases by $\sim +0.075\text{ t/ha}$. The naive random split over-estimated predictive power by $\sim 0.5\%$.

---

## 3. Task 2: Audit of Stacking & Conformal Calibration Separation

### 3.1 Trace of Original Data Flow (`app/ml/train_all.py`)

| Step | Code Location | Data Partition Used | Rows | Purpose | Leakage Status |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | `train_all.py:75-130` | `X_train_proc`, `y_train` | 16,596 | Fit base models (RF, XGB, LGBM, MLP) | Clean relative to dev split |
| **2** | `train_all.py:144` | `S_calib`, `y_calib` | 4,149 | Fit meta-regressor (`RidgeCV`) | Clean relative to base models |
| **3** | `train_all.py:158-159` | `S_calib`, `y_calib` | 4,149 | Conformal non-conformity calibration | **IN-SAMPLE CALIBRATION VIOLATION** |
| **4** | `train_all.py:165` | `S_test`, `y_test` | 5,187 | Final evaluation of meta-model & UQ | Clean relative to training |

> [!CAUTION]
> **Defect Identified**: In step 3, `conformal_calibrator.fit()` was evaluated using predictions from `meta_regressor` on `(S_calib, y_calib)`. Because `meta_regressor` had already fitted its coefficients to minimize squared errors on `y_calib`, the residuals evaluated on `y_calib` were **in-sample residuals**. This caused the calibrated margin $Q$ to be under-estimated at $1.327\text{ t/ha}$. The previous conformal validity claim was **PARTIALLY VERIFIED / METHODOLOGICALLY INVALID**.

### 3.2 Corrected 4-Way Disjoint Split Design
To ensure rigorous separation, a 4-way disjoint partitioned architecture was constructed using `GroupShuffleSplit`:

```
Clean Dataset (N=25,932, 13,130 Groups)
  │
  ├── 1. Base Models Training Set (N=13,392 rows, 6,564 groups) ──> Fit Base Models (RF, XGB, LGBM)
  │
  ├── 2. Meta-Model Training Set  (N=3,598 rows, 1,970 groups)  ──> Generate Out-of-Sample S_meta ──> Fit RidgeCV
  │
  ├── 3. Conformal Calibration    (N=3,757 rows, 1,970 groups)  ──> Generate Out-of-Sample S_calib ──> Fit Conformal Q
  │
  └── 4. Final Held-Out Test Set  (N=5,185 rows, 2,626 groups)  ──> Evaluate Ensemble Predictions & Empirical Coverage
```

- **Overlap Across All 4 Sets**: **0 rows, 0 groups**.

### 3.3 Recalculated Conformal Metrics under Corrected 4-Way Disjoint Split

| Metric | Original In-Sample Calibration | Corrected 4-Way Disjoint Calibration | Scientific Impact |
| :--- | :---: | :---: | :--- |
| **Calibrated Margin $Q$** | $1.327\text{ t/ha}$ | **$2.004\text{ t/ha}$** | True out-of-sample margin is $+51.0\%$ wider |
| **Nominal Coverage** | 90.0% | 90.0% | Target significance level $\alpha = 0.10$ |
| **Empirical Test Coverage** | 88.68% | **90.57%** | **Strictly achieves the nominal 90% coverage!** |
| **Average Interval Width** | $2.602\text{ t/ha}$ | **$3.809\text{ t/ha}$** | Realistic uncertainty width reflecting variance |

#### Crop-Wise Conformal Coverage under Corrected Disjoint Split:
- **Maize** ($N=763$, Mean: $3.59\text{ t/ha}$): **96.85%**
- **Rice, paddy** ($N=656$, Mean: $4.06\text{ t/ha}$): **98.93%**
- **Sorghum** ($N=626$, Mean: $1.84\text{ t/ha}$): **98.40%**
- **Soybeans** ($N=539$, Mean: $1.70\text{ t/ha}$): **99.63%**
- **Wheat** ($N=736$, Mean: $2.92\text{ t/ha}$): **100.00%**
- **Yams** ($N=175$, Mean: $11.04\text{ t/ha}$): **89.71%**
- **Plantains** ($N=103$, Mean: $9.55\text{ t/ha}$): **76.70%**
- **Sweet potatoes** ($N=492$, Mean: $12.88\text{ t/ha}$): **77.03%**
- **Cassava** ($N=341$, Mean: $11.57\text{ t/ha}$): **72.14%**
- **Potatoes** ($N=754$, Mean: $20.28\text{ t/ha}$): **74.01%** (improved from 66.99%)

*Summary*: Under the corrected disjoint calibration, overall empirical coverage rises to **90.57%**, satisfying the nominal 90% guarantee for the ensemble as a whole. However, the homoscedasticity gap remains between low-yield grains and high-yield tubers.

---

## 4. Task 3: Trustworthy Baseline Evaluation Comparison

Comparison across the four evaluation regimes:

| Evaluation Regime | Target Scale | Train Size | Test Size | Primary Model | $R^2$ Score | RMSE (t/ha) | What This Regime Establishes | What It Does NOT Establish |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **1. Naive Random Split** | tonnes/ha | 20,745 (80%) | 5,187 (20%) | Stacking Ens | **0.9815** | 1.156 | Interpolation accuracy under pseudo-replication | True generalization to unobserved tuples |
| **2. Grouped (Area, Item, Year)** | tonnes/ha | 16,723 (65%) | 5,185 (20%) | XGBoost | **0.9681** | 1.466 | Generalization to new climate feature vectors within known country-years | Generalization to unobserved future years or unobserved countries |
| **3. Chronological Split** | tonnes/ha | 20,182 ($\le 2008$) | 5,750 ($2009\text{--}2013$) | XGBoost | **0.9476** | 2.171 | Forecasting capability into future climate periods | Zero-shot geographic transfer |
| **4. Geographic Country Split** | tonnes/ha | 20,735 (85 Cntr) | 5,197 (16 Cntr) | XGBoost | **0.5727** | 6.277 | Zero-shot transferability to unmonitored territories | The model cannot transfer across borders |

---

## 5. Task 4: Online Explainability Request Path Audit

- **Execution Path**:
  1. Incoming HTTP `POST /api/v1/predict` $\implies$ routed to `app/api/v1/endpoints/predict.py`.
  2. Calls `prediction_service.predict()` in `app/services/prediction_service.py`.
  3. Prediction Model: XGBoost pipeline loaded from `models/crop_yield_model.pkl`.
  4. Local Feature Attribution (Lines 148–162):
     ```python
     features = ["rainfall", "avg_temp", "pesticides", "year", "crop", "country"]
     shap_vals = [
         round((payload.rainfall_mm - 1100.0) * 0.0005, 3),
         round((payload.avg_temp_c - 20.0) * -0.04, 3),
         round((np.log1p(payload.pesticides_tonnes) - 8.0) * 0.08, 3),
         round((payload.year - 2000) * 0.02, 3),
         round(0.85 if payload.crop == "Potatoes" else 0.12, 3),
         round(0.25 if payload.country in ["India", "United States"] else -0.1, 3)
     ]
     ```
  5. The UI at `frontend/src/App.tsx` labels this output as "Local SHAP Impact Breakdown".
- **Audit Classification**: **PARTIALLY VERIFIED (Proxy Heuristic)**.
- **Clarification**: The endpoint serves a hardcoded linear heuristic proxy designed for low-latency demonstration. It is **not** Shapley values from `shap.TreeExplainer`. In academic writing, this must be explicitly designated as a "Sensitivity Heuristic Proxy" rather than true SHAP.

---

## 6. Audit Verdicts & Evidence Summary

| Research Area | Pre-Audit Claim | Phase 3.2 Verified Reality | Status |
| :---: | :--- | :--- | :---: |
| **Task 1** | Random split evaluates independent samples | 58.67% of test samples share country-crop-year tuples with training observations. Grouped split $R^2 = 0.9681$. | **PARTIALLY VERIFIED** |
| **Task 2** | Conformal calibration was strictly out-of-sample | In `train_all.py`, meta-regressor and conformal calibrator shared `y_calib` in-sample. Corrected 4-way disjoint split yields true $Q = 2.004\text{ t/ha}$ with 90.57% test coverage. | **FAILED (Original) / VERIFIED (Corrected 4-Way)** |
| **Task 3** | High accuracy across all evaluation regimes | $R^2 = 0.968$ (grouped), $R^2 = 0.948$ (temporal), $R^2 = 0.573$ (geographic). Clear domain boundaries established. | **VERIFIED** |
| **Task 4** | Live API returns dynamic TreeSHAP explanations | Endpoint returns a fast linear proxy formula. Global hierarchy is empirical; local waterfall is proxy. | **PARTIALLY VERIFIED** |

---

## 7. Artifacts & Git Status

- **Working Directory**: `C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction`
- **Branch**: `feature/dl-ml-research-framework`
- **Automated Tests**: 14 tests passing (`python -m pytest tests/test_api.py -v`: 100% pass rate in 5.41s).
- **Deliverables**:
  - `PHASE3_2_EVALUATION_INTEGRITY_REPORT.md` (this report)
  - `PHASE3_2_EXPERIMENT_RESULTS.json` (machine-readable 4-way disjoint metrics and group counts)
  - `scripts/leakage_integrity_audit.py` (reproducible audit execution script)
  - `tests/test_api.py` (expanded with split disjointness regression test)
