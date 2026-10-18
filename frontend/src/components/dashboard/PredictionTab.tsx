import React from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  PresentationChartLineIcon, 
  ArrowsRightLeftIcon, 
  SparklesIcon,
  BoltIcon,
  CloudIcon,
  SunIcon,
  BeakerIcon,
  ArrowPathIcon
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
  onClearPrediction: () => void;
  onNavigateToExplain: () => void;
  onNavigateToWhatIf: () => void;
}

const PRESET_SCENARIOS = [
  { label: 'India · Wheat', country: 'India', crop: 'Wheat', rainfall: 1050, temp: 25.5, pesticides: 50000, year: 2026 },
  { label: 'Brazil · Soybeans', country: 'Brazil', crop: 'Soybeans', rainfall: 1750, temp: 26.0, pesticides: 62000, year: 2026 },
  { label: 'USA · Maize', country: 'United States', crop: 'Maize', rainfall: 1100, temp: 22.0, pesticides: 75000, year: 2026 },
  { label: 'Egypt · Rice', country: 'Egypt', crop: 'Rice, paddy', rainfall: 250, temp: 28.5, pesticides: 24000, year: 2026 }
];

export const PredictionTab: React.FC<PredictionTabProps> = ({
  inputData,
  setInputData,
  options,
  prediction,
  loading,
  onRunPrediction,
  onClearPrediction,
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 'calc(100vh - 96px)',
      justifyContent: 'space-between',
      gap: 16
    }}>
      {/* Primary Work Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(380px, 460px) 1fr',
        gap: 16,
        alignItems: 'stretch',
        flex: 1
      }}>
        {/* Parameter Control Form */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 16,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(169, 180, 158, 0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChartBarIcon style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Environmental Parameters</h3>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Configure regional and climate variables</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClearPrediction}
                title="Reset all inputs and clear prediction"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--color-forest-border)',
                  color: 'var(--color-muted)',
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-offwhite)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-muted)';
                  e.currentTarget.style.borderColor = 'var(--color-forest-border)';
                }}
              >
                <ArrowPathIcon style={{ width: 13, height: 13 }} />
                <span>Reset</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Country & Crop Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                    Country / Region
                  </label>
                  <select
                    className="form-input"
                    style={{ padding: '11px 12px', fontSize: 13.5, borderRadius: 8 }}
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
                    style={{ padding: '11px 12px', fontSize: 13.5, borderRadius: 8 }}
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
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>
                    Average Rainfall
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--color-lime)', fontWeight: 800 }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--color-muted)', marginTop: 6 }}>
                  <span>100 mm (Arid)</span>
                  <span>3500 mm (Tropical)</span>
                </div>
              </div>

              {/* Temperature Slider & Input */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>
                    Mean Temperature
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--color-lime)', fontWeight: 800 }}>
                    {inputData.avg_temp_c.toFixed(1)} °C
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--color-muted)', marginTop: 6 }}>
                  <span>0 °C (Cold)</span>
                  <span>38 °C (Extreme Heat)</span>
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
                    style={{ padding: '11px 12px', fontSize: 13.5, borderRadius: 8 }}
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
                    style={{ padding: '11px 12px', fontSize: 13.5, borderRadius: 8 }}
                    value={inputData.year}
                    onChange={(e) => handleChange('year', parseInt(e.target.value) || 2026)}
                    min="1990"
                    max="2035"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onRunPrediction}
              disabled={loading}
              style={{ 
                flex: 1, 
                padding: '14px 0', 
                fontSize: 15, 
                fontWeight: 800, 
                borderRadius: 10,
                boxShadow: '0 4px 16px var(--color-lime-glow)'
              }}
            >
              {loading ? (
                <ButtonSpinner size={18} text="Calculating Yield Forecast..." />
              ) : (
                <>
                  <SparklesIcon style={{ width: 19, height: 19 }} />
                  <span>Estimate Crop Yield</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClearPrediction}
              title="Clear inputs and prediction"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-forest-border)',
                borderRadius: 10,
                color: 'var(--color-offwhite)',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)';
                e.currentTarget.style.color = '#FCA5A5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-forest-border)';
                e.currentTarget.style.color = 'var(--color-offwhite)';
              }}
            >
              <ArrowPathIcon style={{ width: 16, height: 16 }} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Prediction Outcome & Uncertainty Card */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 16,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(169, 180, 158, 0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheckIcon style={{ width: 20, height: 20, color: 'var(--color-lime)' }} />
                <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>Forecast Results & Confidence</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {prediction && (
                  <button
                    type="button"
                    onClick={onClearPrediction}
                    style={{
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      color: '#FCA5A5',
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Result
                  </button>
                )}
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
            </div>

            {loading ? (
              <div style={{ padding: '80px 20px' }}>
                <AIEngineLoader 
                  title="Terraflect Inference Pipeline"
                  subtitle="Calibrating 300 tree estimators, evaluating climate tensors and calculating 90% conformal intervals..."
                />
              </div>
            ) : prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Main Yield Display */}
                <div style={{
                  background: 'radial-gradient(circle at 50% 30%, #223321 0%, #152214 100%)',
                  borderRadius: 16,
                  padding: '28px 20px',
                  border: '1px solid var(--color-forest-border)',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
                }}>
                  <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Estimated Harvest Yield
                  </span>
                  <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--color-lime)', margin: '8px 0', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                    {prediction.predicted_yield_tonnes_per_ha.toFixed(2)}
                    <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-offwhite)', marginLeft: 8 }}>t/ha</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--color-muted)', margin: 0 }}>
                    Approximately <strong>{(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)}</strong> quintals per hectare
                  </p>
                </div>

                {/* 90% Confidence Interval Box */}
                <div style={{
                  background: 'rgba(18, 27, 17, 0.85)',
                  borderRadius: 14,
                  padding: '18px 22px',
                  border: '1px solid rgba(169, 180, 158, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShieldCheckIcon style={{ width: 18, height: 18, color: 'var(--color-lime)' }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-offwhite)' }}>
                        90% Statistical Coverage Interval
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', background: 'rgba(228, 253, 151, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                      CALIBRATED RANGE
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '16px 0',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 10
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Worst-Case Bound (Min)</span>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                        {prediction.conformal_interval_90.lower_bound.toFixed(2)} t/ha
                      </div>
                    </div>
                    <div style={{ height: 36, width: 1, background: 'rgba(169, 180, 158, 0.2)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Best-Case Bound (Max)</span>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
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
                padding: '28px 20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(228, 253, 151, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  color: 'var(--color-lime)',
                  border: '1.5px solid rgba(228, 253, 151, 0.3)',
                  boxShadow: '0 0 24px rgba(228, 253, 151, 0.2)'
                }}>
                  <SparklesIcon style={{ width: 32, height: 32 }} />
                </div>
                <h4 style={{ fontSize: 18, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 800 }}>
                  Awaiting Prediction Request
                </h4>
                <p style={{ fontSize: 13.5, maxWidth: 440, lineHeight: 1.55, margin: '0 0 22px', color: 'var(--color-muted)' }}>
                  Configure climatic parameters on the left or select a <strong>Quick Agro-Scenario</strong> below to test calibrated yield intervals.
                </p>

                {/* Quick Agro-Scenario Chips */}
                <div style={{ width: '100%', maxWidth: 480, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 10, textAlign: 'left', letterSpacing: '0.04em' }}>
                    Quick Agro-Climatic Presets
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {PRESET_SCENARIOS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-forest-border)',
                          borderRadius: 9,
                          padding: '10px 14px',
                          color: 'var(--color-offwhite)',
                          fontSize: 12.5,
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
                          e.currentTarget.style.background = 'rgba(228, 253, 151, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-forest-border)';
                          e.currentTarget.style.color = 'var(--color-offwhite)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        }}
                      >
                        <span>{preset.label}</span>
                        <BoltIcon style={{ width: 14, height: 14, color: 'var(--color-lime)' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Model Indicators */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  width: '100%',
                  maxWidth: 480
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <CloudIcon style={{ width: 18, height: 18, color: 'var(--color-lime)', margin: '0 auto 6px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-offwhite)' }}>Rainfall Tensor</div>
                    <div style={{ fontSize: 10, color: 'var(--color-muted)' }}>100 - 3500 mm</div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <SunIcon style={{ width: 18, height: 18, color: '#FCD34D', margin: '0 auto 6px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-offwhite)' }}>Thermal Range</div>
                    <div style={{ fontSize: 10, color: 'var(--color-muted)' }}>0.0 - 38.0 °C</div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <BeakerIcon style={{ width: 18, height: 18, color: '#93C5FD', margin: '0 auto 6px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-offwhite)' }}>Crop Protection</div>
                    <div style={{ fontSize: 10, color: 'var(--color-muted)' }}>FAO Standard</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions to other tabs */}
          {prediction && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToExplain}
                style={{ padding: '11px 14px', fontSize: 13, borderRadius: 8, justifyContent: 'center' }}
              >
                <PresentationChartLineIcon style={{ width: 16, height: 16 }} />
                <span>TreeSHAP Factors</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToWhatIf}
                style={{ padding: '11px 14px', fontSize: 13, borderRadius: 8, justifyContent: 'center' }}
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
        padding: '14px 22px',
        border: '1px solid var(--color-forest-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 12.5,
        color: 'var(--color-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
          <span style={{ color: 'var(--color-offwhite)', fontWeight: 600 }}>Active Production Engine: XGBoost Regressor</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
          <span>96.81% Test R² Across Geographic Splits</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>RMSE: <strong style={{ color: 'var(--color-offwhite)' }}>1.46 t/ha</strong></span>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
          <span>Coverage: <strong style={{ color: 'var(--color-lime)' }}>90% Statistically Guaranteed</strong></span>
        </div>
      </div>
    </div>
  );
};
