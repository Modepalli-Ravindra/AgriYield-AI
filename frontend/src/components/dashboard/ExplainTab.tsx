import React from 'react';
import { LineChart as LineChartIcon, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
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
            Why This Yield? (Factor Contributions)
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 4 }}>
            See transparently how each environmental factor (rainfall, temperature, pesticides) pushed the harvest above or below average.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onRunExplain}
          disabled={loading}
          style={{ padding: '11px 22px', fontSize: 14 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing Factor Impact...</span>
            </>
          ) : (
            <>
              <LineChartIcon size={16} />
              <span>Calculate Factor Breakdown</span>
            </>
          )}
        </button>
      </div>

      {explainData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 20,
            padding: 26,
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 4, fontWeight: 700 }}>
              Yield Impact by Environmental Factor (t/ha)
            </h4>
            <span style={{ fontSize: 12.5, color: 'var(--color-muted)', display: 'block', marginBottom: 20 }}>
              Regional Base: {explainData.base_value.toFixed(2)} t/ha • Final Predicted Yield: {explainData.prediction_tonnes_per_ha.toFixed(2)} t/ha
            </span>

            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={explainData.feature_contributions}
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 180, 158, 0.12)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 11.5, fill: 'var(--color-offwhite)' }} width={110} />
                  <Tooltip 
                    formatter={(val: any) => [`${Number(val).toFixed(3)} t/ha`, 'Yield Contribution']}
                    contentStyle={{ background: '#141F13', borderRadius: 10, border: '1px solid var(--color-forest-border)', color: '#F7F7EF', fontSize: 12 }}
                  />
                  <ReferenceLine x={0} stroke="rgba(228, 253, 151, 0.4)" strokeWidth={1.5} />
                  <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
                    {explainData.feature_contributions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.shap_value >= 0 ? '#E4FD97' : '#F87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 20,
            padding: 26,
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
                Factor Attribution Details
              </h4>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 18 }}>
                Positive factors (green) boosted the harvest; negative factors (red) reduced potential yield.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {explainData.feature_contributions.map((fc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'rgba(18, 27, 17, 0.7)',
                      borderRadius: 10,
                      border: '1px solid rgba(169, 180, 158, 0.1)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-offwhite)' }}>{fc.feature}</div>
                      <span style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Impact: {fc.impact} ({fc.percentage_contribution.toFixed(1)}%)</span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: fc.shap_value >= 0 ? 'var(--color-lime)' : '#F87171'
                    }}>
                      {fc.shap_value >= 0 ? `+${fc.shap_value.toFixed(3)}` : fc.shap_value.toFixed(3)} t/ha
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: 18,
              padding: '12px 16px',
              background: 'rgba(228, 253, 151, 0.1)',
              borderRadius: 10,
              fontSize: 12.5,
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CheckCircle2 size={16} />
              <span>Exact TreeSHAP attribution: 100% mathematically additive decomposition</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 20,
          border: '1px solid var(--color-forest-border)',
          padding: 60,
          textAlign: 'center',
          color: 'var(--color-muted)'
        }}>
          <Sparkles size={32} style={{ margin: '0 auto 12px', color: 'var(--color-lime)' }} />
          <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 6 }}>
            Ready to Compute Factor Explanations
          </h4>
          <p style={{ fontSize: 13.5, maxWidth: 360, margin: '0 auto' }}>
            Click "Calculate Factor Breakdown" above to analyze the currently selected inputs and see what drove the forecast.
          </p>
        </div>
      )}
    </div>
  );
};
