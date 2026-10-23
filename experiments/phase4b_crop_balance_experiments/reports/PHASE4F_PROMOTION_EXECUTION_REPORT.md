# Terraflect — Phase 4F: Controlled Production Promotion Execution Report

**Date:** October 19, 2026  
**Status:** **PROMOTION EXECUTED & FULLY VALIDATED — ALL 41 TESTS PASSED**  
**Production Deployment / Remote Git Push:** **PAUSED (Awaiting Separate Deployment Authorization)**  
**Remote Git Pushed:** **NO**  
**External Deployment:** **NONE**  

---

## 1. Executive Summary

In accordance with the explicit authorization granted in the Phase 4F directive, the **Phase 4B Log1p(y) Transformed XGBoost Model**, its matching **1990–2024 Crop-Conditional Conformal Calibrator**, and accompanying **Production Metadata** have been successfully promoted into the live production environment (`models/`).

All mandatory safeguards, pre-promotion hash verifications, immutable legacy backups, code adaptations, test suite validations, and smoke tests have passed without failure:
- **Pre-Promotion Checksums Verified:** Current and staging hashes matched the Phase 4E safety review identically before any file operation.
- **Legacy Production Artifacts Safely Backed Up:** Stored in `models/backup_legacy_production/` and cryptographically verified against original production hashes.
- **Production Artifacts Promoted:** Live models in `models/` now run the balanced 1990–2024 Log1p XGBoost pipeline.
- **Backend Code Adapted:** [app/services/prediction_service.py](file:///c:/Users/user/OneDrive/Desktop/Crop_Yield_Prediction/app/services/prediction_service.py) updated to cleanly unwrap `TransformedTargetRegressor` for TreeSHAP and calculate proportional yield attribution with machine-precision additivity ($0.0\text{ t/ha}$ error).
- **Test Suite Parity (100% Pass Rate):** **41/41 backend tests passed** (33/33 API tests, 8/8 PostgreSQL live integration tests).
- **Production Smoke Tests:** All 10 agricultural crops, out-of-distribution handling, non-negative bounds, unit consistency, multi-tenant isolation, and public demo endpoints verified.

---

## 2. Artifact Checksum Evolution & Verification

### 2.1 Cryptographic Hash Verification Table

| Artifact Role | File Path | Status | File Size | SHA-256 Checksum |
| :--- | :--- | :---: | :---: | :--- |
| **Legacy Prod Model (Backed Up)** | `models/backup_legacy_production/crop_yield_model.pkl` | Preserved | $2,084,697\text{ B}$ | `3cb876da311450dff568d388872f385666359c3fa0fa31f129b78cf63afbd732` |
| **Legacy Prod Calibrator (Backed Up)** | `models/backup_legacy_production/conformal_calibrator.pkl` | Preserved | $524\text{ B}$ | `10f53394043ea9ba779eb086d92d74a3387df5f49d084c58ebe722779cbcba26` |
| **Legacy Prod Metadata (Backed Up)** | `models/backup_legacy_production/model_metadata.pkl` | Preserved | $975\text{ B}$ | `930dc0c49c4da6332abd672f420cd86a7426a0d05a95f7edaaa1dd1f3d409487` |
| **New Live Production Model** | `models/crop_yield_model.pkl` | **PROMOTED** | $1,098,727\text{ B}$ | `9dbad95acf46d73f11827cc1e42507606695dc6bef20e0616c3b58cb965cd75a` |
| **New Live Production Calibrator** | `models/conformal_calibrator.pkl` | **PROMOTED** | $524\text{ B}$ | `b297aa56ebc254c64a87e27cfeda9e15173dbaa2deb91f5cdad071cb23af3316` |
| **New Live Production Metadata (pkl)** | `models/model_metadata.pkl` | **PROMOTED** | $1,086\text{ B}$ | `e30a80eaf7d9685743ed145923e2de8b6b45b2a3a74a1c8486408d562fd5d046` |
| **New Live Production Metadata (json)** | `models/model_metadata.json` | **PROMOTED** | $1,456\text{ B}$ | `79b318c5f1fc0ba4f1b9ace88388fe06006748c00f250e30b7835bbcdd72782d` |

---

## 3. Scope of Code & Test Modifications

### 3.1 Prediction Service ([app/services/prediction_service.py](file:///c:/Users/user/OneDrive/Desktop/Crop_Yield_Prediction/app/services/prediction_service.py))
1. **TreeExplainer Initialization:**
   ```python
   reg_step = self.model.named_steps["regressor"]
   inner_reg = getattr(reg_step, "regressor_", reg_step)
   self.tree_explainer = shap.TreeExplainer(inner_reg)
   ```
   Unwraps `TransformedTargetRegressor` cleanly to extract the fitted `XGBRegressor`, preventing `Model type not yet supported` exceptions while remaining fully backwards compatible with unwrapped regressors.
2. **Proportional Yield Attribution in `_compute_shap`:**
   Evaluates TreeSHAP in log-space ($u = \log(1 + y_{\text{hg}})$) and scales feature contributions proportionally to physical displacement in metric tonnes per hectare ($\Delta y_{\text{tonnes}} = \hat{y}_{\text{tonnes}} - \hat{y}_0$). Monotonicity ($g'(u) > 0$) guarantees zero sign inversion, and exact additivity ($\hat{y}_0 + \sum \phi_i = \hat{y}$) is enforced to floating-point roundoff.
3. **Training Distribution Limits:**
   Updated `year: {"min": 1990.0, "max": 2024.0}` to prevent false out-of-distribution warnings for recent historical years.

### 3.2 Test Suite Updates ([tests/test_api.py](file:///c:/Users/user/OneDrive/Desktop/Crop_Yield_Prediction/tests/test_api.py))
Only the 5 assertions directly tied to the new model architecture and recalibrated quantiles were updated:
1. `test_model_artifact_identity_and_transparency`: Updated to verify that the estimator regressor (or inner regressor if target-transformed) is an `XGBRegressor`.
2. `test_phase3_4_crop_conditional_conformal_bounds`: Updated expected calibrated margins to match 1990–2024 quantiles ($11.838\text{ t/ha}$ for Potatoes, $3.037\text{ t/ha}$ for Maize).
3. `test_phase3_4_production_model_metadata_consistency`: Updated assertions to verify that metadata records the promoted XGBoost pipeline and estimator.
4. `test_phase3_6_unknown_crop_global_fallback_and_disclaimer`: Updated unknown-crop group-max fallback quantile assertion to $14.691\text{ t/ha}$.
5. `test_phase3_7_production_model_artifact_identity_and_selection_record`: Updated regressor unwrapping assertion.

---

## 4. Test Suite Execution Audit

Full test suite executed in the promoted production environment:
`python -m pytest tests/test_api.py tests/test_postgres_integration.py -v`

### 4.1 Summary of Results
| Test Suite | Total Tests | Passed | Failed | Skipped | Execution Time |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **API Unit & Integration Tests (`tests/test_api.py`)** | 33 | **33** | 0 | 0 | 100.92s |
| **PostgreSQL Integration Tests (`tests/test_postgres_integration.py`)** | 8 | **8** | 0 | 0 | 78.09s |
| **Complete Backend Suite** | **41** | **41** | **0** | **0** | **178.91s (2m 58s)** |

---

## 5. Live Production Smoke Test Results

Direct HTTP test executions against the promoted production FastAPI application verified:

### 5.1 Multi-Crop Point Inference & Conformal Intervals (Calendar Year 2024)
| Crop | Country | Predicted Yield (`t/ha`) | Predicted Yield (`hg/ha`) | 90% Conformal Interval | Calibrated Margin $Q_c$ | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Wheat** | India | $2.50\text{ t/ha}$ | $25,025.1\text{ hg/ha}$ | $[0.00, 6.15]\text{ t/ha}$ | $3.65\text{ t/ha}$ | **PASS** |
| **Rice, paddy** | India | $3.90\text{ t/ha}$ | $38,993.9\text{ hg/ha}$ | $[1.39, 6.41]\text{ t/ha}$ | $2.51\text{ t/ha}$ | **PASS** |
| **Maize** | United States | $3.55\text{ t/ha}$ | $35,514.3\text{ hg/ha}$ | $[0.51, 6.59]\text{ t/ha}$ | $3.04\text{ t/ha}$ | **PASS** |
| **Soybeans** | United States | $1.79\text{ t/ha}$ | $17,913.3\text{ hg/ha}$ | $[0.69, 2.90]\text{ t/ha}$ | $1.10\text{ t/ha}$ | **PASS** |
| **Potatoes** | Germany | $24.11\text{ t/ha}$ | $241,079.5\text{ hg/ha}$| $[12.27, 35.95]\text{ t/ha}$| $11.84\text{ t/ha}$ | **PASS** |
| **Cassava** | Nigeria | $12.04\text{ t/ha}$ | $120,387.8\text{ hg/ha}$| $[3.99, 20.08]\text{ t/ha}$ | $8.05\text{ t/ha}$ | **PASS** |
| **Yams** | Nigeria | $9.92\text{ t/ha}$ | $99,234.7\text{ hg/ha}$ | $[0.00, 24.61]\text{ t/ha}$ | $14.69\text{ t/ha}$ | **PASS** |
| **Plantains** | Uganda | $5.53\text{ t/ha}$ | $55,320.6\text{ hg/ha}$ | $[1.60, 9.46]\text{ t/ha}$ | $3.93\text{ t/ha}$ | **PASS** |
| **Sweet potatoes** | Rwanda | $6.90\text{ t/ha}$ | $69,011.4\text{ hg/ha}$ | $[0.00, 16.17]\text{ t/ha}$ | $9.27\text{ t/ha}$ | **PASS** |
| **Sorghum** | Sudan | $0.36\text{ t/ha}$ | $3,561.0\text{ hg/ha}$  | $[0.00, 2.21]\text{ t/ha}$ | $1.85\text{ t/ha}$ | **PASS** |

### 5.2 Out-of-Distribution & Edge Cases
- **Unseen Country & Crop (`Atlantis` / `Dragonfruit`):** Triggered automatic group-max conformal fallback ($Q_{\text{group\_max}} = 14.691\text{ t/ha}$), non-negativity clipping ($y_{\text{lower}} \ge 0.0$), and emitted informative advisory warnings without crashing. **PASS**.
- **SHAP Additivity Verification:** Evaluated at `India/Wheat/2024`:
  - Base Value: $4.2347\text{ t/ha}$
  - Sum of Feature Contributions: $-1.7271\text{ t/ha}$
  - Prediction: $2.5076\text{ t/ha}$
  - Additivity Discrepancy: **$0.000000\text{ t/ha}$** (machine zero). **PASS**.
- **Multi-Tenant History Isolation:** Confirmed that newly registered users receive strictly `[]` (`count: 0`) and public onboarding history is served via `GET /api/v1/history/demo`. **PASS**.

---

## 6. Known Crop-Specific Coverage Limitations & Agronomic Notes

1. **Plantains & Cassava Volatility:** As documented in Phase 4D, regional yield volatility in East/Central Africa during 2019–2024 led to crop-conditional test coverage of $74.19\%$ for Plantains and $88.79\%$ for Cassava under the default margin. When conservative uncertainty is requested, the group-max fallback restores coverage to $100.00\%$ and $96.12\%$ respectively.
2. **Cereal Resolution Confirmed:** The Log1p model successfully resolved the unweighted MSE pathology, achieving major accuracy turnarounds across all grains (Soybean test $R^2$ lifted from $-0.13 \to +0.61$; Sorghum from $0.11 \to 0.52$).

---

## 7. Rollback Procedure & Contingency Target

Should any operational anomaly occur in production, the legacy state can be restored instantly:

```powershell
# Restore legacy model artifacts from verified backup
Copy-Item "models/backup_legacy_production/crop_yield_model.pkl" "models/crop_yield_model.pkl" -Force
Copy-Item "models/backup_legacy_production/conformal_calibrator.pkl" "models/conformal_calibrator.pkl" -Force
Copy-Item "models/backup_legacy_production/model_metadata.pkl" "models/model_metadata.pkl" -Force

# Restore code files to previous commit
git checkout HEAD -- app/services/prediction_service.py tests/test_api.py

# Run sanity check
python -m pytest tests/test_api.py -k "test_health_check or test_prediction_with_conformal_interval"
```
Recovery time: **$< 45\text{ seconds}$**.

---

## 8. Release Boundary & Next Steps

All local promotion gates for Phase 4F are complete and verified. 
- **No external cloud deployments have been initiated.**
- **No commits have been pushed to GitHub.**
- **All production model artifacts in `models/` are active, verified, and backed up.**

Awaiting separate user authorization for deployment or GitHub push.
