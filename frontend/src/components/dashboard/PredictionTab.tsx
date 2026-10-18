import React from 'react';
import { Sprout, ShieldCheck, AlertTriangle, LineChart, GitCompare, Loader2 } from 'lucide-react';
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
    setInputData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 28 }}>
      {/* Input Parameters Form Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid var(--color-offwhite-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-offwhite-border)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(45, 62, 44, 0.08)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700 }}>Environmental Input Parameters</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted-light)' }}>Set region, crop species, and climate indicators</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Country & Crop Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary-light)', marginBottom: 6 }}>
                Country / Territory
              </label>
              <select
                className="form-input"
                value={inputData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              >
                {options?.countries.map(c => <option key={c} value={c}>{c}</option>) || <option value="India">India</option>}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary-light)', marginBottom: 6 }}>
                Crop Species
              </label>
              <select
                className="form-input"
                value={inputData.crop}
                onChange={(e) => handleChange('crop', e.target.value)}
              >
                {options?.crops.map(c => <option key={c} value={c}>{c}</option>) || <option value="Wheat">Wheat</option>}
              </select>
            </div>
          </div>

          {/* Rainfall Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary-light)' }}>Annual Aggregate Rainfall (mm/year)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-forest)' }}>{inputData.rainfall_mm} mm</span>
            </div>
            <input
              type="range"
              min="50"
              max="3500"
              step="10"
              value={inputData.rainfall_mm}
              onChange={(e) => handleChange('rainfall_mm', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--color-forest)' }}
            />
          </div>

          {/* Average Temperature Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary-light)' }}>Average Surface Temperature (°C)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-forest)' }}>{inputData.avg_temp_c} °C</span>
            </div>
            <input
              type="range"
              min="-5"
              max="42"
              step="0.5"
              value={inputData.avg_temp_c}
              onChange={(e) => handleChange('avg_temp_c', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--color-forest)' }}
            />
          </div>

          {/* Pesticide Usage Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary-light)' }}>Pesticides Applied (metric tonnes)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-forest)' }}>{inputData.pesticides_tonnes.toLocaleString()} t</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="500"
              value={inputData.pesticides_tonnes}
              onChange={(e) => handleChange('pesticides_tonnes', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--color-forest)' }}
            />
          </div>

          {/* Observation Year Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary-light)' }}>Observation Year</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-forest)' }}>{inputData.year}</span>
            </div>
            <input
              type="range"
              min="1990"
              max="2013"
              step="1"
              value={inputData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value) || 2000)}
              style={{ width: '100%', accentColor: 'var(--color-forest)' }}
            />
          </div>

          <button
            className="btn-primary"
            onClick={onRunPrediction}
            disabled={loading}
            style={{ width: '100%', padding: '14px 0', marginTop: 10, fontSize: 15 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Computing Production Inference...</span>
              </>
            ) : (
              <>
                <Sprout size={18} />
                <span>Predict Crop Yield</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Outcome & Uncertainty Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid var(--color-offwhite-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-offwhite-border)' }}>
          <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700 }}>Prediction Outcome & Uncertainty</h3>
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            background: 'rgba(45, 62, 44, 0.08)',
            color: 'var(--color-forest)',
            padding: '3px 8px',
            borderRadius: 4
          }}>
            PRODUCTION XGBOOST
          </span>
        </div>

        {prediction ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Main Yield Display */}
            <div style={{
              background: 'radial-gradient(circle at 50% 30%, #293B28 0%, #1A2719 100%)',
              borderRadius: 16,
              padding: '28px 24px',
              textAlign: 'center',
              color: 'var(--color-offwhite)',
              border: '1px solid var(--color-forest-border)'
            }}>
              <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
                ESTIMATED CROP YIELD
              </span>
              <div style={{ fontSize: 44, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-lime)', lineHeight: 1.1, margin: '8px 0' }}>
                {prediction.predicted_yield_tonnes_per_ha.toFixed(4)} <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-offwhite)' }}>tonnes/ha</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                {prediction.predicted_yield_hg_per_ha.toLocaleString(undefined, { maximumFractionDigits: 1 })} hectograms / hectare
              </span>
            </div>

            {/* Conformal Prediction Interval (Guaranteed 90%) */}
            <div style={{
              background: 'rgba(228, 253, 151, 0.12)',
              border: '1px solid rgba(45, 62, 44, 0.25)',
              borderRadius: 14,
              padding: '16px 18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={18} color="var(--color-forest)" />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                  Nominal 90% Conformal Prediction Interval:
                </span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-forest)', margin: '4px 0' }}>
                [{prediction.conformal_interval_90.lower_bound.toFixed(4)} — {prediction.conformal_interval_90.upper_bound.toFixed(4)}] tonnes/ha
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted-light)', lineHeight: 1.5, marginTop: 4 }}>
                Finite-sample non-parametric coverage calibrated using empirical quantiles of absolute error on holdout groups.
              </p>
            </div>

            {/* Standard Error Bounds */}
            <div style={{
              background: 'var(--color-offwhite)',
              border: '1px solid var(--color-offwhite-border)',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 12.5
            }}>
              <span style={{ color: 'var(--text-secondary-light)', fontWeight: 600 }}>Standard Error Bounds (±1.96 RMSE):</span>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-forest)', marginTop: 2 }}>
                [{prediction.confidence_interval.lower.toFixed(2)} — {prediction.confidence_interval.upper.toFixed(2)}] tonnes/ha
              </div>
            </div>

            {/* Advisory Warnings if any */}
            {prediction.warnings && prediction.warnings.length > 0 && (
              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: 12,
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B45309', fontWeight: 600, fontSize: 12.5, marginBottom: 4 }}>
                  <AlertTriangle size={15} />
                  <span>Advisory Environmental Warnings</span>
                </div>
                <ul style={{ fontSize: 12, color: '#92400E', paddingLeft: 18, lineHeight: 1.5 }}>
                  {prediction.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <button 
                className="btn-secondary-light" 
                onClick={onNavigateToExplain}
                style={{ flex: 1 }}
              >
                <LineChart size={15} />
                <span>View SHAP Explainability</span>
              </button>
              <button 
                className="btn-secondary-light" 
                onClick={onNavigateToWhatIf}
                style={{ flex: 1 }}
              >
                <GitCompare size={15} />
                <span>Run What-If Comparison</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted-light)', minHeight: 280, textAlign: 'center' }}>
            <Sprout size={36} strokeWidth={1.5} style={{ marginBottom: 12, color: 'var(--color-muted)' }} />
            <span style={{ fontSize: 14 }}>Click "Predict Crop Yield" to run inference on the production model.</span>
          </div>
        )}
      </div>
    </div>
  );
};
