# Terraflect — Executive Research & Technical Audit Brief

**Prepared For:** Client & Project Stakeholders  
**Date:** October 19, 2026  
**Phase:** Phase 5B Research & Novelty Audit  
**Document Path:** `experiments/research_novelty/phase5b_research_audit/CLIENT_RESEARCH_BRIEF.md`

---

## 1. Executive Summary & Purpose

This brief provides an authoritative, evidence-backed assessment of the Terraflect machine learning platform. It directly answers the seven strategic questions posed by leadership regarding technology benchmarking, scientific novelty, experimental proof, dataset feasibility, and extension through 2026.

---

## 2. Answers to Leadership's Core Strategic Questions

### Question 1: What existing technologies and methods are used in crop-yield prediction?
In peer-reviewed agricultural data science:
- **Tabular Gradient Boosters:** XGBoost, CatBoost, and LightGBM dominate regional tabular modeling. They regularly outperform deep learning on heterogeneous tabular data (*Shwartz-Ziv & Armon, 2022*).
- **Deep Sequence & Spatiotemporal Models:** LSTMs and Temporal Fusion Transformers (TFT) are utilized when high-frequency satellite vegetation time series (e.g., weekly MODIS/Sentinel NDVI) and daily gridded weather reanalysis (ERA5) are available (*Lim et al., 2021*).
- **Uncertainty Quantification:** Split Conformal Prediction (*Lei et al., 2018*) and Mondrian (group-conditional) conformal prediction (*Vovk, 2005*) generate distribution-free prediction intervals.
- **Explainability:** SHAP (SHapley Additive exPlanations; *Lundberg & Lee, 2017*) is the industry gold standard for tree attribution.

---

### Question 2: What is Terraflect currently using?
Terraflect’s production stack consists of:
1. **Core Point Regressor:** A production-hardened **Log1p XGBoost Regressor** (`n_estimators=300`, `max_depth=6`, `learning_rate=0.08`, `subsample=0.85`), wrapped in `TransformedTargetRegressor` with $\log(1+y)$ forward scaling and $\text{expm1}$ inverse scaling.
2. **Explainability Engine:** A production **SHAP TreeExplainer** module that unwraps the log-space model, computes exact tree attributions, and scales contributions into physical metric tonnes per hectare ($\text{t/ha}$).
3. **Uncertainty Engine:** A single **Global Split Conformal Calibrator** ($\hat{q} = 6.144\text{ t/ha}$) providing marginal $90\%$ confidence bounds.
4. **Backend Infrastructure:** A production-grade **FastAPI** microservice backed by **PostgreSQL** and containerized deployment.

---

### Question 3: What genuinely new contribution are we proposing?
We propose **SACAP (Shift-Aware Crop-Adaptive Conformal Prediction with Validated Fallback)**.

SACAP resolves the fundamental conflict in multi-crop uncertainty quantification:
- Multi-crop yields vary by $>20\times$ (Soybeans $2.3\text{ t/ha}$ vs. Potatoes $30\text{ t/ha}$). A single global interval ($\pm 6.14\text{ t/ha}$) is excessively wide for small grains ($>300\%$ of mean yield).
- Crop-specific (Mondrian) calibration solves the scale problem during normal years, but **collapses under climate warming** (in our benchmark, coverage for Plantains collapsed to **$77.42\%$**, failing the $90\%$ target).
- Theoretical adaptive conformal methods (e.g., ACI) assume instant label feedback, but in agriculture, actual harvest yields arrive **6 to 12 months after predictions are made**.

**Our Contribution:**  
SACAP is an **unsupervised, test-time shift-gated conformal selection policy**. It monitors pre-prediction environmental anomalies ($D(\mathbf{x})$). Under nominal conditions, it provides tight, crop-specific bounds (saving up to $80\%$ interval width on grains). When extreme climate anomalies are detected, it dynamically activates a validated safety fallback without needing ground-truth harvest labels.

---

### Question 4: How is our approach different from existing research and systems?

