# Terraflect — Candidate Feasibility Matrix & Strategic Roadmap

**Phase:** Phase 5B Technical & Research Audit  
**Date:** October 19, 2026  
**Status:** Completed Strategic Audit  
**Target Path:** `experiments/research_novelty/phase5b_research_audit/CANDIDATE_FEASIBILITY_MATRIX.md`

---

## 1. Executive Summary

To provide clear strategic direction, this document evaluates ten technical and methodological candidates across eight rigorous criteria:
1. **Research Novelty:** Scholarly originality vs. routine engineering.
2. **Practical Value:** Tangible agronomic benefit to farmers, insurers, or policy analysts.
3. **Dataset Compatibility:** Viability given current data structure (1990–2024 annual grain, static rainfall).
4. **Implementation Complexity:** Architectural and engineering overhead.
5. **Experimental Cost:** Compute, training time, and evaluation resources.
6. **Required Additional Data:** Dependence on external data ingestion.
7. **Evidence Required for Validation:** What benchmarks are necessary to establish the claim scientifically.
8. **Verdict:** **GO**, **CONDITIONAL GO**, or **NO-GO**.

---

## 2. Comprehensive Candidate Feasibility Matrix

| Candidate | Research Novelty | Practical Value | Dataset Compatibility | Implementation Complexity | Experimental Cost | Required Additional Data | Evidence Needed for Validation | Decision Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **A. SACAP: Shift-Aware Crop-Adaptive Conformal Prediction** | **High** (Solves delayed-label latency under non-exchangeable distribution shift) | **High** (Prevents under-coverage on vulnerable crops while preserving tight grain bounds) | **High** (Functions on existing temperature anomaly and crop identifiers) | Moderate (Requires test-time shift detector and calibration routing) | Low (Instant CPU inference; simple quantile evaluation) | None (Uses existing `avg_temp` and historical baseline) | Independent chronological test set showing $\ge 90\%$ coverage on all 10 crops with reduced Winkler score | **GO (Primary Recommendation)** |
| **B. Crop-Specific Calibration without Shift Detection (Pure Mondrian)** | Low (Direct implementation of Vovk 2005) | Moderate (Sharp nominal intervals, but collapses under climate drift) | **High** (Standard group grouping on `Item`) | Low (Ten independent quantile calculations) | Very Low | None | Verification of per-crop coverage under stationary regimes | **CONDITIONAL GO** (Useful as baseline component inside SACAP, but unsafe as standalone production policy) |
| **C. Climate-Shift Detection & Reliability Warnings at Prediction Time** | Moderate (Standard anomaly detection applied to agro-meteorology) | **High** (Informs users when query falls into unrepresented heatwave regimes) | **High** (Uses `avg_temp` distribution per country) | Low (Fast z-score thresholding) | Very Low | None | Precision/recall of warnings against large prediction errors ($> 2\times \text{MAE}$) | **GO (Component of Integrated Framework)** |
| **D. Crop-Specific Specialist Models (Separate Models per Crop)** | Low (Standard multi-model engineering pattern) | Low to Moderate (Minor per-crop parameter tuning) | Moderate (Certain crops have small sample sizes: Yams $N=123$ in test) | High (Requires managing 10 models, 10 artifact files, and 10 pipelines) | Moderate | None | Demonstrating that 10 models beat a single global model with one-hot crop encoding | **NO-GO** (High maintenance overhead with negligible empirical accuracy gain) |
| **E. Accuracy Comparisons across Tree Ensembles (XGB, Cat, LGB, ET, Stacking)** | Low (Standard ML benchmarking) | Moderate (Ensures production model is champion) | **High** (Native tabular compatibility) | Low | Low (Completed in Phase 5A: XGBoost won with $R^2 = 0.8034$) | None | Chronological test metrics across $R^2$, RMSE, MAE, Macro $R^2$ | **COMPLETED / BENCHMARK PROVEN** (XGBoost retained; Stacking rejected) |
| **F. SHAP-Based Explainability with Scale Safeguards** | Low (Application of Lundberg & Lee 2017) | **High** (Essential for agronomists to trust model predictions) | **High** (Native TreeSHAP compatibility) | Moderate (Requires unrolling `TransformedTargetRegressor` log-space math) | Low | None | Additivity verification in target yield space ($\sum \phi_i \approx \hat{y} - \mathbb{E}[y]$) | **COMPLETED / PRODUCTION READY** |
| **G. Temporal Deep Learning (TFT / Spatiotemporal GNN)** | High in abstract | Very High if fine weather data exists; Zero under static data | **Incompatible** (Rainfall is static $\sigma=0$; median sequence length is 35 years) | High (PyTorch / PyTorch-Forecasting) | High (GPU training, hyperparameter search) | **Critical:** Requires daily/monthly gridded weather (ERA5) and remote sensing (NDVI) | Ablation proving temporal attention beats static GBDT | **NO-GO for Current Dataset** (Revisit in Phase 6 after data expansion) |
| **H. Robustness & Generalization Tests across Future Years & Countries** | Moderate (Distribution shift stress testing) | **High** (Validates system against spatial and temporal domain shifts) | **High** (Evaluated via chronological and leave-one-country-out splits) | Moderate | Moderate | None | Leave-one-country-out and forward-year test results | **GO (Supporting Evidence for SACAP)** |
| **I. Integrated Reliability Framework (Uncertainty + Shift Warning + Safe Fallback)** | **High** (Unified production safety architecture) | **Very High** (End-to-end trustworthy AI system for agriculture) | **High** (Seamless integration with FastAPI backend) | Moderate | Low | None | Full integration tests verifying graceful degradation under sensor error or climate drift | **GO (Secondary Recommendation)** |
| **J. Crop-Relative Multiplicative Fallback (SACAP-V2)** | **High** (Refinement of SACAP eliminating absolute width penalties for small grains) | **High** (Guarantees Soybeans interval does not jump to $30\text{ t/ha}$) | **High** (Computes crop-specific expansion factor $c_k \times \hat{q}_k$) | Low | Low | None | Comparison showing preserved coverage with $40\%$ lower mean interval width on grains | **GO (Immediate Refinement)** |

