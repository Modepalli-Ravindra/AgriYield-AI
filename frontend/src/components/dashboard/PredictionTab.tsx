import React from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  PresentationChartLineIcon, 
  ArrowsRightLeftIcon, 
  SparklesIcon 
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
      gridTemplateColumns: 'minmax(320px, 420px) 1fr',
      gap: 16,
      alignItems: 'start'
    }}>
      {/* Parameter Control Form */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 14,
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '16px 18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(169, 180, 158, 0.14)' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChartBarIcon style={{ width: 16, height: 16 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, color: 'var(--color-offwhite)', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Environmental Parameters</h3>
            <span style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Configure regional and climate variables</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Country & Crop Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
                Country / Region
              </label>
              <select
                className="form-input"
                style={{ padding: '8px 10px', fontSize: 12.5 }}
                value={inputData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              >
                {options?.countries.map((c) => (
                  <option key={c} value={c} style={{ background: '#172416' }}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
                Crop Species
              </label>
              <select
                className="form-input"
                style={{ padding: '8px 10px', fontSize: 12.5 }}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-muted)' }}>
                Average Rainfall
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-lime)', fontWeight: 700 }}>
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
              style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer', height: 4 }}
            />
          </div>

          {/* Temperature Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-muted)' }}>
                Mean Temperature
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-lime)', fontWeight: 700 }}>
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
              style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer', height: 4 }}
            />
          </div>

          {/* Pesticides & Year in a two-column row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
                Pesticide Usage (tonnes)
              </label>
              <input
                type="number"
                className="form-input"
                style={{ padding: '8px 10px', fontSize: 12.5 }}
                value={inputData.pesticides_tonnes}
                onChange={(e) => handleChange('pesticides_tonnes', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
                Projection Year
              </label>
              <input
                type="number"
                className="form-input"
                style={{ padding: '8px 10px', fontSize: 12.5 }}
                value={inputData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value) || 2026)}
                min="1990"
                max="2035"
              />
            </div>
          </div>

          {/* Run Inference Action */}
          <button
            type="button"
            className="btn-primary"
            onClick={onRunPrediction}
            disabled={loading}
            style={{ width: '100%', padding: '11px 0', marginTop: 6, fontSize: 13.5, borderRadius: 10 }}
          >
            {loading ? (
              <ButtonSpinner size={16} text="Calculating Yield Forecast..." />
            ) : (
              <>
                <SparklesIcon style={{ width: 16, height: 16 }} />
                <span>Estimate Crop Yield</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Outcome & Uncertainty Card */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 14,
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(169, 180, 158, 0.14)' }}>
          <h3 style={{ fontSize: 15, color: 'var(--color-offwhite)', fontWeight: 700, margin: 0 }}>Forecast Results & Confidence</h3>
          <span style={{
            fontSize: 10.5,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            background: 'rgba(228, 253, 151, 0.15)',
            color: 'var(--color-lime)',
            padding: '3px 8px',
            borderRadius: 100
          }}>
            PRODUCTION XGBOOST
          </span>
        </div>

        {loading ? (
          <AIEngineLoader 
            title="Terraflect Inference Pipeline"
            subtitle="Calibrating 300 tree estimators, evaluating climate tensors & calculating 90% conformal intervals..."
          />
        ) : prediction ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Main Yield Display */}
            <div style={{
              background: 'radial-gradient(circle at 50% 30%, #223321 0%, #152214 100%)',
              borderRadius: 12,
              padding: '18px 16px',
              border: '1px solid var(--color-forest-border)',
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)'
            }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Estimated Harvest Yield
              </span>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-lime)', margin: '4px 0', fontFamily: 'var(--font-display)', lineHeight: 1.15 }}>
                {prediction.predicted_yield_tonnes_per_ha.toFixed(2)}
                <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-offwhite)', marginLeft: 5 }}>t/ha</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0 }}>
                Approximately {(prediction.predicted_yield_tonnes_per_ha * 10).toFixed(1)} quintals per hectare
              </p>
            </div>

            {/* 90% Confidence Interval Box */}
            <div style={{
              background: 'rgba(18, 27, 17, 0.8)',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid rgba(169, 180, 158, 0.18)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheckIcon style={{ width: 16, height: 16, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-offwhite)' }}>
                    90% Statistical Coverage Interval
                  </span>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)' }}>
                  RELIABLE RANGE
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '10px 0',
                background: 'rgba(25, 37, 24, 0.6)',
                borderRadius: 8
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>Low Estimate (Min)</span>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
                    {prediction.conformal_interval_90.lower_bound.toFixed(2)} t/ha
                  </div>
                </div>
                <div style={{ height: 24, width: 1, background: 'rgba(169, 180, 158, 0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>High Estimate (Max)</span>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
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
                padding: '10px 14px',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start'
              }}>
                <ExclamationTriangleIcon style={{ width: 16, height: 16, color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#FDE68A' }}>
                  {prediction.warnings.map((w: string, idx: number) => <div key={idx}>{w}</div>)}
                </div>
              </div>
            )}

            {/* Quick Actions to other tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToExplain}
                style={{ padding: '8px 12px', fontSize: 12.5, borderRadius: 8, justifyContent: 'center' }}
              >
                <PresentationChartLineIcon style={{ width: 15, height: 15 }} />
                <span>TreeSHAP Factors</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateToWhatIf}
                style={{ padding: '8px 12px', fontSize: 12.5, borderRadius: 8, justifyContent: 'center' }}
              >
                <ArrowsRightLeftIcon style={{ width: 15, height: 15 }} />
                <span>What-If Sweeps</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--color-muted)'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(228, 253, 151, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              color: 'var(--color-lime)'
            }}>
              <SparklesIcon style={{ width: 24, height: 24 }} />
            </div>
            <h4 style={{ fontSize: 15, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
              Awaiting Prediction Request
            </h4>
            <p style={{ fontSize: 12.5, maxWidth: 320, lineHeight: 1.5, margin: 0 }}>
              Adjust climate sliders on the left and click <strong>Estimate Crop Yield</strong> to compute harvest prediction with 90% confidence bounds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
