import React, { useState } from 'react';
import { Layers, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { YieldInput, BatchItemResult } from '../../types';
import * as api from '../../api';

const DEFAULT_SCENARIOS: YieldInput[] = [
  { country: 'India', crop: 'Wheat', year: 2013, rainfall_mm: 1050, avg_temp_c: 25.5, pesticides_tonnes: 50000 },
  { country: 'United States', crop: 'Maize', year: 2012, rainfall_mm: 980, avg_temp_c: 21.0, pesticides_tonnes: 45000 },
  { country: 'France', crop: 'Wheat', year: 2011, rainfall_mm: 820, avg_temp_c: 16.5, pesticides_tonnes: 14000 },
  { country: 'Germany', crop: 'Potatoes', year: 2010, rainfall_mm: 780, avg_temp_c: 14.8, pesticides_tonnes: 21000 },
  { country: 'Brazil', crop: 'Soybeans', year: 2013, rainfall_mm: 1450, avg_temp_c: 24.5, pesticides_tonnes: 62000 }
];

export const BatchPredictionTab: React.FC = () => {
  const [items] = useState<YieldInput[]>(DEFAULT_SCENARIOS);
  const [results, setResults] = useState<BatchItemResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunBatch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.predictYieldBatch(items);
      setResults(res.predictions);
    } catch (err: any) {
      setError(err.message || 'Batch prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        padding: '24px 28px',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 800 }}>
            Batch Prediction & Scenario Queue
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 4 }}>
            Estimate multiple agricultural scenarios simultaneously (up to 50 items) with conformal uncertainty bounds.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleRunBatch}
          disabled={loading || items.length === 0}
          style={{ padding: '11px 22px', fontSize: 14 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing Batch...</span>
            </>
          ) : (
            <>
              <Layers size={16} />
              <span>Run Batch Prediction ({items.length} Scenarios)</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 12,
          padding: '12px 16px',
          color: '#FCA5A5',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        border: '1px solid var(--color-forest-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#141F13', borderBottom: '1px solid var(--color-forest-border)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>#</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Country</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Crop</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Year</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Rainfall</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Avg Temp</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-lime)' }}>Predicted Yield</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>90% Bounds (Min–Max)</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const res = results[idx];
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(169, 180, 158, 0.1)' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>{idx + 1}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>{it.country}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--color-offwhite)' }}>
                      <span style={{
                        background: 'rgba(228, 253, 151, 0.12)',
                        color: 'var(--color-lime)',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontWeight: 600
                      }}>
                        {it.crop}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>{it.year}</td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>{it.rainfall_mm} mm</td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>{it.avg_temp_c}°C</td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14, color: 'var(--color-lime)' }}>
                      {res?.predicted_yield_tonnes_per_ha ? `${res.predicted_yield_tonnes_per_ha.toFixed(2)} t/ha` : 'Pending'}
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
                      {res?.conformal_interval_90 ? (
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--color-forest-border)',
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontWeight: 600,
                          color: 'var(--color-offwhite)'
                        }}>
                          {res.conformal_interval_90.lower_bound.toFixed(2)} – {res.conformal_interval_90.upper_bound.toFixed(2)} t/ha
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {res ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 12, fontWeight: 700 }}>
                          <CheckCircle size={14} /> Ready
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Queued</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
