import React from 'react';
import { LineChart as LineChartIcon, Loader2 } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import type { ExplainResponse } from '../../types';

interface ExplainTabProps {
  explainData: ExplainResponse | null;
  loading: boolean;
  onRunExplain: () => void;
}

export const ExplainTab: React.FC<ExplainTabProps> = ({ explainData, loading, onRunExplain }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header card */}
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
            TreeSHAP Local Feature Attribution
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted-light)', marginTop: 2 }}>
            Exact Shapley additive decomposition: base value + sum of attributions = predicted yield.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onRunExplain}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Computing TreeSHAP...</span>
            </>
          ) : (
            <>
              <LineChartIcon size={16} />
              <span>Compute Explanations</span>
            </>
          )}
        </button>
      </div>

      {explainData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          {/* Chart card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: 24,
            border: '1px solid var(--color-offwhite-border)',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <h4 style={{ fontSize: 16, color: 'var(--color-forest-dark)', marginBottom: 4, fontWeight: 700 }}>
              Feature Contributions (t/ha Delta from Base)
            </h4>
            <span style={{ fontSize: 12, color: 'var(--text-muted-light)', display: 'block', marginBottom: 20 }}>
              Base Value: {explainData.base_value.toFixed(3)} t/ha • Predicted: {explainData.prediction_tonnes_per_ha.toFixed(3)} t/ha
            </span>

            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={explainData.feature_contributions}
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6E7E67' }} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: '#182217' }} width={110} />
                  <Tooltip 
                    formatter={(val: any) => [`${Number(val).toFixed(4)} t/ha`, 'SHAP Value']}
                    contentStyle={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E3E7DE', fontSize: 12 }}
                  />
                  <ReferenceLine x={0} stroke="#2D3E2C" strokeWidth={1.5} />
                  <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
                    {explainData.feature_contributions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.shap_value >= 0 ? '#2D3E2C' : '#DC2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown List */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: 24,
            border: '1px solid var(--color-offwhite-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h4 style={{ fontSize: 16, color: 'var(--color-forest-dark)', marginBottom: 16, fontWeight: 700 }}>
              Attribution Summary & Mathematical Additivity
            </h4>

            <div style={{
              background: 'var(--color-offwhite)',
              borderRadius: 12,
              padding: '14px 16px',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--text-secondary-light)',
              marginBottom: 18,
              border: '1px solid var(--color-offwhite-border)'
            }}>
              {explainData.summary_text}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              {explainData.feature_contributions.map(fc => (
                <div 
                  key={fc.feature}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: fc.shap_value >= 0 ? 'rgba(45, 62, 44, 0.04)' : 'rgba(220, 38, 38, 0.04)',
                    border: '1px solid var(--color-offwhite-border)',
                    fontSize: 13
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{fc.feature}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted-light)' }}>{fc.impact}</span>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 700, 
                      color: fc.shap_value >= 0 ? '#16A34A' : '#DC2626' 
                    }}>
                      {fc.shap_value >= 0 ? `+${fc.shap_value.toFixed(4)}` : fc.shap_value.toFixed(4)} t/ha
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 18,
          padding: 60,
          textAlign: 'center',
          color: 'var(--text-muted-light)',
          border: '1px solid var(--color-offwhite-border)'
        }}>
          Click "Compute Explanations" to run real TreeSHAP attribution on the active environmental inputs.
        </div>
      )}
    </div>
  );
};
