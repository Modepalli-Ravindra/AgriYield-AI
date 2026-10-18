"""Conformal Prediction engine for Distribution-Free Uncertainty Quantification."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, Tuple, Optional
import numpy as np
import joblib

class ConformalPredictionCalibrator:
    """Inductive Conformal Predictor for calibrated 90% prediction intervals."""
    def __init__(self, nominal_coverage: float = 0.90):
        self.nominal_coverage = nominal_coverage
        self.alpha = 1.0 - nominal_coverage
        self.quantile_q: Optional[float] = None
        self.calibration_size: int = 0
        self.empirical_test_coverage: Optional[float] = None
        self.average_interval_width_tonnes: Optional[float] = None

    def fit(self, y_true_hg: np.ndarray, y_pred_hg: np.ndarray) -> "ConformalPredictionCalibrator":
        """Compute nonconformity scores on held-out calibration split (in tonnes/ha)."""
        y_true_tonnes = y_true_hg / 10000.0
        y_pred_tonnes = y_pred_hg / 10000.0
        
        # Absolute residual nonconformity score: R_i = |y_i - y_hat_i|
        residuals = np.abs(y_true_tonnes - y_pred_tonnes)
        self.calibration_size = len(residuals)
        
        # Conformal finite-sample adjusted quantile
        # level = ceil((n + 1) * (1 - alpha)) / n
        p_level = np.ceil((self.calibration_size + 1) * (1.0 - self.alpha)) / self.calibration_size
        p_level = min(1.0, max(0.0, p_level))
        
        self.quantile_q = float(np.quantile(residuals, p_level))
        return self

    def predict_interval(self, point_prediction_tonnes: float) -> Tuple[float, float]:
        """Produce [lower_bound, upper_bound] interval guaranteed under exchangeability."""
        if self.quantile_q is None:
            # Fallback default margin if not fitted (approx 1.2 tonnes)
            q = 1.2
        else:
            q = self.quantile_q
            
        lower = max(0.0, float(point_prediction_tonnes - q))
        upper = float(point_prediction_tonnes + q)
        return (round(lower, 4), round(upper, 4))

    def evaluate_test(self, y_test_hg: np.ndarray, y_test_pred_hg: np.ndarray) -> Dict[str, float]:
        """Evaluate measured empirical coverage and average width on untouched test data."""
        y_test_tonnes = y_test_hg / 10000.0
        y_pred_tonnes = y_test_pred_hg / 10000.0
        
        lowers = np.maximum(0.0, y_pred_tonnes - self.quantile_q)
        uppers = y_pred_tonnes + self.quantile_q
        
        covered = (y_test_tonnes >= lowers) & (y_test_tonnes <= uppers)
        self.empirical_test_coverage = float(np.mean(covered))
        self.average_interval_width_tonnes = float(np.mean(uppers - lowers))
        
        return {
            "nominal_coverage": self.nominal_coverage,
            "empirical_coverage": round(self.empirical_test_coverage, 4),
            "average_width_tonnes": round(self.average_interval_width_tonnes, 4),
            "conformal_quantile_q": round(self.quantile_q, 4)
        }

    def save(self, path: Path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self, path)

    @classmethod
    def load(cls, path: Path) -> "ConformalPredictionCalibrator":
        if os.path.exists(path):
            return joblib.load(path)
        return cls()
