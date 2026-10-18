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
      {/* Benchmark Table Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 18,
        padding: '24px 28px',
        border: '1px solid var(--color-offwhite-border)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700 }}>
            Empirical Multi-Model Evaluation Record
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted-light)', marginTop: 2 }}>
            Audited results across 28,242 FAOSTAT records with 4-way disjoint group holdouts.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--color-offwhite)', borderBottom: '1px solid var(--color-offwhite-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Model Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Family</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>R² Score</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>RMSE (t/ha)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>MAE (t/ha)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks?.models.map((m) => (
                <tr key={m.model_name} style={{ borderBottom: '1px solid var(--color-offwhite-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                    {m.model_name}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary-light)' }}>
                    {m.model_family}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-forest)' }}>
                    {m.r2_random_split.toFixed(4)}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                    {m.rmse_random_split_tonnes.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                    {m.mae_random_split_tonnes.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {m.is_deployed_production_model ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'rgba(228, 253, 151, 0.4)',
                        color: 'var(--color-forest-dark)',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <CheckCircle2 size={12} /> SERVED
                      </span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted-light)', fontFamily: 'var(--font-mono)' }}>BENCHMARK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Importance Chart */}
      {globalImportance && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 18,
          padding: '24px 28px',
          border: '1px solid var(--color-offwhite-border)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700, marginBottom: 4 }}>
            Global Feature Importance (Gini Gain)
          </h3>
          <span style={{ fontSize: 13, color: 'var(--text-muted-light)', display: 'block', marginBottom: 20 }}>
            {globalImportance.method} • {globalImportance.deployed_model}
          </span>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={globalImportance.features}
                margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6E7E67' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#182217' }} width={160} />
                <Tooltip 
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Relative Gain']}
                  contentStyle={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E3E7DE', fontSize: 12 }}
                />
                <Bar dataKey="importance" fill="var(--color-forest)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
