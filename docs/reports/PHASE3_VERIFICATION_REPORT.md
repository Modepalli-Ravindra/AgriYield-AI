# Phase 3 Independent Verification Report: Crop Yield Research Framework

**Project**: *An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors*  
**Auditor**: Independent AI Research Agent (Antigravity)  
**Date**: October 18, 2026  
**Workspace Root**: `C:\Users\user\OneDrive\Desktop\Crop_Yield_Prediction`  
**Base Commit Verified**: `7abffd3`  
**Branch**: `feature/dl-ml-research-framework`  

---

## 1. Executive Summary

An exhaustive, independent verification of the Phase 2 implementation was conducted across all nine audit stages. Testing utilized independent scripts, new automated test suites, and empirical evaluations on both identical and shifted data distributions.

### Summary Assessment by Research Dimension

| Dimension | Audit Status | Key Empirical Evidence |
| :--- | :---: | :--- |
| **Data Leakage & Preprocessing** | **VERIFIED** | Identified 2,310 exact duplicate rows in raw data ($N=28,242 \to 25,932$). Preprocessing fitted strictly on training data ($N=16,596$). No target leakage. |
| **ML Baselines Reproduction** | **VERIFIED** | Random Forest ($R^2=0.9740$), LightGBM ($R^2=0.9736$), XGBoost ($R^2=0.9714$) independently reproduced on held-out test data ($N=5,187$). |
| **PyTorch Tabular DL Integration** | **VERIFIED** | PyTorch Tabular MLP achieved $R^2 = 0.9787$, $\text{RMSE} = 1.242\text{ t/ha}$, genuinely outperforming all individual tree baselines. |
| **Stacking Meta-Ensemble** | **VERIFIED** | Out-of-fold meta-model achieved $R^2 = 0.9815$, $\text{RMSE} = 1.156\text{ t/ha}$, $\text{MAE} = 0.621\text{ t/ha}$, confirming variance reduction. |
| **Chronological Generalization** | **PARTIALLY VERIFIED** | When trained on $\le 2008$ and tested on $2009\text{--}2013$, models achieve $R^2 \approx 0.94\text{--}0.95$, but error inflation is $+51\%$ to $+69\%$ ($1.439 \to 2.171\text{ t/ha}$). |
| **Geographic Generalization** | **FAILED (Over-generalization Claim)** | When evaluated on held-out countries (GroupKFold), performance collapses to $R^2 = 0.51\text{--}0.57$ and $\text{RMSE} = 6.28\text{ t/ha}$. Models rely heavily on country memorization. |
| **Conformal Prediction (Overall)** | **VERIFIED** | Nominal 90% target achieved **88.68% empirical coverage** with calibrated margin $Q = 1.331\text{ t/ha}$. Physical non-negativity enforced. |
| **Conformal Subgroup Calibration** | **PARTIALLY VERIFIED** | Constant-width interval causes severe under-coverage for high-yield crops (Potatoes: **66.99%**) and over-coverage for low-yield crops (Soybeans: **99.68%**). Coverage under temporal shift drops to **77.91%**. |
| **Robustness Stress-Testing** | **VERIFIED** | MCAR and MAR missingness (10% to 50%) and Gaussian sensor noise reproduced; degradation curves match documented degradation. |
| **Explainability (SHAP)** | **PARTIALLY VERIFIED** | TreeSHAP works when called directly, but the API endpoint `/predict` uses a fast linear proxy heuristic rather than full TreeSHAP for low latency. |
| **Zero-OTP Authentication & Security** | **VERIFIED** | Argon2id password hashing, PyJWT bearer authorization, cross-user prediction isolation, and zero-OTP flow verified. 13 of 13 automated tests passed. |
| **Frontend Research Dashboard** | **VERIFIED** | React 19 + TypeScript 5.9 + Vite 8.3.4 compiled cleanly with 0 errors in 986ms. Verified interactive browser session. |

---

## 2. Dataset and Leakage Audit Findings

### 2.1 Duplicate Row Inflation Discovery
- **Evidence**: `data/yield_df.csv` contains an index column `Unnamed: 0` that hid duplicates when naive `df.duplicated()` was run.
- **Finding**: Dropping `Unnamed: 0` revealed **2,310 exact duplicate rows** across all features and target:
  - Raw export: **28,242 rows**
  - Deduplicated clean dataset: **25,932 rows**
- **Impact**: Random splitting on raw data with duplicates leaks identical country-crop-year observations into both training and testing, artificially suppressing RMSE from $1.071\text{ t/ha}$ to $0.952\text{ t/ha}$. All Phase 2 benchmarks correctly utilized the deduplicated 25,932 records.

### 2.2 Preprocessing & Information Leakage
- **Code Inspection**: `app/ml/train_all.py` (lines 52–68):
  ```python
  X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
  X_train, X_calib, y_train, y_calib = train_test_split(X_dev, y_dev, test_size=0.20, random_state=42)
  preprocessor = ColumnTransformer(...)
  X_train_proc = preprocessor.fit_transform(X_train)
  X_calib_proc = preprocessor.transform(X_calib)
  X_test_proc = preprocessor.transform(X_test)
  ```
