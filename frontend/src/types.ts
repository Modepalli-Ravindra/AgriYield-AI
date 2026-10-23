export interface YieldInput {
  country: string;
  crop: string;
  year: number;
  rainfall_mm: number;
  avg_temp_c: number;
  pesticides_tonnes: number;
}

export interface ConformalInterval {
  lower_bound: number;
  upper_bound: number;
  interval_width_tonnes?: number;
  nominal_coverage: number;
  calibrated_margin_q?: number;
  calibration_crop?: string;
  method: string;
  unit: string;
  coverage_disclaimer?: string;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  mean: number;
  std: number;
}

export interface PredictionResponse {
  predicted_yield_hg_per_ha: number;
  predicted_yield_tonnes_per_ha: number;
  model_name: string;
  deployed_estimator?: string;
  model_test_r2: number;
  model_test_rmse_hg_ha: number;
  confidence_interval: ConfidenceInterval;
  conformal_interval_90: ConformalInterval;
  shap_values?: number[];
  feature_names?: string[];
  base_value?: number;
  attribution_method?: string;
  warnings?: string[];
  used_pilot_model?: boolean;
  has_authentic_climate?: boolean;
  climate_coverage_status?: string;
  climate_features_used?: Record<string, any>;
  timestamp: string;
}

export interface BatchItemResult {
  input: YieldInput;
  predicted_yield_tonnes_per_ha: number;
  conformal_interval_90: {
    lower_bound: number;
    upper_bound: number;
  };
  warnings?: string[];
}

export interface BatchPredictionResponse {
  total_items: number;
  predictions: BatchItemResult[];
}

export interface OptionsResponse {
  countries: string[];
  crops: string[];
  year_range: { min: number; max: number };
  default_input: YieldInput;
}

export interface FeatureContribution {
  feature: string;
  shap_value: number;
  impact: string;
  percentage_contribution: number;
}

export interface ExplainResponse {
  prediction_tonnes_per_ha: number;
  base_value: number;
  feature_contributions: FeatureContribution[];
  attribution_method?: string;
  additivity_verified?: boolean;
  summary_text: string;
}

export interface SensitivityResponse {
  parameter: string;
  values: number[];
  predictions_tonnes_per_ha: number[];
  baseline_value: number;
  baseline_prediction_tonnes_per_ha: number;
  elasticity_summary: string;
}

export interface WhatIfResponse {
  baseline_scenario: string;
  comparisons: Array<{
    scenario_name: string;
    inputs: YieldInput;
    predicted_yield_tonnes_per_ha: number;
    conformal_interval_90: [number, number];
    calibrated_margin_q?: number;
    delta_from_baseline_pct: number;
  }>;
}

export interface ModelBenchmark {
  model_name: string;
  model_family: string;
  is_deployed_production_model?: boolean;
  r2_random_split: number;
  rmse_random_split_tonnes: number;
  mae_random_split_tonnes: number;
  r2_temporal_split: number;
  rmse_temporal_split_tonnes: number;
  mae_temporal_split_tonnes: number;
  training_time_seconds: number;
  parameter_count: number;
}

export interface ModelComparisonResponse {
  dataset_version: string;
  total_samples: number;
  train_samples: number;
  test_samples: number;
  models: ModelBenchmark[];
  best_overall_model: string;
  dl_vs_ml_empirical_gain: string;
}

export interface GlobalImportanceFeature {
  name: string;
  importance: number;
}

export interface GlobalImportanceResponse {
  features: GlobalImportanceFeature[];
  method: string;
  deployed_model: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  organization?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface HistoryRecord {
  id: string;
  user_id: string;
  country: string;
  crop: string;
  year: number;
  rainfall_mm: number;
  avg_temp_c: number;
  pesticides_tonnes: number;
  predicted_yield_tonnes_per_ha: number;
  conformal_lower_bound?: number;
  conformal_upper_bound?: number;
  model_name: string;
  created_at: string;
}

export interface HistoryResponse {
  total?: number;
  count?: number;
  records: HistoryRecord[];
  history?: HistoryRecord[];
}
