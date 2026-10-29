# Terraflect — Phase 5A: Experimental Protocol & Reproducibility Guide

**Date:** October 19, 2026  
**Auditor / Researcher:** Antigravity AI Research Pair Programmer  
**Deliverable Path:** `experiments/research_novelty/reports/PHASE5A_EXPERIMENT_PROTOCOL.md`  

---

## 1. Experimental Protocol Overview

Phase 5A investigates accuracy improvements, deep sequence feasibility, and distribution-robust conformal prediction policies. To eliminate data leakage, overfitting, and confirmation bias, all experiments strictly adhere to the following protocol:

```
[ 1990 —————————————————————— 2018 ] | [ 2019 —————————————— 2024 ]
           Pre-Test Period           |       Held-Out Test Epoch
  ┌──────────────────┬─────────────┐ | ┌─────────────────────────┐
  │  Train Partition │  Validation │ | │     Held-Out Test Set   │
  │ N = 13,281 (80%) │ N=3,306(20%)│ | │    N = 3,409 (100%)     │
  │                  │             │ | │                         │
  │ Preprocessing    │ Conformal   │ | │ Evaluated ONLY ONCE to  │
  │ Model Training   │ Calibration │ | │ report final unbiased   │
  │ Hyperparam Tune  │ Shift Thresh│ | │ out-of-sample metrics   │
  └──────────────────┴─────────────┘ | └─────────────────────────┘
```

---

## 2. Partitioning & Leakage Prevention Rules

### 2.1 Chronological Epoch Separation
1. **Zero Temporal Leakage:**
   $$\max(\text{Year}_{\text{train, calib}}) = 2018 < \min(\text{Year}_{\text{test}}) = 2019$$
   No future data from 2019–2024 was accessible during model training, feature normalization, or conformal calibration.
2. **Preprocessing Isolation:**
   - Scikit-Learn `ColumnTransformer` (OneHotEncoder for `Area`, `Item`; StandardScaler for numeric features) was fitted **exclusively on the $N=13,281$ training partition**.
   - Validation and test partitions were transformed using the frozen preprocessor.
3. **No Test-Set Model Selection:**
   - Model hyperparameter tuning and model selection were performed strictly by comparing validation $R^2$ on the $N=3,306$ validation split.
   - The final held-out test set ($N=3,409$) was evaluated only after all models and policies were frozen.

---

## 3. Evaluated Candidates & Parameter Configurations

All models were evaluated on the identical transformed target:
$$y_{\log} = \ln(1 + y_{\text{hg}})$$
with predictions converted to physical yield via:
$$\hat{y}_{\text{tonnes}} = \frac{\max(0.0, \; \text{expm1}(\hat{y}_{\log}))}{10{,}000.0}$$

### 3.1 Model Architectures
1. **Log1p XGBoost (Production Baseline):**
   - Framework: `xgboost.XGBRegressor`
   - Hyperparameters: `n_estimators=300, max_depth=6, learning_rate=0.1, random_state=42, n_jobs=-1`
2. **Log1p CatBoost:**
   - Framework: `catboost.CatBoostRegressor`
   - Hyperparameters: `iterations=500, depth=6, learning_rate=0.1, random_seed=42, verbose=0, thread_count=-1`
   - Distinctive Feature: Symmetric oblivious decision trees with target statistics on categorical variables.
3. **Log1p LightGBM:**
   - Framework: `lightgbm.LGBMRegressor`
   - Hyperparameters: `n_estimators=300, max_depth=6, learning_rate=0.1, random_state=42, verbose=-1, n_jobs=-1`
   - Distinctive Feature: Gradient-based One-Side Sampling (GOSS) and Exclusive Feature Bundling (EFB).
4. **Log1p Extra Trees:**
   - Framework: `sklearn.ensemble.ExtraTreesRegressor`
   - Hyperparameters: `n_estimators=200, max_depth=16, min_samples_split=5, random_state=42, n_jobs=-1`
   - Distinctive Feature: Extremely randomized decision trees reducing ensemble variance.
5. **Log1p Stacking Ensemble:**
   - Base Learners: XGBoost, CatBoost, LightGBM, ExtraTrees
   - Meta-Learner: `Ridge(alpha=1.0)` fit on 3-fold cross-validated out-of-fold log predictions.
6. **CropYield LSTM Sequence Model (Workstream C):**
   - Architecture: 2-layer LSTM ($64$ hidden units, dropout $0.1$) + MLP projection head ($32 \to 1$).
   - Input: $3$-year historical lag sequences $(y_{t-3}, y_{t-2}, y_{t-1}, \mathbf{z}_t)$.
   - Training: Adam optimizer ($lr=0.003, \text{weight\_decay}=10^{-4}$), batch size $64$, $25$ epochs.

---

## 4. Conformal Inference & Policy Evaluation Framework

Conformal calibration was performed on the $N=3,306$ validation split at target confidence level $1-\alpha = 0.90$ ($\alpha = 0.10$).

### 4.1 Evaluated Conformal Policies
1. **Global Conformal Prediction:** Single scalar quantile $\hat{Q}_{\text{global}}$ pooled across all crops.
2. **Crop-Conditional Conformal Prediction (Mondrian):** Crop-specific quantiles $\hat{Q}_k$ computed on crop sub-partitions.
3. **Static Group-Max Fallback:** Conservative upper envelope $\hat{Q}_{\text{group\_max}} = \max_k \hat{Q}_k$.
4. **Adaptive Conformal Inference (ACI) (Gibbs & Candès, 2021):** Online sequential tracking with update rule:
   $$\alpha_{t+1} = \alpha_t + \gamma (\alpha - \text{err}_t), \quad \gamma = 0.015$$
5. **Shift-Aware Crop-Adaptive Conformal Policy (SACAP) (Proposed):** Evaluates standardized climate anomaly score $D(X_{n+1})$ at test time and dynamically applies $\hat{Q}_{\text{group\_max}}$ when $D(X_{n+1}) \ge \tau_{\text{shift}}$ ($\tau_{\text{shift}} = 1.624$, tuned to the 90th percentile of validation anomalies).

### 4.2 Uncertainty Scoring Rule: Winkler Interval Score
To penalize both interval width and miscoverage objectively, we evaluate the **Winkler Interval Score** ($\text{IS}_\alpha$):
$$\text{IS}_\alpha(l, u, y) = (u - l) + \frac{2}{\alpha}(l - y)\mathbb{I}(y < l) + \frac{2}{\alpha}(y - u)\mathbb{I}(y > u)$$
- For a well-calibrated interval that covers the target, the score equals the interval width $(u - l)$.
- For any violation (target falls outside), an extreme penalty $\frac{2}{\alpha} = 20\times$ the distance is added.
- **Lower Winkler Score indicates a superior reliability–sharpness trade-off.**

---

## 5. Execution Environment & Reproducibility Commands

### 5.1 Environment
- **Operating System:** Windows 11 (AMD64)
- **Python Version:** 3.14.5
- **Key Dependencies:**
  - `xgboost` 3.1.2
  - `catboost` 1.2.10
  - `lightgbm` 4.6.0
  - `scikit-learn` 1.8.0
  - `torch` 2.6.0
  - `shap` 0.49.1

### 5.2 Exact Reproduction Commands
```bash
# 1. Execute Dataset Audit
python experiments/research_novelty/scripts/audit_dataset.py

# 2. Execute Full Research Benchmark Suite
python experiments/research_novelty/scripts/run_phase5a_experiments.py
```
All outputs, metrics, and JSON summaries are saved automatically to `experiments/research_novelty/metrics/`.
