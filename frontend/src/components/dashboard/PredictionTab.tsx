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
        message: `${liveData.avg_temp_c}°C, ${liveData.rainfall_mm}mm (${liveData.is_live ? 'Live' : 'Baseline'})`
      });
      setTimeout(() => setClimateStatus(null), 5000);
    } catch (err: any) {
      setClimateStatus({
        success: false,
        message: err.message || 'Could not fetch live weather'
      });
      setTimeout(() => setClimateStatus(null), 4000);
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
      height: '100%',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Primary 2-Column Work Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 400px) minmax(0, 1fr)',
        gap: 12,
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Parameter Control Form */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 14,
          border: '1.5px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          {/* Card Header with Live Sync & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(169, 180, 158, 0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ChartBarIcon style={{ width: 16, height: 16 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 14.5, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Environmental Parameters</h3>
                <span style={{ fontSize: 10.5, color: climateStatus ? (climateStatus.success ? '#4ADE80' : '#FCA5A5') : '#A0AEC0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {climateStatus ? climateStatus.message : 'Configure agro-meteorological variables'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleAutoFillClimate}
                disabled={loadingClimate}
                title={`Sync live meteorological feed for ${inputData.country}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'var(--color-lime)',
                  color: '#0E160D',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 9px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: loadingClimate ? 'wait' : 'pointer',
                  boxShadow: '0 2px 6px rgba(228, 253, 151, 0.25)'
                }}
              >
                {loadingClimate ? (
                  <>
                    <ButtonSpinner size={10} />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <BoltIcon style={{ width: 12, height: 12 }} />
                    <span>Live Sync</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClearPrediction}
                title="Reset all inputs"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid var(--color-forest-border)',
                  color: '#CBD5E1',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowPathIcon style={{ width: 11, height: 11 }} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Form Fields Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Country & Crop Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>
                  Country / Region
                </label>
                <select
                  className="form-input"
                  style={{ padding: '7px 10px', fontSize: 13, borderRadius: 7, height: 36, minHeight: 36, width: '100%', boxSizing: 'border-box' }}
                  value={inputData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                >
                  {options?.countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>
                  Crop Species
                </label>
                <select
                  className="form-input"
                  style={{ padding: '7px 10px', fontSize: 13, borderRadius: 7, height: 36, minHeight: 36, width: '100%', boxSizing: 'border-box' }}
                  value={inputData.crop}
                  onChange={(e) => handleChange('crop', e.target.value)}
                >
                  {options?.crops.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Average Rainfall Slider Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#E2E8F0' }}>
                  Average Rainfall
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>
                  {inputData.rainfall_mm} <span style={{ fontSize: 11, color: '#A0AEC0' }}>mm</span>
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
                className="range-slider"
                style={{ width: '100%', cursor: 'pointer', height: 5, margin: '4px 0' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#94A3B8', marginTop: 1 }}>
                <span>100 mm (Arid / Drought)</span>
                <span>3500 mm (Tropical Rainforest)</span>
              </div>
            </div>

            {/* Mean Temperature Slider Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#E2E8F0' }}>
                  Mean Temperature
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>
                  {inputData.avg_temp_c.toFixed(1)} <span style={{ fontSize: 11, color: '#A0AEC0' }}>°C</span>
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
                className="range-slider"
                style={{ width: '100%', cursor: 'pointer', height: 5, margin: '4px 0' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#94A3B8', marginTop: 1 }}>
                <span>0 °C (Frost / Cold)</span>
                <span>38 °C (Extreme Thermal Stress)</span>
              </div>
            </div>

            {/* Pesticide & Crop Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>
                  Pesticides (tonnes)
                </label>
                <input
                  type="number"
                  className="form-input"
                  style={{ padding: '7px 10px', fontSize: 13, borderRadius: 7, height: 36, minHeight: 36, width: '100%', boxSizing: 'border-box' }}
                  value={inputData.pesticides_tonnes}
                  onChange={(e) => handleChange('pesticides_tonnes', parseFloat(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#E2E8F0' }}>
                    Crop Year
                  </label>
                  <span style={{ fontSize: 9.5, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', background: 'rgba(228, 253, 151, 0.1)', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>
                    1990–2026
                  </span>
                </div>
                <input
                  type="number"
                  className="form-input"
                  style={{ padding: '7px 10px', fontSize: 13, borderRadius: 7, height: 36, minHeight: 36, width: '100%', boxSizing: 'border-box' }}
                  value={inputData.year}
                  onChange={(e) => handleChange('year', parseInt(e.target.value) || 2026)}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="1990"
                  max="2035"
                />
              </div>
            </div>

            {/* Regional Agro-Context Summary */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.025)',
              borderRadius: 8,
              padding: '7px 10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#CBD5E1' }}>
                <span style={{ fontWeight: 700 }}>{inputData.country} Agro-Envelope ({inputData.crop})</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', fontSize: 9.5, fontWeight: 700 }}>FAO Reference</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '5px 8px', borderRadius: 5, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: 9, marginBottom: 1 }}>Precipitation</span>
                  <span style={{ color: '#F7F7EF', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                    {inputData.rainfall_mm > 1600 ? 'High Tropical' : inputData.rainfall_mm < 450 ? 'Arid Deficit' : 'Optimal Subtropical'}
                  </span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '5px 8px', borderRadius: 5, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: 9, marginBottom: 1 }}>Thermal Class</span>
                  <span style={{ color: inputData.avg_temp_c > 32 ? '#F87171' : '#F7F7EF', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                    {inputData.avg_temp_c > 32 ? 'Heat Stress' : inputData.avg_temp_c < 12 ? 'Temperate Chill' : 'Vegetative Optimum'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onRunPrediction}
              disabled={loading}
              style={{ 
                flex: 1, 
                padding: '10px 0', 
                fontSize: 14, 
                fontWeight: 800, 
                borderRadius: 8,
                boxShadow: '0 3px 12px var(--color-lime-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              {loading ? (
                <ButtonSpinner size={15} text="Estimating..." />
              ) : (
                <>
                  <SparklesIcon style={{ width: 15, height: 15 }} />
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
                gap: 4,
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--color-forest-border)',
                borderRadius: 8,
                color: '#CBD5E1',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ArrowPathIcon style={{ width: 13, height: 13 }} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Forecast Results & Confidence */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 14,
          border: '1.5px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid rgba(169, 180, 158, 0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheckIcon style={{ width: 17, height: 17, color: 'var(--color-lime)' }} />
              <h3 style={{ fontSize: 14.5, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>Forecast Results & Confidence</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {prediction && (
                <>
                  <button
                    type="button"
                    onClick={onNavigateToExplain}
                    title="View Factor Breakdown"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(228, 253, 151, 0.12)',
                      border: '1px solid rgba(228, 253, 151, 0.3)',
                      color: 'var(--color-lime)',
                      padding: '3px 8px',
                      borderRadius: 5,
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <PresentationChartLineIcon style={{ width: 12, height: 12 }} />
                    <span>Breakdown</span>
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateToWhatIf}
                    title="What-If Sweeps"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--color-forest-border)',
                      color: '#E2E8F0',
                      padding: '3px 8px',
                      borderRadius: 5,
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowsRightLeftIcon style={{ width: 12, height: 12 }} />
                    <span>What-If</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClearPrediction}
                    style={{
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      color: '#FCA5A5',
                      padding: '3px 8px',
                      borderRadius: 5,
                      fontSize: 10.5,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                </>
              )}
              {prediction ? (
                prediction.used_pilot_model ? (
                  <span style={{
                    fontSize: 9.5,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: 'rgba(52, 211, 153, 0.18)',
                    color: '#34D399',
                    padding: '2px 7px',
                    borderRadius: 100,
                    border: '1px solid rgba(52, 211, 153, 0.4)'
                  }}>
                    CLIMATE PILOT (ERA5)
                  </span>
                ) : (
                  <span style={{
                    fontSize: 9.5,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: 'rgba(228, 253, 151, 0.15)',
                    color: 'var(--color-lime)',
                    padding: '2px 7px',
                    borderRadius: 100,
                    border: '1px solid rgba(228, 253, 151, 0.25)'
                  }}>
                    PRODUCTION BASELINE
                  </span>
                )
              ) : (
                <span style={{
                  fontSize: 9.5,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  background: 'rgba(228, 253, 151, 0.15)',
                  color: 'var(--color-lime)',
                  padding: '2px 7px',
                  borderRadius: 100,
                  border: '1px solid rgba(228, 253, 151, 0.25)'
                }}>
                  READY FOR INFERENCE
                </span>
              )}
            </div>
          </div>

          {loading && !prediction ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--color-lime)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ButtonSpinner size={22} text="Calculating forecast..." />
            </div>
          ) : prediction ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              {/* Row 1: Unified Harvest Yield & 90% Statistical Coverage Interval Card */}
              <div style={{
                background: 'radial-gradient(circle at 30% 30%, #20311f 0%, #132012 100%)',
                borderRadius: 10,
                padding: '12px 16px',
                border: '1.5px solid var(--color-forest-border)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                alignItems: 'center'
              }}>
                {/* Left: Estimated Harvest Yield */}
                <div>
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Estimated Harvest Yield
                  </span>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-lime)', margin: '2px 0', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                    {prediction.predicted_yield_tonnes_per_ha.toFixed(2)}
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#F7F7EF', marginLeft: 6 }}>t/ha</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#CBD5E1', margin: 0, fontWeight: 500 }}>
                    Approximately <strong style={{ color: 'var(--color-lime)' }}>{(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)}</strong> quintals/hectare
                  </p>
                </div>

                {/* Right: 90% Statistical Coverage Interval */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: 8,
                  padding: '9px 14px',
                  border: '1px solid rgba(169, 180, 158, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#F7F7EF' }}>
                      90% Statistical Coverage
                    </span>
                    <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', background: 'rgba(228, 253, 151, 0.12)', border: '1px solid rgba(228, 253, 151, 0.25)', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>
                      CALIBRATED
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 8 }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 10, color: '#94A3B8', display: 'block' }}>Worst-Case (Min)</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#F7F7EF', fontFamily: 'var(--font-mono)' }}>
                        {prediction.conformal_interval_90.lower_bound.toFixed(2)} <span style={{ fontSize: 10.5, fontWeight: 600 }}>t/ha</span>
                      </span>
                    </div>
                    <div style={{ height: 26, width: 1, background: 'rgba(169, 180, 158, 0.25)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 10, color: '#94A3B8', display: 'block' }}>Best-Case (Max)</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>
                        {prediction.conformal_interval_90.upper_bound.toFixed(2)} <span style={{ fontSize: 10.5, fontWeight: 600 }}>t/ha</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Conformal Uncertainty Distribution Gauge */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 9,
                padding: '9px 14px',
                border: '1px solid rgba(169, 180, 158, 0.16)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, fontSize: 11.5 }}>
                  <span style={{ color: '#F7F7EF', fontWeight: 700 }}>Conformal Uncertainty Distribution</span>
                  <span style={{ color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 11 }}>
                    ±{(((prediction.conformal_interval_90.interval_width_tonnes ?? (prediction.conformal_interval_90.upper_bound - prediction.conformal_interval_90.lower_bound))) / 2).toFixed(2)} t/ha margin
                  </span>
                </div>
                {/* Gauge Track */}
                <div style={{ position: 'relative', width: '100%', height: 7, background: 'rgba(255, 255, 255, 0.09)', borderRadius: 4, overflow: 'visible', margin: '5px 0' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '100%',
                    borderRadius: 4,
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
                        top: -3,
                        width: 13,
                        height: 13,
                        borderRadius: '50%',
                        background: 'var(--color-lime)',
                        border: '2px solid #0E160D',
                        boxShadow: '0 0 8px var(--color-lime)',
                        transform: 'translateX(-50%)'
                      }} title={`Point Estimate: ${pred.toFixed(2)} t/ha`} />
                    );
                  })()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#CBD5E1', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  <span>Worst: <strong>{prediction.conformal_interval_90.lower_bound.toFixed(2)} t/ha</strong></span>
                  <span style={{ color: 'var(--color-lime)', fontWeight: 800 }}>Point Forecast: {prediction.predicted_yield_tonnes_per_ha.toFixed(2)} t/ha</span>
                  <span>Best: <strong>{prediction.conformal_interval_90.upper_bound.toFixed(2)} t/ha</strong></span>
                </div>
              </div>

              {/* Row 3: Climate Anomaly / Reliability Badge */}
              {prediction.climate_shift_detected ? (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 8,
                  padding: '7px 12px',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <ExclamationTriangleIcon style={{ width: 15, height: 15, color: '#F87171', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#FCA5A5', lineHeight: 1.2 }}>
                      CLIMATE SHIFT DETECTED ({prediction.climate_anomaly_z !== undefined ? `${prediction.climate_anomaly_z > 0 ? '+' : ''}${prediction.climate_anomaly_z.toFixed(2)}σ` : 'Anomaly'})
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Baseline {prediction.regional_climate_baseline?.temp_mean_c?.toFixed(1) ?? 'historical'}°C
                    </span>
                  </div>
                  <span style={{
                    fontSize: 9.5,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: 'rgba(239, 68, 68, 0.25)',
                    color: '#FCA5A5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0
                  }}>
                    {prediction.regional_reliability_tier || 'Moderate'} Tier
                  </span>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(52, 211, 153, 0.08)',
                  borderRadius: 8,
                  padding: '7px 12px',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <ShieldCheckIcon style={{ width: 15, height: 15, color: '#34D399', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--color-offwhite)', fontWeight: 600 }}>
                      Climate Alignment: <strong style={{ color: '#34D399' }}>Verified</strong>{' '}
                      {prediction.climate_anomaly_z !== undefined && (
                        <span style={{ color: 'var(--color-muted)', fontSize: 10 }}>
                          (z = {prediction.climate_anomaly_z > 0 ? '+' : ''}{prediction.climate_anomaly_z.toFixed(2)}σ)
                        </span>
                      )}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 9.5,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: '#34D399',
                    background: 'rgba(52, 211, 153, 0.14)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0
                  }}>
                    {prediction.regional_reliability_tier || 'High Confidence'} Tier
                  </span>
                </div>
              )}

              {/* Row 4: Side-by-side Top Factors & Farm Scale Projections */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.05fr 0.95fr',
                gap: 10
              }}>
                {/* Left Half: Top Factors */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: 9,
                  padding: '9px 12px',
                  border: '1px solid rgba(169, 180, 158, 0.16)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PresentationChartLineIcon style={{ width: 14, height: 14, color: 'var(--color-lime)' }} />
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: '#F7F7EF' }}>Top Factors Affecting Harvest</span>
                    </div>
                    <span style={{ fontSize: 9.5, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>IMPACT</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {(() => {
                      const friendlyMap: Record<string, string> = {
                        crop: 'Crop Type',
                        avg_temp: 'Temperature',
                        pesticides: 'Pest Protection',
                        effective_temp: 'Season Temp',
                        rainfall: 'Rainfall',
                        heat_stress_days: 'Heat Days',
                        irrigation_pct: 'Irrigation',
                        year: 'Farming Tech & Seeds',
                        effective_precip: 'Season Rain',
                        dry_spell_days: 'Dry Spell'
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
                            background: isPos ? 'rgba(74, 222, 128, 0.05)' : 'rgba(248, 113, 113, 0.05)',
                            borderRadius: 6,
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                            border: isPos ? '1px solid rgba(74, 222, 128, 0.22)' : '1px solid rgba(248, 113, 113, 0.22)'
                          }}>
                            <span style={{ fontSize: 11, color: '#F7F7EF', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.name}
                            </span>
                            <span style={{
                              fontSize: 11,
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              color: isPos ? '#4ADE80' : '#F87171',
                              flexShrink: 0
                            }}>
                              {isPos ? `+${item.val.toFixed(2)}` : item.val.toFixed(2)} t/ha
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Half: Farm Scale Projections */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: 9,
                  padding: '9px 12px',
                  border: '1px solid rgba(169, 180, 158, 0.16)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#F7F7EF' }}>
                      Farm-Scale Projections ({inputData.crop})
                    </span>
                    <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', fontWeight: 700 }}>HARVEST</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.035)', padding: '7px 6px', borderRadius: 6, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: 9.5, color: '#94A3B8', display: 'block', marginBottom: 2 }}>Smallholder (1 ha)</span>
                      <span style={{ fontSize: 13.5, fontWeight: 900, color: '#F7F7EF', fontFamily: 'var(--font-mono)' }}>
                        {(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)} <span style={{ fontSize: 10, fontWeight: 600 }}>qtl</span>
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.035)', padding: '7px 6px', borderRadius: 6, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: 9.5, color: '#94A3B8', display: 'block', marginBottom: 2 }}>Medium Farm (5 ha)</span>
                      <span style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>
                        {(prediction.predicted_yield_tonnes_per_ha * 5).toFixed(1)} <span style={{ fontSize: 10, fontWeight: 600 }}>t</span>
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.035)', padding: '7px 6px', borderRadius: 6, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: 9.5, color: '#94A3B8', display: 'block', marginBottom: 2 }}>Commercial (25 ha)</span>
                      <span style={{ fontSize: 13.5, fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                        {(prediction.predicted_yield_tonnes_per_ha * 25).toFixed(1)} <span style={{ fontSize: 10, fontWeight: 600 }}>t</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Substantial Awaiting State */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              textAlign: 'center',
              gap: 12
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(228, 253, 151, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-lime)',
                border: '1.5px solid rgba(228, 253, 151, 0.3)'
              }}>
                <SparklesIcon style={{ width: 22, height: 22 }} />
              </div>
              <div>
                <h4 style={{ fontSize: 15, color: 'var(--color-offwhite)', margin: '0 0 4px', fontWeight: 800 }}>
                  Awaiting Prediction Request
                </h4>
                <p style={{ fontSize: 12, maxWidth: 380, lineHeight: 1.4, margin: 0, color: 'var(--color-muted)' }}>
                  Configure environmental parameters on the left or select a <strong>Quick Agro-Climatic Preset</strong> below to preview crop forecasts.
                </p>
              </div>

              {/* Quick Presets */}
              <div style={{ width: '100%', maxWidth: 440 }}>
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
                        padding: '8px 10px',
                        color: 'var(--color-offwhite)',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-lime)';
                        e.currentTarget.style.background = 'rgba(228, 253, 151, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-forest-border)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                    >
                      <span style={{ fontWeight: 800, color: 'var(--color-lime)' }}>{preset.label}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>{preset.rainfall}mm · {preset.temp}°C</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Tensor Indicators */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                width: '100%',
                maxWidth: 440
              }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 6px', borderRadius: 7, border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                  <CloudIcon style={{ width: 15, height: 15, color: 'var(--color-lime)', margin: '0 auto 3px' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-offwhite)' }}>Rainfall Range</div>
                  <div style={{ fontSize: 9.5, color: 'var(--color-muted)' }}>100 – 3500 mm</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 6px', borderRadius: 7, border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                  <SunIcon style={{ width: 15, height: 15, color: '#FCD34D', margin: '0 auto 3px' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-offwhite)' }}>Thermal Range</div>
                  <div style={{ fontSize: 9.5, color: 'var(--color-muted)' }}>0.0 – 38.0 °C</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 6px', borderRadius: 7, border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                  <BeakerIcon style={{ width: 15, height: 15, color: '#93C5FD', margin: '0 auto 3px' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-offwhite)' }}>Pest Protection</div>
                  <div style={{ fontSize: 9.5, color: 'var(--color-muted)' }}>FAO Agro Standards</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
