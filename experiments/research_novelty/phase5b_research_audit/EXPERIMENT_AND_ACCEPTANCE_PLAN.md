# Terraflect — Reproducible Experiment and Acceptance Plan (Phase 5B & Beyond)

**Phase:** Phase 5B Technical & Research Audit  
**Date:** October 19, 2026  
**Status:** Approved Experimental Specification  
**Target Path:** `experiments/research_novelty/phase5b_research_audit/EXPERIMENT_AND_ACCEPTANCE_PLAN.md`

---

## 1. Executive Summary

This document specifies the exact, reproducible experimental protocol, validation gates, and pre-defined acceptance criteria for future empirical benchmarks on the Terraflect platform.

Adhering strictly to peer-reviewed methodology, this protocol enforces:
1. Leakage-safe chronological data partitioning.
2. A strictly untouched, blinded test partition.
3. Pre-defined statistical acceptance thresholds established prior to model evaluation.
4. Comprehensive multi-metric evaluation across accuracy, coverage, interval efficiency, and computational cost.

---

## 2. Leakage-Safe Chronological Partitioning

To accurately simulate operational forecasting under climate drift, data is partitioned chronologically by calendar year:

```
[================= TRAIN (1990–2013) =================] [=== CALIB / VAL (2014–2018) ===] [====== TEST (2019–2024) ======]
               N = 13,281 (66.4%)                                N = 3,306 (16.5%)                    N = 3,409 (17.1%)
```

### Partition Governance Rules:
1. **Training Partition (1990–2013):** Used exclusively for model parameter fitting, feature encoding, scaling parameters, and calculating country-level climate baselines ($\mu_{\text{Area}}, \sigma_{\text{Area}}$).
2. **Calibration / Validation Partition (2014–2018):** Used for hyperparameter tuning, model checkpoint selection, computing non-conformity calibration quantiles ($\hat{q}_k$), and establishing the shift-detection threshold ($\tau_{\text{shift}}$).
3. **Held-Out Test Partition (2019–2024):** Strictly sequestered. Under no circumstances may any model parameter, feature selector, or calibration quantile access test rows during the tuning phase.

---

## 3. Evaluated Metrics & Mathematical Definitions

### 3.1 Point Regression Accuracy
- **Coefficient of Determination ($R^2$):**
  $$R^2 = 1 - \frac{\sum_{i=1}^N (y_i - \hat{y}_i)^2}{\sum_{i=1}^N (y_i - \bar{y})^2}$$
- **Root Mean Squared Error (RMSE):**
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$$
- **Mean Absolute Error (MAE):**
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$$
- **Macro $R^2$:** Unweighted arithmetic mean of $R^2$ across all 10 individual crop species.

### 3.2 Conformal Uncertainty Quantification
- **Empirical Coverage Rate ($\text{Cov}$):**
  $$\text{Cov} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}\left( y_i \in [l(\mathbf{x}_i), u(\mathbf{x}_i)] \right)$$
- **Mean Interval Width ($\bar{W}$):**
  $$\bar{W} = \frac{1}{N} \sum_{i=1}^N (u(\mathbf{x}_i) - l(\mathbf{x}_i))$$
- **Winkler Interval Score ($\text{Score}$):**
  $$\text{Score} = \frac{1}{N} \sum_{i=1}^N \left( (u_i - l_i) + \frac{2}{\alpha}(l_i - y_i)\mathbb{I}(y_i < l_i) + \frac{2}{\alpha}(y_i - u_i)\mathbb{I}(y_i > u_i) \right)$$

---

## 4. Pre-Defined Pass/Fail Acceptance Criteria

Any proposed algorithmic or methodological modification must pass all five criteria before promotion to staging or production:

| Gate | Metric | Baseline (Phase 4F XGBoost) | Required Acceptance Threshold | Rationale |
| :---: | :--- | :--- | :--- | :--- |
| **Gate 1** | Overall Test $R^2$ | $0.8034$ | $\ge 0.7900$ | Point regression accuracy must not suffer meaningful regression ($< 0.015$). |
| **Gate 2** | Test Macro $R^2$ | $0.6082$ | $\ge 0.6000$ | Multi-crop balance must be preserved across both tuber and grain categories. |
| **Gate 3** | Overall Conformal Test Coverage | $92.02\%$ (Global) | $\mathbf{90.0\% \le \text{Cov} \le 95.0\%}$ | Must honor the nominal $90\%$ confidence level ($1-\alpha=0.10$). |
| **Gate 4** | Per-Crop Worst-Case Coverage | $77.42\%$ (Plantains) | $\mathbf{\ge 88.0\%}$ for every crop | Must resolve the catastrophic under-coverage on under-represented crops. |
| **Gate 5** | Grain Interval Sharpness | $10.36\text{ t/ha}$ (Global) | $\mathbf{\le 6.00\text{ t/ha}}$ for Soybeans/Sorghum | Must produce actionable, sharp intervals for low-tonnage cereal grains. |

---

## 5. Ablation Studies Protocol

To scientifically isolate the causal contribution of each component, experimental benchmarks must run the following ablation matrix:

1. **Ablation 1: Base Model Architecture**
   - Compare Log1p XGBoost vs. Log1p CatBoost vs. Log1p LightGBM under identical splits.
2. **Ablation 2: Target Scale Transformation**
   - Evaluate model trained on raw $y$ vs. $\log(1+y)$ vs. inverse-variance sample weights.
3. **Ablation 3: Shift Detector Isolation**
   - Evaluate Crop-Conditional (Mondrian) without shift detection vs. SACAP with anomaly gating.
4. **Ablation 4: Fallback Policy Selection**
   - Compare static Group-Max Fallback ($Q_{\max} = 15.07\text{ t/ha}$) vs. Crop-Relative Multiplier ($1.5 \times \hat{q}_k$).

---

## 6. Execution Safeguards & Computational Budget

- **Random Seeds:** Master random seed is fixed to `42` across all NumPy, PyTorch, Scikit-Learn, and XGBoost initializations.
- **Compute Ceiling:** All candidate evaluations must run within standard workstation CPU limits ($< 15\text{ minutes}$ total runtime). Any candidate requiring $> 1\text{ hour}$ of GPU compute must be justified by demonstrable accuracy gains.
- **Rollback Guarantee:** Production model artifacts (`models/*.pkl`) must remain backed up in `models/backup_legacy_production/` prior to any staging dry run.
