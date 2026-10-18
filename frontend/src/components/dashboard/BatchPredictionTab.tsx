import React, { useState } from 'react';
import { Layers, Loader2, AlertCircle } from 'lucide-react';
import type { YieldInput, BatchItemResult } from '../../types';
import * as api from '../../api';

// Pre-configured diverse multi-scenario sample preset (up to 5 items)
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
      {/* Batch Overview Header */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 18,
        padding: '24px 28px',
        border: '1px solid var(--color-offwhite-border)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700 }}>
            Batch Prediction & Scenario Queue
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted-light)', marginTop: 2 }}>
            Simulate up to 50 concurrent agricultural scenarios with conformal bounds.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleRunBatch}
          disabled={loading || items.length === 0}
          style={{ padding: '10px 20px', fontSize: 14 }}
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
          background: '#FDF2F2',
          border: '1px solid #F87171',
          borderRadius: 10,
          padding: '12px 16px',
          color: '#B91C1C',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 18,
        border: '1px solid var(--color-offwhite-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--color-offwhite)', borderBottom: '1px solid var(--color-offwhite-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>#</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Country</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Crop</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Rainfall</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Avg Temp</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Pesticides</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Predicted Yield</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>90% Conformal Interval</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const res = results[idx];
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-offwhite-border)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted-light)' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>{it.country}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary-light)' }}>{it.crop}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{it.rainfall_mm} mm</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{it.avg_temp_c} °C</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{it.pesticides_tonnes.toLocaleString()} t</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-forest)' }}>
                      {res ? `${res.predicted_yield_tonnes_per_ha.toFixed(3)} t/ha` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                      {res ? (
                        <span style={{ background: 'rgba(228, 253, 151, 0.25)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          [{res.conformal_interval_90.lower_bound.toFixed(2)} — {res.conformal_interval_90.upper_bound.toFixed(2)}]
                        </span>
                      ) : '—'}
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
