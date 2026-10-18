# Terraflect — Frontend Integration Contract & API Specification

**Document Version:** 2.0.0  
**Backend Framework:** FastAPI / Python 3.14  
**Persistence Layer:** InsForge Managed PostgreSQL  
**ML Production Engine:** Scikit-Learn Pipeline with XGBoost Regressor (`Production-XGBoost-v2`)  
**Base Development URL:** `http://127.0.0.1:8000`  
**API v1 Route Prefix:** `/api/v1` (endpoints are also accessible without prefix for backward compatibility)

---

## 1. Quick Start Commands

### Backend Startup:
```bash
# In workspace root:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### Frontend Startup:
```bash
# In frontend/ directory:
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### Run Backend Tests:
```bash
python -m pytest tests/test_api.py tests/test_postgres_integration.py -v
```

---

## 2. Environment Variables Configuration

### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Backend (`.env` — server-side only, never committed to Git):
```env
APP_NAME="AI-Driven DL-ML Crop Yield Research Platform"
APP_ENV=development
API_V1_STR=/api/v1
SECRET_KEY=your-secure-random-64-character-jwt-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000

# InsForge PostgreSQL production connection string:
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<dbname>
```

---

## 3. CORS Configuration
The backend explicitly allows credentials (`allow_credentials=True`) with exact matching origins:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

---

## 4. Authentication & Authorization Architecture

Terraflect uses **Zero-OTP Immediate Authentication**:
1. No mandatory email confirmation or SMS OTP delays.
2. Passwords are mathematically hashed with Argon2id on the server.
3. Access tokens are HS256-signed JWTs with 24-hour validity (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`).
4. To authenticate requests, include the standard Bearer header:
   ```http
   Authorization: Bearer <your_access_token>
   ```

### A. Register Account
- **Route:** `POST /api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "email": "researcher@university.edu",
    "password": "StrongPassword2026!",
    "full_name": "Dr. Jane Agronomist",
    "organization": "Global Agriculture Institute"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "e4b1c2d3-1234-5678-9abc-def012345678",
      "email": "researcher@university.edu",
      "full_name": "Dr. Jane Agronomist",
      "organization": "Global Agriculture Institute",
      "created_at": "2026-10-18T13:30:00+00:00"
    }
  }
  ```

### B. Login
- **Route:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "researcher@university.edu",
    "password": "StrongPassword2026!"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "e4b1c2d3-1234-5678-9abc-def012345678",
      "email": "researcher@university.edu",
      "full_name": "Dr. Jane Agronomist",
      "organization": "Global Agriculture Institute",
      "created_at": "2026-10-18T13:30:00+00:00"
    }
  }
  ```