---

## 3. Detailed Ranking of Top Three Candidates

### Rank 1: Primary Research Contribution
**Candidate A & J: SACAP (Shift-Aware Crop-Adaptive Conformal Prediction with Crop-Relative Fallback)**
- **Why It Ranks #1:** It directly addresses the most glaring vulnerability of agricultural forecasting—exchangeability violation under climate drift with delayed label feedback. It provides a demonstrable, publishable methodological contribution backed by reproducible mathematical evidence.
- **Immediate Improvement (SACAP-V2):** Replace the static global group-max fallback (`Q_group_max = 15.07 t/ha`) with a **crop-relative expansion multiplier** ($1.5 \times \hat{q}_k$), preventing low-yield grains like Soybeans and Sorghum from being penalized with 30 t/ha intervals during thermal shifts.

### Rank 2: Secondary Contribution (System Architecture)
**Candidate I: The Terraflect Integrated Agricultural Reliability Framework**
- **Why It Ranks #2:** Provides immediate commercial and client-facing value. It bundles the Log1p XGBoost point regressor, SHAP feature attribution, test-time climate-shift anomaly detector, and SACAP conformal calibrator into a single, cohesive, production-grade microservice.

### Rank 3: Empirical Rigor & Benchmark Contribution
**Candidate H: Chronological and Spatial Domain-Shift Stress Testing**
- **Why It Ranks #3:** Solidifies the credibility of the platform. Demonstrates exactly how model accuracy and interval coverage degrade when tested on previously unseen countries (spatial generalization) or unprecedented extreme temperature years (temporal climate drift).

---

## 4. Definitive Recommendation for Client

1. **Adopt SACAP-V2 as Terraflect's Flagship Research Contribution:** Focus academic papers and client messaging on the Shift-Aware Conformal framework.
2. **Reject Model Stacking and Crop-Specific Specialist Models:** Do not waste engineering cycles maintaining 10 disparate crop models when a single Log1p XGBoost baseline achieves superior global generalization ($R^2 = 0.8034$).
3. **Reject Deep Sequence Models (TFT) on Current Data:** Explain clearly to stakeholders that deploying deep multi-head transformers on static rainfall data is scientifically invalid and would result in paper retractions or client distrust.
