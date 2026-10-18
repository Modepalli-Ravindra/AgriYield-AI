import React from 'react';
import { LineChart as LineChartIcon, Sparkles } from 'lucide-react';
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
import { ButtonSpinner, AIEngineLoader } from '../ui/Loader';
import type { ExplainResponse } from '../../types';

interface ExplainTabProps {
  explainData: ExplainResponse | null;
  loading: boolean;
  onRunExplain: () => void;
}

export const ExplainTab: React.FC<ExplainTabProps> = ({ explainData, loading, onRunExplain }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 14,
        padding: '14px 18px',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div>
          <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>
            Why This Yield? (Factor Contributions)
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--color-muted)', marginTop: 2, margin: 0 }}>
            See transparently how each environmental factor pushed the harvest above or below average.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onRunExplain}
          disabled={loading}
          style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}
        >
          {loading ? (
            <ButtonSpinner size={15} text="Analyzing Factor Impact..." />
          ) : (
            <>
              <LineChartIcon size={15} />
              <span>Calculate Factor Breakdown</span>
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ background: 'var(--color-forest-surface)', borderRadius: 14, padding: '30px', border: '1px solid var(--color-forest-border)' }}>
          <AIEngineLoader 
            title="TreeSHAP Attribution Pass"
            subtitle="Evaluating exact Shapley contributions across regional climatic features..."
          />
        </div>
      ) : explainData ? (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Base Regional Yield
              </span>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-offwhite)' }}>
                {explainData.base_value.toFixed(2)} t/ha
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Net Predicted Outcome
              </span>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-lime)' }}>
                {explainData.prediction_tonnes_per_ha.toFixed(2)} t/ha
              </div>
            </div>
          </div>

          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={explainData.feature_contributions}
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 180, 158, 0.1)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted)" fontSize={11} domain={['auto', 'auto']} />
                <YAxis dataKey="feature" type="category" stroke="var(--color-offwhite)" fontSize={11.5} width={90} />
                <Tooltip
                  formatter={(val: any) => [`${parseFloat(val).toFixed(3)} t/ha`, 'Contribution']}
                  contentStyle={{
                    background: '#152214',
                    border: '1px solid var(--color-forest-border)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <ReferenceLine x={0} stroke="rgba(247, 247, 239, 0.3)" />
                <Bar dataKey="contribution">
                  {explainData.feature_contributions.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.contribution >= 0 ? 'var(--color-lime)' : '#F87171'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 14,
          padding: '40px 20px',
          border: '1px solid var(--color-forest-border)',
          textAlign: 'center',
          color: 'var(--color-muted)'
        }}>
          <Sparkles size={32} style={{ color: 'var(--color-lime)', marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, color: 'var(--color-offwhite)', marginBottom: 6 }}>Ready for Feature Attribution</h4>
          <p style={{ fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
            Click <strong>Calculate Factor Breakdown</strong> above to generate real-time TreeSHAP contributions.
          </p>
        </div>
      )}
    </div>
  );
};