| Approach | Feature | Limitation in Agriculture | Terraflect SACAP Difference |
| :--- | :--- | :--- | :--- |
| **Global Conformal** (Lei et al. 2018) | Single margin pooled across all crops | Soybeans interval is blown out to $>300\%$ of actual yield | Uses crop-conditional margins during nominal regimes (Soybean width $= 2.18\text{ t/ha}$) |
| **Mondrian Conformal** (Vovk 2005) | Independent quantiles per crop | Collapses under localized climate drift ($77.4\%$ on Plantains) | Monitors climate anomaly $D(\mathbf{x})$ and activates safety fallback, lifting coverage to $91.9\%$ |
| **Adaptive Conformal (ACI)** (Gibbs & Candès 2021) | Updates coverage level dynamically after each prediction | Requires instant next-step label feedback ($Y_t$); physically impossible before harvest | **Label-Free:** Operates purely on observable pre-harvest weather features available at query time |

---

### Question 5: What can we scientifically prove through experiments?
Using the independently reproduced chronological benchmark (1990–2013 train, 2014–2018 validation, 2019–2024 test; $N_{\text{test}} = 3,409$):

1. **Model Accuracy Superiority:**
   - Log1p XGBoost is the strongest performer: **Test $R^2 = 0.8034$**, **Test $\text{MAE} = 2.0821\text{ t/ha}$**.
   - Outperformed CatBoost ($R^2 = 0.7816$), LightGBM ($0.7556$), ExtraTrees ($0.6998$), and Stacking ($0.7490$).
2. **Proof of Crop-Conditional Failure under Climate Drift:**
   - Under standard Mondrian calibration, **Plantains and others collapsed to $77.42\%$ coverage** (95% CI: $[70.1\%, 84.8\%]$). Because the upper bound is $<90\%$, this failure is statistically significant ($p < 0.01$).
3. **Proof of SACAP Recovery:**
   - Under SACAP, Plantains coverage was successfully recovered to **$91.94\%$** (95% CI: $[87.1\%, 96.7\%]$), successfully achieving the nominal $90\%$ target.
   - Overall test coverage was **$95.81\%$**, protecting against the $+0.412^\circ\text{C}$ warming shift.

---

### Question 6: Which improvements are feasible with the current dataset?

| Improvement Proposal | Feasibility | Technical Verdict & Reason |
| :--- | :---: | :--- |
| **SACAP Uncertainty Engine** | **HIGH** | **GO:** Fully compatible with current temperature features; verified code and metrics. |
| **CatBoost / Stacking Replacement** | **LOW** | **NO-GO:** CatBoost regressed on tropical crops; Stacking suffered $50\times$ slower runtime and lower test $R^2$ ($0.7490$). Retain single XGBoost. |
| **Temporal Deep Learning (TFT)** | **ZERO** | **NO-GO on Current Data:** Dataset rainfall has zero within-country variance ($\sigma=0$); sequence lengths (35 annual steps) are too short for self-attention. |
| **Crop-Relative Fallback (SACAP-V2)** | **HIGH** | **GO:** Refinement that scales fallback multiplicatively ($1.5 \times \hat{q}_k$), preventing wide intervals on grains. |

---

### Question 7: Can the dataset be extended from 1990 through 2026 using verified data?
**NO. The dataset CANNOT be extended through 2026 with verified actual observations.**

- **The Verified Reality:**
  - **1990–2024:** Fully verified and ingested from official UN FAOSTAT QCL archives ($19,996$ rows).
  - **2025:** Official global harmonized crop yield census bulk data is not yet released by the UN FAO (12–18 month reporting lag).
  - **2026:** Calendar year 2026 is currently active and unharvested. Official annual harvest census statistics **do not exist anywhere in the world**.
- **Scientific Integrity Policy:** We will not fabricate artificial 2025/2026 crop yields. 2024 remains the definitive golden historical baseline.

---

## 3. Recommended Next Implementation Phase (Phase 5C)

Upon client approval, we recommend proceeding to **Phase 5C (Staging Integration of SACAP-V2)**:
1. Package the verified SACAP engine into a standalone, lightweight calibrator artifact (`models/conformal_calibrator_sacap.pkl`).
2. Implement **SACAP-V2 (Crop-Relative Fallback)** to ensure grain interval widths remain tightly bounded during heatwave alerts.
3. Update the FastAPI prediction service response schema to return:
   - Point forecast ($\hat{y}$ in $\text{t/ha}$).
   - Calibrated lower and upper prediction bounds ($[l, u]$).
   - Anomaly / Climate Drift Alert flag (`shift_detected: true/false`).
   - Active calibration mode (`"Crop-Conditional Nominal"` vs. `"Shift-Aware Climate Safeguard"`).
4. Run regression test suites in staging before production release.
