import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ModelComparisonResponse, GlobalImportanceResponse } from '../../types';
import * as api from '../../api';

interface BenchmarksTabProps {
  benchmarks: ModelComparisonResponse | null;
}

export const BenchmarksTab: React.FC<BenchmarksTabProps> = ({ benchmarks }) => {
  const [globalImportance, setGlobalImportance] = useState<GlobalImportanceResponse | null>(null);

  useEffect(() => {
    api.fetchGlobalImportance().then(setGlobalImportance).catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        padding: '26px 30px',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 800 }}>
            Model Benchmarks & Performance Comparison
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 4 }}>
            Empirical evaluation across 28,242 agricultural records. XGBoost serves as our active production engine.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#141F13', borderBottom: '1px solid var(--color-forest-border)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Model Name</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Algorithm Family</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-lime)' }}>Accuracy (R²)</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Error Margin (RMSE)</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Avg Error (MAE)</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Deployment Status</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks?.models.map((m) => (
                <tr key={m.model_name} style={{ borderBottom: '1px solid rgba(169, 180, 158, 0.1)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>
                    {m.model_name}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--color-muted)' }}>
                    {m.model_family}
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-lime)', fontSize: 14.5 }}>
                    {m.r2_random_split.toFixed(4)}
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>
                    {m.rmse_random_split_tonnes.toFixed(3)} t/ha
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>
                    {m.mae_random_split_tonnes.toFixed(3)} t/ha
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {m.is_deployed_production_model ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'var(--color-lime)',
                        color: '#121B11',
                        padding: '3px 10px',
                        borderRadius: 100,
                        fontSize: 11.5,
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <CheckCircle2 size={13} /> ACTIVE
                      </span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>BENCHMARK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {globalImportance && (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 20,
          padding: '26px 30px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: 19, color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 4 }}>
            Global Importance of Agricultural Drivers
          </h3>
          <span style={{ fontSize: 13, color: 'var(--color-muted)', display: 'block', marginBottom: 20 }}>
            Relative influence across all predictions • {globalImportance.deployed_model}
          </span>

          <div style={{ width: '100%', height: 270 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={globalImportance.features}
                margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 180, 158, 0.12)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-offwhite)' }} width={160} />
                <Tooltip 
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Influence Weight']}
                  contentStyle={{ background: '#141F13', borderRadius: 10, border: '1px solid var(--color-forest-border)', color: '#F7F7EF', fontSize: 12 }}
                />
                <Bar dataKey="importance" fill="#E4FD97" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
