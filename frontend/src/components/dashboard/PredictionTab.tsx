import React from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  PresentationChartLineIcon, 
  ArrowsRightLeftIcon, 
  ArrowPathIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
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

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(340px, 460px) 1fr',
      gap: 28,
      alignItems: 'start'
    }}>
      {/* Parameter Control Form */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(169, 180, 158, 0.15)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChartBarIcon style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, color: 'var(--color-offwhite)', fontWeight: 700 }}>Environmental & Crop Parameters</h3>
            <span style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>Select region, crop, and expected climate factors</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Country & Crop Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                Country / Region
              </label>
              <select
                className="form-input"
                value={inputData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              >
                {options?.countries.map((c) => (
                  <option key={c} value={c} style={{ background: '#172416' }}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                Crop Species
              </label>
              <select
                className="form-input"
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
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)' }}>
                Average Rainfall (mm/year)
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-lime)', fontWeight: 700 }}>
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
              style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer' }}
            />
          </div>

          {/* Temperature Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)' }}>
                Mean Temperature (°C)
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-lime)', fontWeight: 700 }}>
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
              style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer' }}
            />
          </div>

          {/* Pesticides */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)' }}>
                Pesticide Usage (tonnes)
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-lime)', fontWeight: 700 }}>
                {inputData.pesticides_tonnes.toLocaleString()} t
              </span>
            </div>
            <input
              type="number"
              className="form-input"
              value={inputData.pesticides_tonnes}
              onChange={(e) => handleChange('pesticides_tonnes', parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>

          {/* Harvest Year */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
              Projection Year
            </label>
            <input
              type="number"
              className="form-input"
              value={inputData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value) || 2026)}
              min="1990"
              max="2035"
            />
          </div>

          {/* Run Inference Action */}
          <button
            type="button"
            className="btn-primary"
            onClick={onRunPrediction}
            disabled={loading}
            style={{ width: '100%', padding: '14px 0', marginTop: 10, fontSize: 15 }}
          >
            {loading ? (
              <>
                <ArrowPathIcon style={{ width: 18, height: 18 }} className="animate-spin" />
                <span>Calculating Yield Forecast...</span>
              </>
            ) : (
              <>
                <SparklesIcon style={{ width: 18, height: 18 }} />
                <span>Estimate Crop Yield</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Outcome & Uncertainty Card */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(169, 180, 158, 0.15)' }}>
          <h3 style={{ fontSize: 18, color: 'var(--color-offwhite)', fontWeight: 700 }}>Forecast Results & Confidence</h3>
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            background: 'rgba(228, 253, 151, 0.15)',
            color: 'var(--color-lime)',
            padding: '3px 10px',
            borderRadius: 100
          }}>
            PRODUCTION XGBOOST
          </span>
        </div>

        {prediction ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Main Yield Display */}
            <div style={{
              background: 'radial-gradient(circle at 50% 30%, #263825 0%, #172416 100%)',
              borderRadius: 16,
              padding: '28px 24px',
              border: '1px solid var(--color-forest-border)',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Estimated Harvest Yield
              </span>
              <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--color-lime)', margin: '6px 0', fontFamily: 'var(--font-display)' }}>
                {prediction.predicted_yield_tonnes_per_ha.toFixed(2)}
                <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-offwhite)', marginLeft: 6 }}>t/ha</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                Approximately {(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)} quintals per hectare
              </p>
            </div>

            {/* 90% Confidence Interval Box */}
            <div style={{
              background: 'rgba(18, 27, 17, 0.8)',
              borderRadius: 14,
              padding: '18px 20px',
              border: '1px solid rgba(169, 180, 158, 0.18)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheckIcon style={{ width: 18, height: 18, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-offwhite)' }}>
                    90% Confidence Interval
                  </span>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)' }}>
                  RELIABLE RANGE
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '12px 0',
                background: 'rgba(25, 37, 24, 0.6)',
                borderRadius: 10
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Low Estimate (Min)</span>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
                    {prediction.conformal_interval_90.lower_bound.toFixed(2)} t/ha
                  </div>
                </div>
                <div style={{ height: 28, width: 1, background: 'rgba(169, 180, 158, 0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>High Estimate (Max)</span>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
                    {prediction.conformal_interval_90.upper_bound.toFixed(2)} t/ha
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 10, lineHeight: 1.5 }}>
                Under identical weather patterns, actual harvest yield is mathematically expected to fall within this range 9 times out of 10.
              </p>
            </div>

            {/* Advisory Warnings */}
            {prediction.warnings && prediction.warnings.length > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start'
              }}>
                <ExclamationTriangleIcon style={{ width: 18, height: 18, color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 12.5, color: '#FDE68A' }}>
                  {prediction.warnings.map((w: string, idx: number) => <div key={idx}>{w}</div>)}
                </div>
              </div>
            )}

            {/* Quick Analysis Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <button
                className="btn-secondary"
                onClick={onNavigateToExplain}
                style={{ flex: 1, padding: '11px 0', fontSize: 13.5 }}
              >
                <PresentationChartLineIcon style={{ width: 16, height: 16 }} />
                <span>Explain Influences</span>
              </button>
              <button
                className="btn-secondary"
                onClick={onNavigateToWhatIf}
                style={{ flex: 1, padding: '11px 0', fontSize: 13.5 }}
              >
                <ArrowsRightLeftIcon style={{ width: 16, height: 16 }} />
                <span>What-If Scenario</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--color-muted)'
          }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: 'rgba(228, 253, 151, 0.1)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <SparklesIcon style={{ width: 26, height: 26 }} />
            </div>
            <h4 style={{ fontSize: 16, color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 6 }}>
              Ready for Prediction
            </h4>
            <p style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>
              Configure your environmental factors on the left and click "Estimate Crop Yield" to view production estimates and confidence intervals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
