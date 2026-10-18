import React from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  PresentationChartLineIcon, 
  ArrowsRightLeftIcon, 
  SparklesIcon,
  CheckCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { ButtonSpinner, AIEngineLoader } from '../ui/Loader';
import type { YieldInput, PredictionResponse, OptionsResponse } from '../../types';

interface PredictionTabProps {
  inputData: YieldInput;
  setInputData: React.Dispatch<React.SetStateAction<YieldInput>>;
  options: OptionsResponse | null;
  prediction: PredictionResponse | null;
  loading: boolean;
  onRunPrediction: () => void;
  onNavigateToExplain: () => void;
  onNavigateToWhatIf: () => void;
}

const PRESET_SCENARIOS = [
  { label: 'India ? Wheat', country: 'India', crop: 'Wheat', rainfall: 1050, temp: 25.5, pesticides: 50000, year: 2026 },
  { label: 'Brazil ? Soybeans', country: 'Brazil', crop: 'Soybeans', rainfall: 1750, temp: 26.0, pesticides: 62000, year: 2026 },
  { label: 'USA ? Maize', country: 'United States', crop: 'Maize', rainfall: 1100, temp: 22.0, pesticides: 75000, year: 2026 },
  { label: 'Egypt ? Rice', country: 'Egypt', crop: 'Rice, paddy', rainfall: 250, temp: 28.5, pesticides: 24000, year: 2026 }
];