- **Finding**: Preprocessing (`StandardScaler` and `OneHotEncoder`) is fitted **strictly on `X_train`**. No scaling statistics or category frequencies leak from `X_calib` or `X_test`.

---

## 3. Empirical Model Benchmarks Reproduction

### 3.1 Standard Random Split (80/20, $N=5,187$ Test Samples)

All models were retrained from scratch and evaluated on the exact held-out test split:

| Model Architecture | Phase 2 Reported $R^2$ | Phase 3 Verified $R^2$ | Verified RMSE (t/ha) | Verified MAE (t/ha) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest Regressor** | 0.9740 | **0.9740** | 1.373 | 0.694 | **VERIFIED** |
| **XGBoost Regressor** | 0.9714 | **0.9714** | 1.439 | 0.791 | **VERIFIED** |
| **LightGBM Regressor** | 0.9736 | **0.9736** | 1.383 | 0.728 | **VERIFIED** |
| **PyTorch Tabular MLP** | 0.9796 | **0.9787** | 1.242 | 0.668 | **VERIFIED** |
| **Stacking Meta-Ensemble** | 0.9822 | **0.9815** | 1.156 | 0.621 | **VERIFIED** |

*Verdict*: **VERIFIED**. The PyTorch Tabular MLP genuinely outperforms individual decision tree models on tabular data ($R^2 = 0.9787$ vs $0.9740$), and the Stacking Meta-Ensemble yields the highest overall accuracy.

### 3.2 Chronological Evaluation (Temporal Generalization)
To test whether the model generalizes to future agricultural years, models were trained strictly on historical observations ($\le 2008$, $N=20,182$) and evaluated on unseen future years ($2009\text{--}2013$, $N=5,750$):

| Architecture | Historical $R^2$ (Test $\le 2008$) | Future $R^2$ (2009–2013) | Future RMSE (t/ha) | Error Inflation | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | 0.9740 | **0.9401** | 2.320 | +68.9% | **PARTIALLY VERIFIED** |
| **XGBoost** | 0.9714 | **0.9476** | 2.171 | +50.8% | **PARTIALLY VERIFIED** |

*Scientific Finding*: Models maintain moderate predictive capability ($R^2 \approx 0.948$), but RMSE increases by $50\%\text{--}69\%$. Claims of "flawless future forecasting" must be moderated to reflect this temporal error increase.

### 3.3 Grouped Geographic Evaluation (Unseen Territories)
To test geographic transportability, a 5-fold `GroupKFold` was conducted holding out 16 whole countries ($N=5,197$ test observations) from training:

| Model Architecture | Standard Random $R^2$ | Unseen Countries $R^2$ | Unseen Countries RMSE | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Random Forest** | 0.9740 | **0.5099** | 6.721 t/ha | **FAILED** |
| **XGBoost** | 0.9714 | **0.5727** | 6.277 t/ha | **FAILED** |

*Critical Scientific Finding*: **The model cannot reliably predict crop yields in countries unseen during training.** Because `Area` is one-hot encoded, new countries default to zero embeddings. The high baseline $R^2$ (0.98) relies heavily on memorized country-specific yield baselines. For academic submission, authors must explicitly state this boundary condition.

---

## 4. Conformal Uncertainty Validation

### 4.1 Overall Coverage
- **Nominal Target**: 90.0% ($\alpha = 0.10$).
- **Calibration Split**: $N=4,149$ separate holdout observations.
- **Calibrated Non-Conformity Margin**: $Q = 1.3313\text{ tonnes/ha}$ ($13,313\text{ hg/ha}$).
- **Measured Empirical Coverage on Untouched Test Set ($N=5,187$)**: **88.68%**.
- **Physical Bounds**: `lower_bound = max(0.0, point_pred - Q)` strictly prevents negative yields.

### 4.2 Subgroup Disparities (Homoscedasticity Defect)
Because the framework applies a single global margin ($Q = 1.331\text{ t/ha}$) to all crops, severe subgroup disparities occur:

| Crop Species | Average Yield (t/ha) | Empirical Coverage | Assessment |
| :--- | :---: | :---: | :--- |
| **Soybeans** | 1.71 t/ha | **99.68%** | Over-conservative ($Q$ is nearly as large as the crop yield) |
| **Wheat** | 3.16 t/ha | **98.28%** | Over-conservative |
| **Maize** | 3.67 t/ha | **94.02%** | Well-calibrated |
| **Cassava** | 14.70 t/ha | **77.43%** | Under-covered |
| **Plantains** | 10.79 t/ha | **76.52%** | Under-covered |
| **Potatoes** | 19.74 t/ha | **66.99%** | **Severely Under-covered** (Target was 90%) |

