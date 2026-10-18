import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { HistoryRecord } from '../../types';
import * as api from '../../api';

export const HistoryTab: React.FC = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.fetchPredictionHistory()
      .then(res => setRecords(res.records || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 18,
        padding: '24px 28px',
        border: '1px solid var(--color-offwhite-border)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700 }}>
            Prediction Audit Trail
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted-light)', marginTop: 2 }}>
            Authenticated query history persisted in InsForge PostgreSQL with strict user-level isolation.
          </p>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 700,
          background: 'var(--color-offwhite)',
          padding: '4px 12px',
          borderRadius: 6,
          color: 'var(--color-forest)'
        }}>
          {records.length} RECORDS SAVED
        </span>
      </div>

      <div style={{
        background: '#FFFFFF',
        borderRadius: 18,
        border: '1px solid var(--color-offwhite-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted-light)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <span>Loading audit history...</span>
          </div>
        ) : error ? (
          <div style={{ padding: 36, textAlign: 'center', color: '#DC2626', fontSize: 13 }}>
            {error}
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted-light)' }}>
            No prediction history recorded yet. Run a prediction to create an audit record.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--color-offwhite)', borderBottom: '1px solid var(--color-offwhite-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Region</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Crop</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Year</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Rainfall</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Avg Temp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Predicted Yield</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>90% Bounds</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-offwhite-border)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted-light)' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>{r.country}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary-light)' }}>{r.crop}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{r.year}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{r.rainfall_mm} mm</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{r.avg_temp_c} °C</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-forest)' }}>
                      {r.predicted_yield_tonnes_per_ha ? `${r.predicted_yield_tonnes_per_ha.toFixed(3)} t/ha` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {r.conformal_lower_bound !== undefined && r.conformal_upper_bound !== undefined ? (
                        <span style={{ background: 'rgba(228, 253, 151, 0.25)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          [{r.conformal_lower_bound.toFixed(2)} — {r.conformal_upper_bound.toFixed(2)}]
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