### C. Get Current User Profile
- **Route:** `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
  ```json
  {
    "id": "e4b1c2d3-1234-5678-9abc-def012345678",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Agronomist",
    "organization": "Global Agriculture Institute",
    "created_at": "2026-10-18T13:30:00+00:00"
  }
  ```

---

## 5. Core Platform & Inference Endpoints

### A. Health Check Probe
- **Route:** `GET /health`
- **Response (`200 OK`):**
  ```json
  {
    "status": "healthy",
    "service": "AI-Driven DL-ML Crop Yield Research Platform",
    "version": "2.0.0",
    "model_loaded": true,
    "metadata_loaded": true,
    "reference_data_loaded": true,
    "conformal_calibrator_loaded": true,
    "ref_data_rows": 25932,
    "test_r2": 0.9822,
    "database_connected": true
  }
  ```

### B. Prediction Options (Countries, Crops & Year Range)
- **Route:** `GET /api/v1/options`
- **Response (`200 OK`):**
  ```json
  {
    "countries": ["India", "Brazil", "United States", "France", "..."],
    "crops": ["Wheat", "Rice, paddy", "Maize", "Potatoes", "Soybeans", "Sorghum", "Cassava", "Sweet potatoes", "Yams", "Plantains"],
    "year_range": { "min": 1990, "max": 2030, "default": 2013 },
    "defaults": {
      "country": "India",
      "crop": "Wheat",
      "rainfall_mm": 1050.0,
      "avg_temp_c": 25.5,
      "pesticides_tonnes": 50000.0
    }
  }
  ```

### C. Single Prediction Endpoint
- **Route:** `POST /api/v1/predict`
- **Headers:** Optional `Authorization: Bearer <token>` (if provided, saves to user's history trail).
- **Request Body:**
  ```json
  {
    "country": "India",
    "crop": "Wheat",
    "year": 2013,
    "rainfall_mm": 1050.0,
    "avg_temp_c": 25.5,
    "pesticides_tonnes": 50000.0
  }
  ```
- **Validation Rules:**
  - `country` (`str`, required, non-empty)
  - `crop` (`str`, required, non-empty)
  - `year` (`int`: between 1990 and 2030)
  - `rainfall_mm` (`float`: $0.0 \le x \le 5000.0$, no NaN/Inf)
  - `avg_temp_c` (`float`: $-15.0 \le x \le 55.0$, no NaN/Inf)
  - `pesticides_tonnes` (`float`: $0.0 \le x \le 500000.0$, no NaN/Inf)
- **Response (`200 OK`):**
  ```json
  {
    "predicted_yield_hg_per_ha": 27785.0,
    "predicted_yield_tonnes_per_ha": 2.7785,
    "model_name": "Production XGBoost Regressor Pipeline",
    "deployed_estimator": "xgboost.sklearn.XGBRegressor",
    "model_test_r2": 0.9822,
    "model_test_rmse_hg_ha": 14660.0,
    "model_test_mae_hg_ha": 8550.0,
    "conformal_interval_90": {
      "lower_bound": 1.9675,
      "upper_bound": 3.5895,
      "interval_width_tonnes": 1.622,
      "nominal_coverage": 0.90,
      "calibrated_margin_q": 0.811,
      "calibration_crop": "Wheat",
      "method": "Crop-Conditional Conformal Quantile Calibration",
      "unit": "tonnes/ha",
      "coverage_disclaimer": "Reported 90% coverage is marginal across eligible groups; does not guarantee 90% on every individual crop or future distribution shift."
    },
    "feature_names": ["rainfall_mm", "avg_temp_c", "pesticides_tonnes", "year", "crop", "country"],
    "shap_values": [-0.142, 0.385, -0.051, 0.088, 1.250, -0.420],
    "base_value": 7.661,
    "attribution_method": "Exact TreeSHAP (shap.TreeExplainer)",
    "warnings": []
  }
  ```

### D. Batch Prediction
- **Route:** `POST /api/v1/predict/batch`
- **Request Body:**
  ```json
  {
    "items": [
      {
        "country": "India",
        "crop": "Wheat",
        "year": 2013,
        "rainfall_mm": 1050.0,
        "avg_temp_c": 25.5,
        "pesticides_tonnes": 50000.0
      },
      {
        "country": "India",
        "crop": "Rice, paddy",
        "year": 2013,
        "rainfall_mm": 1200.0,
        "avg_temp_c": 27.0,
        "pesticides_tonnes": 60000.0
      }
    ]
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "count": 2,
    "predictions": [ /* Array of PredictionResponse objects */ ]
  }
  ```

### E. Explainability (TreeSHAP Waterfall Attribution)
- **Route:** `POST /api/v1/explain`
- **Request Body:** Same as `YieldInput`.
- **Response (`200 OK`):**
  ```json
  {
    "prediction_tonnes_per_ha": 2.7785,
    "base_value": 7.6610,
    "feature_contributions": [
      {
        "feature": "crop",
        "shap_value": 1.250,
        "impact": "positive",
        "percentage_contribution": 54.4
      },
      {
        "feature": "avg_temp_c",
        "shap_value": 0.385,
        "impact": "positive",
        "percentage_contribution": 16.8
      },
      {
        "feature": "country",
        "shap_value": -0.420,
        "impact": "negative",
        "percentage_contribution": 18.3
      },
      {
        "feature": "rainfall_mm",
        "shap_value": -0.142,
        "impact": "negative",
        "percentage_contribution": 6.2
      },
      {
        "feature": "year",
        "shap_value": 0.088,
        "impact": "positive",
        "percentage_contribution": 3.8
      },
      {
        "feature": "pesticides_tonnes",
        "shap_value": -0.051,
        "impact": "negative",
        "percentage_contribution": 2.2
      }
    ],
    "attribution_method": "Exact TreeSHAP (shap.TreeExplainer)",
    "additivity_verified": true,
    "summary_text": "Base expected yield: 7.66 t/ha. Primary driver: crop; primary constraint: country."
  }
  ```

### F. Sensitivity Analysis Curve
- **Route:** `POST /api/v1/sensitivity`
- **Request Body:**
  ```json
  {
    "input_data": {
      "country": "India",
      "crop": "Wheat",
      "year": 2013,
      "rainfall_mm": 1050.0,
      "avg_temp_c": 25.5,
      "pesticides_tonnes": 50000.0
    },
    "parameter": "avg_temp_c",
    "points": 15
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "parameter": "avg_temp_c",
    "values": [15.5, 17.0, 18.5, 20.0, 21.5, 23.0, 24.5, 25.5, 27.0, 28.5, 30.0, 31.5, 33.0, 34.5, 35.5],
    "predictions_tonnes_per_ha": [2.12, 2.30, 2.51, 2.68, 2.82, 2.85, 2.81, 2.78, 2.65, 2.45, 2.20, 1.95, 1.75, 1.60, 1.52],
    "baseline_value": 25.5,
    "baseline_prediction_tonnes_per_ha": 2.7785,
    "elasticity_summary": "Varying avg_temp_c across range [15.5, 35.5] caused a 46.7% swing in expected yield."
  }
  ```

### G. What-If Scenario Analysis
- **Route:** `POST /api/v1/what-if`
- **Request Body:**
  ```json
  {
    "scenarios": [
      {
        "scenario_name": "Baseline (Current)",
        "inputs": {
          "country": "India", "crop": "Wheat", "year": 2013,
          "rainfall_mm": 1050.0, "avg_temp_c": 25.5, "pesticides_tonnes": 50000.0
        }
      },
      {
        "scenario_name": "Climate Shock (+2°C)",
        "inputs": {
          "country": "India", "crop": "Wheat", "year": 2013,
          "rainfall_mm": 1050.0, "avg_temp_c": 27.5, "pesticides_tonnes": 50000.0
        }
      },
      {
        "scenario_name": "Drought Scenario (-40% rain)",
        "inputs": {
          "country": "India", "crop": "Wheat", "year": 2013,
          "rainfall_mm": 630.0, "avg_temp_c": 25.5, "pesticides_tonnes": 50000.0
        }
      }
    ]
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "baseline_scenario": "Baseline (Current)",
    "comparisons": [
      {
        "scenario_name": "Baseline (Current)",
        "inputs": { ... },
        "predicted_yield_tonnes_per_ha": 2.7785,
        "conformal_interval_90": [1.9675, 3.5895],
        "calibrated_margin_q": 0.811,
        "delta_from_baseline_pct": 0.0
      },
      {
        "scenario_name": "Climate Shock (+2°C)",
        "inputs": { ... },
        "predicted_yield_tonnes_per_ha": 2.5420,
        "conformal_interval_90": [1.7310, 3.3530],
        "calibrated_margin_q": 0.811,
        "delta_from_baseline_pct": -8.51
      },
      {
        "scenario_name": "Drought Scenario (-40% rain)",
        "inputs": { ... },
        "predicted_yield_tonnes_per_ha": 2.6105,
        "conformal_interval_90": [1.7995, 3.4215],
        "calibrated_margin_q": 0.811,
        "delta_from_baseline_pct": -6.05
      }
    ]
  }
  ```

### H. Prediction History (User-Isolated Audit Trail)
- **Route:** `GET /api/v1/history`
- **Headers:** `Authorization: Bearer <token>` (Required)
- **Query Parameters:** `limit` (`int`, optional, default 50, max 200)
- **Response (`200 OK`):**
  ```json
  {
    "user_email": "researcher@university.edu",
    "count": 2,
    "history": [
      {
        "id": "pred-uuid-1",
        "user_id": "user-uuid",
        "country": "India",
        "crop": "Wheat",
        "year": 2013,
        "rainfall_mm": 1050.0,
        "avg_temp_c": 25.5,
        "pesticides_tonnes": 50000.0,
        "predicted_yield_hg_per_ha": 27785.0,
        "predicted_yield_tonnes_per_ha": 2.7785,
        "conformal_lower_bound": 1.9675,
        "conformal_upper_bound": 3.5895,
        "model_version": "Production-XGBoost-v2",
        "created_at": "2026-10-18T13:35:00+00:00"
      }
    ]
  }
  ```

### I. Global Feature Importance
- **Route:** `GET /api/v1/global-importance`
- **Response (`200 OK`):**
  ```json
  {
    "features": [
      { "name": "Crop Type (Item species)", "importance": 0.442 },
      { "name": "Country / Region (Area)", "importance": 0.285 },
      { "name": "Average Temperature (avg_temp)", "importance": 0.118 },
      { "name": "Pesticide Application (pesticides_tonnes)", "importance": 0.082 },
      { "name": "Annual Aggregate Rainfall (rainfall_mm)", "importance": 0.053 },
      { "name": "Observation Year (Technological trend)", "importance": 0.020 }
    ],
    "method": "XGBoost Gini Gain across 300 tree estimators",
    "deployed_model": "xgboost.sklearn.XGBRegressor"
  }
  ```

---

## 6. Error Responses & Non-Fatal Advisory Warnings

### Input Validation Errors (`422 Unprocessable Entity`):
Occurs when non-physical numbers, NaN, Inf, or out-of-range years are provided:
```json
{
  "detail": [
    {
      "type": "greater_than_equal",
      "loc": ["body", "rainfall_mm"],
      "msg": "Input should be greater than or equal to 0",
      "input": -50.0
    }
  ]
}
```

### Advisory Warnings in Successful Responses (`200 OK`):
If inputs are physically valid but historically unusual or if database persistence was temporarily unavailable, predictions still complete and attach human-readable advisories in the `warnings` array:
```json
{
  "predicted_yield_tonnes_per_ha": 3.12,
  "warnings": [
    "Advisory: Environmental input 'avg_temp_c' = 48.0°C exceeds observed historical bounds for crop 'Wheat'. Prediction uncertainty may be elevated.",
    "Audit warning: Database persistence unavailable; prediction could not be recorded to history trail."
  ]
}
```