**Yield Tier Breakdown**:
- Low-yield crops (< 33rd percentile): **98.31% coverage**
- Mid-yield crops (33rd–66th percentile): **93.05% coverage**
- High-yield crops ($\ge$ 66th percentile): **75.11% coverage**

### 4.3 Breakdown Under Temporal Distribution Shift
- When calibrated on historical data (2005–2008) and tested on future data (2009–2013), empirical coverage drops from **90.0% nominal to 77.91%**.
- **Reason**: Conformal prediction guarantees finite-sample coverage strictly under the assumption of **exchangeability (i.i.d.)**. Temporal climate change violates exchangeability.

---

## 5. Robustness & Stress-Testing Findings

### 5.1 MCAR & MAR Missingness Curves ($N=5,187$)

| Missingness Rate | MCAR RMSE (t/ha) | MCAR Error Inflation | MAR RMSE (t/ha) | MAR Error Inflation |
| :---: | :---: | :---: | :---: | :---: |
| **0% (Clean Baseline)** | 1.439 | 0.0% | 1.439 | 0.0% |
| **10% Missing** | 1.676 | +16.47% | 1.589 | +10.41% |
| **20% Missing** | 1.956 | +35.90% | 1.732 | +20.33% |
| **30% Missing** | 2.134 | +48.28% | 1.838 | +27.67% |
| **40% Missing** | 2.271 | +57.79% | 1.932 | +34.22% |
| **50% Missing** | 2.465 | +71.22% | 2.091 | +45.29% |

### 5.2 Sensor Gaussian Noise
Adding relative zero-mean Gaussian noise ($\sigma \in [0.1, 0.5]$) to rainfall and temperature resulted in controlled error inflation:
- $\sigma = 0.10 \implies \text{RMSE} = 1.763\text{ t/ha}$ (+22.48%)
- $\sigma = 0.30 \implies \text{RMSE} = 1.995\text{ t/ha}$ (+38.58%)
- $\sigma = 0.50 \implies \text{RMSE} = 2.378\text{ t/ha}$ (+65.18%)

---

## 6. Explainability (SHAP) Audit

- **Code Review**: `app/services/prediction_service.py` (lines 148–162) and `app/api/v1/endpoints/explain.py`.
- **Finding**: While `shap.TreeExplainer` was verified to compute real SHAP attributions in our standalone scripts (`explainer.shap_values(X_test_proc)`), the online API service uses a **heuristic linear proxy** (`round((payload.rainfall_mm - 1100.0) * 0.0005, 3)`) to prevent HTTP request latency spikes.
- **Classification**: **PARTIALLY VERIFIED**. The global feature hierarchy (Crop: 44.2%, Country: 28.5%, Temp: 11.8%, Pesticides: 8.2%, Rain: 5.3%) is scientifically sound, but the online local endpoint returns a fast linear proxy approximation rather than exact TreeSHAP values.

---

## 7. Authentication, Security, and API Audit

- **Password Hashing**: Verified using Argon2id (`argon2.Type.ID`, `time_cost=3`, `memory_cost=65536`, `parallelism=4`).
- **Token Security**: HMAC-SHA256 tokens with 24-hour expiration window.
- **Zero-OTP Compliance**: **VERIFIED**. Absolutely no email OTP, SMS OTP, or mandatory email verification flows exist.
- **Cross-User Data Isolation**: **VERIFIED**. Tested with distinct users (User A & User B). Predictions logged by User A cannot be queried or viewed by User B (verified in `test_user_isolation_prediction_history`).
- **Database Backend**: Verified SQLite local fallback with connection string compatibility for InsForge PostgreSQL.
- **Automated Test Results**: **13 of 13 tests passed** in `tests/test_api.py`.

---

## 8. Prioritized List of Corrections Before Academic Submission

Before submitting this research to a peer-reviewed agronomy or machine learning journal, address the following three critical items:

1. **Implement Locally Adaptive or Normalized Conformal Prediction (Priority 1)**:
   - *Problem*: Fixed margin $Q = 1.33\text{ t/ha}$ severely under-covers high-yield crops (Potatoes: 66.99%) and over-covers low-yield crops (Soybeans: 99.68%).
   - *Fix*: Use Conformalized Quantile Regression (CQR) or normalized non-conformity scores ($R_i = \frac{|y_i - \hat{y}_i|}{\hat{\sigma}(x_i)}$) so that prediction interval widths scale proportionally with crop yield variance.
2. **Clarify Geographic Transportability Limitations (Priority 2)**:
   - *Problem*: Evaluated on unseen countries, $R^2$ drops from $0.98$ to $0.54$.
   - *Fix*: Explicitly state in the manuscript that the model is designed for intra-national temporal forecasting across monitored countries, not out-of-domain transfer to unobserved countries lacking historical FAOSTAT records.
3. **Connect Exact TreeSHAP with In-Memory Caching (Priority 3)**:
   - *Problem*: Online API uses a linear proxy formula for feature attribution.
   - *Fix*: Pre-compute or cache the TreeSHAP explainer object in `PredictionService` so true TreeSHAP values are served dynamically without latency penalties.