export const PredictionTab: React.FC<PredictionTabProps> = ({
  inputData,
  setInputData,
  options,
  prediction,
  loading,
  onRunPrediction,
  onNavigateToExplain,
  onNavigateToWhatIf
}) => {
  const handleChange = (field: keyof YieldInput, value: any) => {
    setInputData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setInputData((prev) => ({
      ...prev,
      country: preset.country,
      crop: preset.crop,
      rainfall_mm: preset.rainfall,
      avg_temp_c: preset.temp,
      pesticides_tonnes: preset.pesticides,
      year: preset.year
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(360px, 460px) 1fr',
        gap: 16,
        alignItems: 'stretch'
      }}>
        {/* Parameter Control Form */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 16,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 490
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid rgba(169, 180, 158, 0.14)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChartBarIcon style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16.5, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Environmental Parameters</h3>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Configure regional and climate variables</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Country & Crop Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                    Country / Region
                  </label>
                  <select
                    className="form-input"
                    style={{ padding: '10px 12px', fontSize: 13, borderRadius: 8 }}
                    value={inputData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  >
                    {options?.countries.map((c) => (
                      <option key={c} value={c} style={{ background: '#172416' }}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                    Crop Species
                  </label>
                  <select
                    className="form-input"
                    style={{ padding: '10px 12px', fontSize: 13, borderRadius: 8 }}
                    value={inputData.crop}
                    onChange={(e) => handleChange('crop', e.target.value)}
                  >
                    {options?.crops.map((cr) => (
                      <option key={cr} value={cr} style={{ background: '#172416' }}>{cr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rainfall Slider & Input */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-offwhite)' }}>
                    Average Rainfall
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-lime)', fontWeight: 800 }}>
                    {inputData.rainfall_mm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3500"
                  step="10"
                  value={inputData.rainfall_mm}
                  onChange={(e) => handleChange('rainfall_mm', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer', height: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-muted)', marginTop: 4 }}>
                  <span>100 mm (Arid)</span>
                  <span>3500 mm (Tropical)</span>
                </div>
              </div>

              {/* Temperature Slider & Input */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-offwhite)' }}>
                    Mean Temperature
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-lime)', fontWeight: 800 }}>
                    {inputData.avg_temp_c.toFixed(1)} ?C
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="38"
                  step="0.5"
                  value={inputData.avg_temp_c}
                  onChange={(e) => handleChange('avg_temp_c', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer', height: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-muted)', marginTop: 4 }}>
                  <span>0 ?C (Cold)</span>
                  <span>38 ?C (Extreme Heat)</span>
                </div>
              </div>

              {/* Pesticides & Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                    Pesticide Usage (tonnes)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ padding: '10px 12px', fontSize: 13, borderRadius: 8 }}
                    value={inputData.pesticides_tonnes}
                    onChange={(e) => handleChange('pesticides_tonnes', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                    Projection Year
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ padding: '10px 12px', fontSize: 13, borderRadius: 8 }}
                    value={inputData.year}
                    onChange={(e) => handleChange('year', parseInt(e.target.value) || 2026)}
                    min="1990"
                    max="2035"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Run Inference Action */}
          <button
            type="button"
            className="btn-primary"
            onClick={onRunPrediction}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '13px 0', 
              marginTop: 14, 
              fontSize: 14.5, 
              fontWeight: 700, 
              borderRadius: 10,
              boxShadow: '0 4px 14px var(--color-lime-glow)'
            }}
          >
            {loading ? (
              <ButtonSpinner size={18} text="Calculating Yield Forecast..." />
            ) : (
              <>
                <SparklesIcon style={{ width: 18, height: 18 }} />
                <span>Estimate Crop Yield</span>
              </>
            )}
          </button>
        </div>

        {/* Prediction Outcome & Uncertainty Card */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 16,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 490
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid rgba(169, 180, 158, 0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheckIcon style={{ width: 19, height: 19, color: 'var(--color-lime)' }} />
                <h3 style={{ fontSize: 16.5, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>Forecast Results & Confidence</h3>
              </div>
              <span style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                padding: '4px 10px',
                borderRadius: 100,
                border: '1px solid rgba(228, 253, 151, 0.25)'
              }}>
                PRODUCTION XGBOOST
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '60px 20px' }}>
                <AIEngineLoader 
                  title="Terraflect Inference Pipeline"
                  subtitle="Calibrating 300 tree estimators, evaluating climate tensors & calculating 90% conformal intervals..."
                />
              </div>
            ) : prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Main Yield Display */}
                <div style={{
                  background: 'radial-gradient(circle at 50% 30%, #223321 0%, #152214 100%)',
                  borderRadius: 14,
                  padding: '24px 20px',
                  border: '1px solid var(--color-forest-border)',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Estimated Harvest Yield
                  </span>
                  <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--color-lime)', margin: '6px 0', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                    {prediction.predicted_yield_tonnes_per_ha.toFixed(2)}
                    <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-offwhite)', marginLeft: 6 }}>t/ha</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>
                    Approximately <strong>{(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)}</strong> quintals per hectare
                  </p>
                </div>

                {/* 90% Confidence Interval Box */}
                <div style={{
                  background: 'rgba(18, 27, 17, 0.85)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  border: '1px solid rgba(169, 180, 158, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <ShieldCheckIcon style={{ width: 17, height: 17, color: 'var(--color-lime)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-offwhite)' }}>
                        90% Statistical Coverage Interval
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)' }}>
                      CALIBRATED RANGE
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '14px 0',
                    background: 'rgba(25, 37, 24, 0.6)',
                    borderRadius: 10
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Worst-Case Bound (Min)</span>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {prediction.conformal_interval_90.lower_bound.toFixed(2)} t/ha
                      </div>
                    </div>
                    <div style={{ height: 32, width: 1, background: 'rgba(169, 180, 158, 0.2)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Best-Case Bound (Max)</span>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {prediction.conformal_interval_90.upper_bound.toFixed(2)} t/ha
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisory Warnings */}
                {prediction.warnings && prediction.warnings.length > 0 && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start'
                  }}>
                    <ExclamationTriangleIcon style={{ width: 18, height: 18, color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 12.5, color: '#FDE68A' }}>
                      {prediction.warnings.map((w: string, idx: number) => <div key={idx}>{w}</div>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'rgba(228, 253, 151, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  color: 'var(--color-lime)',
                  border: '1px solid rgba(228, 253, 151, 0.25)',
                  boxShadow: '0 0 20px rgba(228, 253, 151, 0.15)'
                }}>
                  <SparklesIcon style={{ width: 28, height: 28 }} />
                </div>
                <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 800 }}>
                  Awaiting Prediction Request
                </h4>
                <p style={{ fontSize: 13, maxWidth: 380, lineHeight: 1.5, margin: '0 0 20px', color: 'var(--color-muted)' }}>
                  Configure climatic parameters on the left or click a <strong>Quick Agro-Scenario</strong> below to instantly populate validated field conditions.
                </p>

                {/* Quick Agro-Scenario Chips */}
                <div style={{ width: '100%', maxWidth: 440 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 8, textAlign: 'left' }}>
                    Quick Agro-Climatic Presets
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {PRESET_SCENARIOS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-forest-border)',
                          borderRadius: 8,
                          padding: '8px 10px',
                          color: 'var(--color-offwhite)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-lime)';
                          e.currentTarget.style.color = 'var(--color-lime)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-forest-border)';
                          e.currentTarget.style.color = 'var(--color-offwhite)';
                        }}
                      >
                        <span>{preset.label}</span>
                        <BoltIcon style={{ width: 13, height: 13, opacity: 0.7 }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assurance Indicators */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 22,
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-muted)' }}>
                    <CheckCircleIcon style={{ width: 14, height: 14, color: '#4ADE80' }} />
                    <span>Conformal 90% Bounds</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-muted)' }}>
                    <CheckCircleIcon style={{ width: 14, height: 14, color: '#4ADE80' }} />
                    <span>Exact TreeSHAP</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-muted)' }}>
                    <CheckCircleIcon style={{ width: 14, height: 14, color: '#4ADE80' }} />
                    <span>101 Countries</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions to other tabs */}
          {prediction && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToExplain}
                style={{ padding: '10px 14px', fontSize: 13, borderRadius: 8, justifyContent: 'center' }}
              >
                <PresentationChartLineIcon style={{ width: 16, height: 16 }} />
                <span>TreeSHAP Factors</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToWhatIf}
                style={{ padding: '10px 14px', fontSize: 13, borderRadius: 8, justifyContent: 'center' }}
              >
                <ArrowsRightLeftIcon style={{ width: 16, height: 16 }} />
                <span>What-If Sweeps</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Model Assurance Telemetry Bar */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 12,
        padding: '12px 20px',
        border: '1px solid var(--color-forest-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 12,
        color: 'var(--color-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
          <span style={{ color: 'var(--color-offwhite)', fontWeight: 600 }}>Active Production Engine: XGBoost Regressor</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>?</span>
          <span>96.81% Test R? Across Geographic Splits</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>RMSE: <strong style={{ color: 'var(--color-offwhite)' }}>1.46 t/ha</strong></span>
          <span>Coverage: <strong style={{ color: 'var(--color-lime)' }}>90% Statistically Guaranteed</strong></span>
          <span>Dataset: <strong style={{ color: 'var(--color-offwhite)' }}>28,242 Records</strong></span>
        </div>
      </div>
    </div>
  );
};
