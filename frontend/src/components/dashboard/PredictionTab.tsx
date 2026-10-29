import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  PresentationChartLineIcon, 
  ArrowsRightLeftIcon, 
  SparklesIcon, 
  BoltIcon, 
  CloudIcon, 
  SunIcon, 
  BeakerIcon, 
  ArrowPathIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ButtonSpinner } from '../ui/Loader';
import type { YieldInput, PredictionResponse, OptionsResponse } from '../../types';
import * as api from '../../api';

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
  const [loadingClimate, setLoadingClimate] = useState(false);
  const [climateStatus, setClimateStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleAutoFillClimate = async () => {
    setLoadingClimate(true);
    setClimateStatus(null);
    try {
      const liveData = await api.fetchLiveClimate(inputData.country, inputData.year);
      setInputData((prev) => ({
        ...prev,
        rainfall_mm: liveData.rainfall_mm,
        avg_temp_c: liveData.avg_temp_c,
      }));
      setClimateStatus({
        success: true,
        message: `${liveData.avg_temp_c}°C, ${liveData.rainfall_mm}mm (${liveData.is_live ? 'Live Open-Meteo' : 'Regional Baseline'})`
      });
      setTimeout(() => setClimateStatus(null), 6000);
    } catch (err: any) {
      setClimateStatus({
        success: false,
        message: err.message || 'Could not fetch live weather'
      });
      setTimeout(() => setClimateStatus(null), 5000);
    } finally {
      setLoadingClimate(false);
    }
  };

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
      gap: 18,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Primary Work Grid */}
      <div className="prediction-work-grid">
        {/* Parameter Control Form */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 16,
          border: '1.5px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          minWidth: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(169, 180, 158, 0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChartBarIcon style={{ width: 17, height: 17 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Environmental Parameters</h3>
                  <span style={{ fontSize: 12.5, color: '#A0AEC0' }}>Configure regional and meteorological variables</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClearPrediction}
                title="Reset all inputs"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid var(--color-forest-border)',
                  color: '#CBD5E1',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ArrowPathIcon style={{ width: 12, height: 12 }} />
                <span>Reset</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Country & Crop Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 6 }}>
                    Country / Region
                  </label>
                  <select
                    className="form-input"
                    style={{ padding: '10px 14px', fontSize: 14.5, borderRadius: 9, minHeight: 44, width: '100%', boxSizing: 'border-box' }}
                    value={inputData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  >
                    {options?.countries.map((c) => (
                      <option key={c} value={c} style={{ background: '#172416' }}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 6 }}>
                    Crop Species
                  </label>
                  <select
                    className="form-input"
                    style={{ padding: '10px 14px', fontSize: 14.5, borderRadius: 9, minHeight: 44, width: '100%', boxSizing: 'border-box' }}
                    value={inputData.crop}
                    onChange={(e) => handleChange('crop', e.target.value)}
                  >
                    {options?.crops.map((cr) => (
                      <option key={cr} value={cr} style={{ background: '#172416' }}>{cr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1-Click Live Open-Meteo Auto-Fill Banner */}
              <div style={{
                background: climateStatus?.success 
                  ? 'rgba(74, 222, 128, 0.12)' 
                  : climateStatus && !climateStatus.success 
                    ? 'rgba(239, 68, 68, 0.14)' 
                    : 'rgba(228, 253, 151, 0.08)',
                border: climateStatus?.success 
                  ? '1.5px solid rgba(74, 222, 128, 0.4)' 
                  : climateStatus && !climateStatus.success 
                    ? '1.5px solid rgba(239, 68, 68, 0.4)' 
                    : '1.5px solid rgba(228, 253, 151, 0.25)',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <CloudArrowDownIcon style={{ 
                    width: 22, 
                    height: 22, 
                    color: climateStatus?.success ? '#4ADE80' : 'var(--color-lime)', 
                    flexShrink: 0 
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#F7F7EF', lineHeight: 1.2 }}>
                      Live Climate Sync (Open-Meteo)
                    </div>
                    <div style={{ 
                      fontSize: 11.5, 
                      color: climateStatus ? (climateStatus.success ? '#4ADE80' : '#FCA5A5') : '#94A3B8',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      marginTop: 2
                    }}>
                      {climateStatus ? climateStatus.message : `Auto-fetch 2026 Open-Meteo weather for ${inputData.country}`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFillClimate}
                  disabled={loadingClimate}
                  title={`Query live meteorological feed for ${inputData.country}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--color-lime)',
                    color: '#0E160D',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 14px',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: loadingClimate ? 'wait' : 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(228, 253, 151, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingClimate) e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {loadingClimate ? (
                    <>
                      <ButtonSpinner size={13} />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <BoltIcon style={{ width: 14, height: 14 }} />
                      <span>Sync Weather</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rainfall Slider & Input */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 700, color: '#E2E8F0' }}>
                    Average Rainfall
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--color-lime)', fontWeight: 900 }}>
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
                  onWheel={(e) => e.currentTarget.blur()}
                  style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer', height: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#94A3B8', marginTop: 5, fontWeight: 500 }}>
                  <span>100 mm (Arid / Drought)</span>
                  <span>3500 mm (Tropical Rainforest)</span>
                </div>
              </div>

              {/* Temperature Slider & Input */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 700, color: '#E2E8F0' }}>
                    Mean Temperature
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--color-lime)', fontWeight: 900 }}>
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
                  onWheel={(e) => e.currentTarget.blur()}
                  style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer', height: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#94A3B8', marginTop: 5, fontWeight: 500 }}>
                  <span>0 °C (Frost / Cold)</span>
                  <span>38 °C (Extreme Thermal Stress)</span>
                </div>
              </div>

              {/* Pesticides & Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 6 }}>
                    Pesticide Application (tonnes)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ padding: '10px 14px', fontSize: 14.5, borderRadius: 9, minHeight: 44, width: '100%', boxSizing: 'border-box' }}
                    value={inputData.pesticides_tonnes}
                    onChange={(e) => handleChange('pesticides_tonnes', parseFloat(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>
                      Crop Year
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', background: 'rgba(228, 253, 151, 0.12)', border: '1px solid rgba(228, 253, 151, 0.25)', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>
                      1990–2026
                    </span>
                  </div>
                  <input
                    type="number"
                    className="form-input"
                    style={{ padding: '10px 14px', fontSize: 14.5, borderRadius: 9, minHeight: 44, width: '100%', boxSizing: 'border-box' }}
                    value={inputData.year}
                    onChange={(e) => handleChange('year', parseInt(e.target.value) || 2026)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="1990"
                    max="2035"
                  />
                </div>
              </div>

              {/* Regional Agro-Climatology Envelope Helper */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: '#CBD5E1' }}>
                  <span style={{ fontWeight: 700 }}>{inputData.country} Agro-Context ({inputData.crop})</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', fontSize: 11, fontWeight: 700 }}>FAO Reference Baseline</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: '#94A3B8', display: 'block', fontSize: 11, marginBottom: 2 }}>Precipitation Regime</span>
                    <span style={{ color: '#F7F7EF', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {inputData.rainfall_mm > 1600 ? 'High Tropical' : inputData.rainfall_mm < 450 ? 'Arid / Deficit' : 'Optimal Subtropical'}
                    </span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: '#94A3B8', display: 'block', fontSize: 11, marginBottom: 2 }}>Thermal Classification</span>
                    <span style={{ color: inputData.avg_temp_c > 32 ? '#F87171' : '#F7F7EF', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {inputData.avg_temp_c > 32 ? 'Heat Stress Anomaly' : inputData.avg_temp_c < 12 ? 'Temperate Chill' : 'Vegetative Optimum'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onRunPrediction}
              disabled={loading}
              style={{ 
                flex: 1, 
                padding: '13px 0', 
                fontSize: 15, 
                fontWeight: 900, 
                borderRadius: 10,
                boxShadow: '0 4px 16px var(--color-lime-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? (
                <ButtonSpinner size={18} text="Estimating..." />
              ) : (
                <>
                  <SparklesIcon style={{ width: 18, height: 18 }} />
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
                padding: '13px 18px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--color-forest-border)',
                borderRadius: 10,
                color: '#CBD5E1',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
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
          border: '1.5px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          minWidth: 0
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(169, 180, 158, 0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheckIcon style={{ width: 20, height: 20, color: 'var(--color-lime)' }} />
                <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 900, margin: 0 }}>Forecast Results & Confidence</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {prediction && (
                  <button
                    type="button"
                    onClick={onClearPrediction}
                    style={{
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      color: '#FCA5A5',
                      padding: '2px 7px',
                      borderRadius: 5,
                      fontSize: 10.5,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
                {prediction ? (
                  prediction.used_pilot_model ? (
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: 'rgba(52, 211, 153, 0.18)',
                      color: '#34D399',
                      padding: '2px 8px',
                      borderRadius: 100,
                      border: '1px solid rgba(52, 211, 153, 0.4)'
                    }}>
                      CLIMATE PILOT (ERA5)
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: 'rgba(228, 253, 151, 0.15)',
                      color: 'var(--color-lime)',
                      padding: '2px 8px',
                      borderRadius: 100,
                      border: '1px solid rgba(228, 253, 151, 0.25)'
                    }}>
                      PRODUCTION BASELINE
                    </span>
                  )
                ) : (
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: 'rgba(228, 253, 151, 0.15)',
                    color: 'var(--color-lime)',
                    padding: '2px 8px',
                    borderRadius: 100,
                    border: '1px solid rgba(228, 253, 151, 0.25)'
                  }}>
                    READY FOR INFERENCE
                  </span>
                )}
              </div>
            </div>

            {loading && !prediction ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-lime)' }}>
                <ButtonSpinner size={22} text="Calculating forecast..." />
              </div>
            ) : prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, justifyContent: 'flex-start' }}>
                {/* Unified Harvest Yield & 90% Statistical Coverage Interval Card */}
                <div className="prediction-summary-hero" style={{
                  background: 'radial-gradient(circle at 30% 30%, #20311f 0%, #132012 100%)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  border: '1.5px solid var(--color-forest-border)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)'
                }}>
                  {/* Left: Estimated Harvest Yield */}
                  <div>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                      Estimated Harvest Yield
                    </span>
                    <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-lime)', margin: '2px 0', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                      {prediction.predicted_yield_tonnes_per_ha.toFixed(2)}
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#F7F7EF', marginLeft: 8 }}>t/ha</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: '3px 0 0', fontWeight: 500 }}>
                      Approximately <strong style={{ color: 'var(--color-lime)' }}>{(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)}</strong> quintals/hectare
                    </p>
                  </div>

                  {/* Right: 90% Statistical Coverage Interval */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    border: '1px solid rgba(169, 180, 158, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: '#F7F7EF' }}>
                        90% Statistical Coverage
                      </span>
                      <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', background: 'rgba(228, 253, 151, 0.12)', border: '1px solid rgba(228, 253, 151, 0.25)', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                        CALIBRATED
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 10 }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: '#94A3B8', display: 'block', marginBottom: 2 }}>Worst-Case (Min)</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#F7F7EF', fontFamily: 'var(--font-mono)' }}>
                          {prediction.conformal_interval_90.lower_bound.toFixed(2)} <span style={{ fontSize: 12, fontWeight: 600 }}>t/ha</span>
                        </span>
                      </div>
                      <div style={{ height: 28, width: 1.5, background: 'rgba(169, 180, 158, 0.25)' }} />
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: '#94A3B8', display: 'block', marginBottom: 2 }}>Best-Case (Max)</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>
                          {prediction.conformal_interval_90.upper_bound.toFixed(2)} <span style={{ fontSize: 12, fontWeight: 600 }}>t/ha</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Visual Conformal Range Gauge */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.28)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  border: '1px solid rgba(169, 180, 158, 0.18)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: '#F7F7EF', fontWeight: 800 }}>Conformal Uncertainty Distribution</span>
                    <span style={{ color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 12.5 }}>
                      ±{(((prediction.conformal_interval_90.interval_width_tonnes ?? (prediction.conformal_interval_90.upper_bound - prediction.conformal_interval_90.lower_bound))) / 2).toFixed(2)} t/ha margin (90% Nominal Coverage)
                    </span>
                  </div>
                  {/* Gauge Track */}
                  <div style={{ position: 'relative', width: '100%', height: 9, background: 'rgba(255, 255, 255, 0.09)', borderRadius: 5, overflow: 'visible', margin: '6px 0' }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '100%',
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.5) 0%, rgba(228, 253, 151, 0.7) 45%, rgba(52, 211, 153, 0.6) 100%)'
                    }} />
                    {(() => {
                      const minB = prediction.conformal_interval_90.lower_bound;
                      const maxB = prediction.conformal_interval_90.upper_bound;
                      const pred = prediction.predicted_yield_tonnes_per_ha;
                      const range = Math.max(0.01, maxB - minB);
                      const pct = Math.min(96, Math.max(4, ((pred - minB) / range) * 100));
                      return (
                        <div style={{
                          position: 'absolute',
                          left: `${pct}%`,
                          top: -3.5,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'var(--color-lime)',
                          border: '2px solid #0E160D',
                          boxShadow: '0 0 12px var(--color-lime)',
                          transform: 'translateX(-50%)'
                        }} title={`Point Estimate: ${pred.toFixed(2)} t/ha`} />
                      );
                    })()}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#CBD5E1', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                    <span>Worst: <strong>{prediction.conformal_interval_90.lower_bound.toFixed(2)} t/ha</strong></span>
                    <span style={{ color: 'var(--color-lime)', fontWeight: 800 }}>Point Forecast: {prediction.predicted_yield_tonnes_per_ha.toFixed(2)} t/ha</span>
                    <span>Best: <strong>{prediction.conformal_interval_90.upper_bound.toFixed(2)} t/ha</strong></span>
                  </div>
                </div>

                {/* Climate Anomaly & Reliability Telemetry Badge */}
                {prediction.climate_shift_detected ? (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 9,
                    padding: '8px 12px',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <ExclamationTriangleIcon style={{ width: 17, height: 17, color: '#F87171', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#FCA5A5', lineHeight: 1.2 }}>
                          CLIMATE SHIFT DETECTED {prediction.climate_anomaly_z !== undefined ? `(${prediction.climate_anomaly_z > 0 ? '+' : ''}${prediction.climate_anomaly_z.toFixed(2)}σ)` : ''}
                        </div>
                        <div style={{ fontSize: 9.5, color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.25 }}>
                          Extreme thermal anomaly vs national baseline ({prediction.regional_climate_baseline?.temp_mean_c?.toFixed(1) ?? 'historical'} °C). Intervals widened.
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9.5,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: 'rgba(239, 68, 68, 0.25)',
                      color: '#FCA5A5',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      flexShrink: 0
                    }}>
                      {prediction.regional_reliability_tier || 'Moderate'} Tier
                    </span>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(52, 211, 153, 0.07)',
                    borderRadius: 9,
                    padding: '7px 12px',
                    border: '1px solid rgba(52, 211, 153, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      <ShieldCheckIcon style={{ width: 16, height: 16, color: '#34D399', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-offwhite)', fontWeight: 600 }}>
                          Climate Alignment: <strong style={{ color: '#34D399' }}>Verified</strong>{' '}
                          {prediction.climate_anomaly_z !== undefined && (
                            <span style={{ color: 'var(--color-muted)', fontSize: 10 }}>
                              (z = {prediction.climate_anomaly_z > 0 ? '+' : ''}{prediction.climate_anomaly_z.toFixed(2)}σ)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9.5,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: '#34D399',
                      background: 'rgba(52, 211, 153, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      flexShrink: 0
                    }}>
                      {prediction.regional_reliability_tier || 'High'} Tier
                    </span>
                  </div>
                )}

                {/* Optional Model Warnings Banner */}
                {prediction.warnings && prediction.warnings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {prediction.warnings.map((warn, wIdx) => (
                      <div key={wIdx} style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 9.5,
                        color: '#FCD34D',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <ExclamationTriangleIcon style={{ width: 12, height: 12, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Top Local Feature Drivers (Live Factor Breakdown) */}
                {prediction.shap_values && prediction.feature_names && prediction.shap_values.length > 0 && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.28)',
                    borderRadius: 12,
                    padding: '13px 18px',
                    border: '1px solid rgba(169, 180, 158, 0.18)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PresentationChartLineIcon style={{ width: 17, height: 17, color: 'var(--color-lime)' }} />
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#F7F7EF' }}>
                          Top Factors Affecting This Harvest
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        YIELD IMPACT
                      </span>
                    </div>

                    <div className="prediction-factors-grid">
                      {(() => {
                        const friendlyMap: Record<string, string> = {
                          crop: 'Crop Choice',
                          avg_temp: 'Average Temperature',
                          pesticides: 'Pest Protection',
                          effective_temp: 'Growing Season Temp',
                          rainfall: 'Annual Rainfall',
                          heat_stress_days: 'Hot Days (>30°C)',
                          irrigation_pct: 'Irrigation Access',
                          year: 'Farming Tech & Seeds',
                          effective_precip: 'Rain in Crop Season',
                          dry_spell_days: 'Dry Spell Length'
                        };
                        const shapList = prediction.shap_values || [];
                        const pairs = (prediction.feature_names || []).map((name, i) => ({
                          name: friendlyMap[name.toLowerCase()] || name.replace(/_/g, ' '),
                          val: shapList[i] ?? 0
                        }));
                        pairs.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
                        const top4 = pairs.slice(0, 4);
                        return top4.map((item, idx) => {
                          const isPos = item.val >= 0;
                          return (
                            <div key={idx} style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              borderRadius: 8,
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: isPos ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid rgba(248, 113, 113, 0.25)'
                            }}>
                              <span style={{ fontSize: 13, color: '#F7F7EF', fontWeight: 700 }}>
                                {item.name}
                              </span>
                              <span style={{
                                fontSize: 13.5,
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800,
                                color: isPos ? '#4ADE80' : '#F87171'
                              }}>
                                {isPos ? `+${item.val.toFixed(2)}` : item.val.toFixed(2)} t/ha
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Farm-Scale Harvest Projection Matrix */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.28)',
                  borderRadius: 12,
                  padding: '13px 18px',
                  border: '1px solid rgba(169, 180, 158, 0.18)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: '#F7F7EF' }}>
                      Farm-Scale Production Projections ({inputData.crop})
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', fontWeight: 700 }}>
                      HARVEST SCALE
                    </span>
                  </div>
                  <div className="prediction-farm-scale-grid">
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: 11.5, color: '#94A3B8', display: 'block', marginBottom: 3 }}>Smallholder (1 ha)</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#F7F7EF', fontFamily: 'var(--font-mono)' }}>
                        {(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)} <span style={{ fontSize: 12, fontWeight: 600 }}>Qtl</span>
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: 11.5, color: '#94A3B8', display: 'block', marginBottom: 3 }}>Medium Farm (5 ha)</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>
                        {(prediction.predicted_yield_tonnes_per_ha * 5).toFixed(1)} <span style={{ fontSize: 12, fontWeight: 600 }}>t</span>
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: 11.5, color: '#94A3B8', display: 'block', marginBottom: 3 }}>Commercial (25 ha)</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                        {(prediction.predicted_yield_tonnes_per_ha * 25).toFixed(1)} <span style={{ fontSize: 12, fontWeight: 600 }}>t</span>
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Compact Awaiting State */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 12px',
                textAlign: 'center',
                flex: 1
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(228, 253, 151, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  color: 'var(--color-lime)',
                  border: '1.5px solid rgba(228, 253, 151, 0.3)'
                }}>
                  <SparklesIcon style={{ width: 22, height: 22 }} />
                </div>
                <h4 style={{ fontSize: 15, color: 'var(--color-offwhite)', marginBottom: 4, fontWeight: 800 }}>
                  Awaiting Prediction Request
                </h4>
                <p style={{ fontSize: 11.5, maxWidth: 380, lineHeight: 1.4, margin: '0 0 14px', color: 'var(--color-muted)' }}>
                  Configure climatic parameters on the left or click a <strong>Quick Agro-Scenario</strong> below.
                </p>

                {/* Quick Agro-Scenario Chips */}
                <div style={{ width: '100%', maxWidth: 440, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, textAlign: 'left', letterSpacing: '0.04em' }}>
                    Quick Agro-Climatic Presets
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {PRESET_SCENARIOS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-forest-border)',
                          borderRadius: 7,
                          padding: '7px 10px',
                          color: 'var(--color-offwhite)',
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                      >
                        <span>{preset.label}</span>
                        <BoltIcon style={{ width: 12, height: 12, color: 'var(--color-lime)' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Model Indicators */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  width: '100%',
                  maxWidth: 440
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '8px 6px',
                    borderRadius: 7,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <CloudIcon style={{ width: 15, height: 15, color: 'var(--color-lime)', margin: '0 auto 4px' }} />
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-offwhite)' }}>Rainfall Tensor</div>
                    <div style={{ fontSize: 9.5, color: 'var(--color-muted)' }}>100 - 3500 mm</div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '8px 6px',
                    borderRadius: 7,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <SunIcon style={{ width: 15, height: 15, color: '#FCD34D', margin: '0 auto 4px' }} />
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-offwhite)' }}>Thermal Range</div>
                    <div style={{ fontSize: 9.5, color: 'var(--color-muted)' }}>0.0 - 38.0 °C</div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '8px 6px',
                    borderRadius: 7,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <BeakerIcon style={{ width: 15, height: 15, color: '#93C5FD', margin: '0 auto 4px' }} />
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-offwhite)' }}>Protection</div>
                    <div style={{ fontSize: 9.5, color: 'var(--color-muted)' }}>FAO Standard</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions to other tabs */}
          {prediction && (
            <div className="prediction-actions-grid" style={{ marginTop: 10, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToExplain}
                style={{ padding: '11px 16px', fontSize: 13.5, borderRadius: 9, justifyContent: 'center', fontWeight: 700 }}
              >
                <PresentationChartLineIcon style={{ width: 16, height: 16 }} />
                <span>View Factor Breakdown</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToWhatIf}
                style={{ padding: '11px 16px', fontSize: 13.5, borderRadius: 9, justifyContent: 'center', fontWeight: 700 }}
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
        borderRadius: 10,
        padding: '7px 16px',
        border: '1px solid var(--color-forest-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        fontSize: 11.5,
        color: 'var(--color-muted)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
          <span style={{ color: 'var(--color-offwhite)', fontWeight: 600 }}>Active Production Engine: XGBoost Regressor (1990–2026)</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
          <span>86.10% Test R² (2025–2026 Chronological Evaluation)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>RMSE: <strong style={{ color: 'var(--color-offwhite)' }}>4.13 t/ha</strong></span>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
          <span>Coverage: <strong style={{ color: 'var(--color-lime)' }}>90% Calibrated Guarantee</strong></span>
        </div>
      </div>
    </div>
  );
};
