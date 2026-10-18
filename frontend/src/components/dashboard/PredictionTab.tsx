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
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(169, 180, 158, 0.15)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={20} />
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
                {options?.countries.map(c => <option key={c} value={c}>{c}</option>) || <option value="India">India</option>}
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
                {options?.crops.map(c => <option key={c} value={c}>{c}</option>) || <option value="Wheat">Wheat</option>}
              </select>
            </div>
          </div>

          {/* Rainfall Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--color-muted)' }}>Expected Annual Rainfall (mm)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)' }}>{inputData.rainfall_mm} mm</span>
            </div>
            <input
              type="range"
              min="50"
              max="3500"
              step="10"
              value={inputData.rainfall_mm}
              onChange={(e) => handleChange('rainfall_mm', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--color-lime)' }}
            />
          </div>

          {/* Average Temperature Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--color-muted)' }}>Average Growing Temperature (°C)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)' }}>{inputData.avg_temp_c} °C</span>
            </div>
            <input
              type="range"
              min="-5"
              max="42"
              step="0.5"
              value={inputData.avg_temp_c}
              onChange={(e) => handleChange('avg_temp_c', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--color-lime)' }}
            />
          </div>

          {/* Pesticide Usage Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--color-muted)' }}>Pesticides Applied (tonnes)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)' }}>{inputData.pesticides_tonnes.toLocaleString()} t</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="500"
              value={inputData.pesticides_tonnes}
              onChange={(e) => handleChange('pesticides_tonnes', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--color-lime)' }}
            />
          </div>

          {/* Observation Year Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--color-muted)' }}>Harvest Year Reference</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)' }}>{inputData.year}</span>
            </div>
            <input
              type="range"
              min="1990"
              max="2013"
              step="1"
              value={inputData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value) || 2000)}
              style={{ width: '100%', accentColor: 'var(--color-lime)' }}
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
                <span>Calculating Yield Forecast...</span>
              </>
            ) : (
              <>
                <Sprout size={18} />
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
                  <ShieldCheck size={18} style={{ color: 'var(--color-lime)' }} />
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
                <AlertTriangle size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
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
                <LineChart size={15} />
                <span>Explain Influences</span>
              </button>
              <button
                className="btn-secondary"
                onClick={onNavigateToWhatIf}
                style={{ flex: 1, padding: '11px 0', fontSize: 13.5 }}
              >
                <GitCompare size={15} />
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
              <Sprout size={26} />
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
