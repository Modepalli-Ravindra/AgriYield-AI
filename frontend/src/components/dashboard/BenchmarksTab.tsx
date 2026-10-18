import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ModelComparisonResponse, GlobalImportanceResponse } from '../../types';
import * as api from '../../api';

interface BenchmarksTabProps {
  benchmarks: ModelComparisonResponse | null;
}

const cleanFeatureName = (name: string) => {
  if (name.includes('Crop')) return 'Crop Species';
  if (name.includes('Country') || name.includes('Area')) return 'Country / Region';
  if (name.includes('Temperature') || name.includes('temp')) return 'Avg Temperature';
  if (name.includes('Pesticide')) return 'Pesticides Usage';
  if (name.includes('Rainfall')) return 'Annual Rainfall';
  if (name.includes('Year')) return 'Observation Year';
  return name.split('(')[0].trim();
};

export const BenchmarksTab: React.FC<BenchmarksTabProps> = ({ benchmarks }) => {
  const [globalImportance, setGlobalImportance] = useState<GlobalImportanceResponse | null>(null);

  useEffect(() => {
    api.fetchGlobalImportance().then(setGlobalImportance).catch(console.error);
  }, []);

  const chartData = globalImportance?.features.map((f) => ({
    ...f,
    cleanName: cleanFeatureName(f.name),
    percentage: (Number(f.importance) * 100).toFixed(1)
  })) || [];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.25fr 1fr',
      gap: 14,
      alignItems: 'stretch',
      height: '100%',
      flex: 1,
      minHeight: 0,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Left Split Card: Benchmark Table */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 16,
        padding: '20px 22px',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(169, 180, 158, 0.12)' }}>
            <div>
              <h3 style={{ fontSize: 16.5, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                Model Benchmarks & Comparison
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '4px 0 0' }}>
                Empirical evaluation across 28,242 agricultural records.
              </p>
            </div>
            <span style={{
              fontSize: 10.5,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              padding: '3px 9px',
              borderRadius: 100,
              border: '1px solid rgba(228, 253, 151, 0.25)'
            }}>
              5 ALGORITHMS
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--color-forest-border)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Model</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-muted)' }}>Family</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-lime)' }}>Accuracy (R²)</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-offwhite)' }}>RMSE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks?.models.map((m) => (
                  <tr key={m.model_name} style={{ borderBottom: '1px solid rgba(169, 180, 158, 0.08)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-offwhite)' }}>
                      {m.model_name}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)', fontSize: 11.5 }}>
                      {m.model_family}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-lime)', fontSize: 13.5 }}>
                      {m.r2_random_split.toFixed(4)}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)', fontSize: 12 }}>
                      {m.rmse_random_split_tonnes.toFixed(3)} t/ha
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {m.is_deployed_production_model ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'var(--color-lime)',
                          color: '#121B11',
                          padding: '2px 8px',
                          borderRadius: 100,
                          fontSize: 10.5,
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)'
                        }}>
                          <CheckCircle2 size={11} /> ACTIVE
                        </span>
                      ) : (
                        <span style={{ fontSize: 10.5, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>BENCHMARK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: 11.5,
          color: 'var(--color-muted)',
          marginTop: 14
        }}>
          <span>Active Engine: <strong>XGBoost Regressor</strong></span>
          <span>CV Strategy: <strong>Disjoint Regional Folds</strong></span>
        </div>
      </div>

      {/* Right Split Card: Global Feature Importance Chart */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 16,
        padding: '20px 22px',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(169, 180, 158, 0.12)' }}>
            <div>
              <h3 style={{ fontSize: 16.5, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                Global Importance of Drivers
              </h3>
              <span style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginTop: 4 }}>
                Relative influence weights • XGBoost TreeSHAP
              </span>
            </div>
            <span style={{
              fontSize: 10.5,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-lime)',
              background: 'rgba(228, 253, 151, 0.1)',
              padding: '3px 8px',
              borderRadius: 4
            }}>
              NORMALIZED %
            </span>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 8, right: 24, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={false}
                  unit="%"
                />
                <YAxis 
                  type="category" 
                  dataKey="cleanName" 
                  tick={{ fontSize: 11.5, fill: 'var(--color-offwhite)' }} 
                  width={120}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Influence Weight']}
                  contentStyle={{ 
                    background: '#121B11', 
                    borderRadius: 8, 
                    border: '1px solid var(--color-lime)', 
                    color: '#F7F7EF', 
                    fontSize: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                  }}
                />
                <Bar dataKey="importance" fill="var(--color-lime)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: 11.5,
          color: 'var(--color-muted)',
          marginTop: 14
        }}>
          <span>Evaluated on 6 environmental dimensions</span>
          <span style={{ color: 'var(--color-lime)', fontWeight: 600 }}>R² = 0.9714</span>
        </div>
      </div>
    </div>
  );
};
