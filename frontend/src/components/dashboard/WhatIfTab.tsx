import React from 'react';
import { GitCompare, Loader2, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { WhatIfResponse, YieldInput } from '../../types';

interface WhatIfTabProps {
  inputData: YieldInput;
  whatIfData: WhatIfResponse | null;
  loading: boolean;
  onRunWhatIf: () => void;
}

export const WhatIfTab: React.FC<WhatIfTabProps> = ({
  whatIfData,
  loading,
  onRunWhatIf
}) => {
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
        gap: 16
      }}>
        <div>
          <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 800 }}>
            What-If Scenario Planning & Farm Decisions
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 4 }}>
            Compare current agricultural conditions against alternative weather scenarios (e.g. +20% rainfall, heat wave, pesticide changes).
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onRunWhatIf}
          disabled={loading}
          style={{ padding: '11px 22px', fontSize: 14 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Comparing Scenarios...</span>
            </>
          ) : (
            <>
              <GitCompare size={16} />
              <span>Simulate What-If Scenarios</span>
            </>
          )}
        </button>
      </div>

      {whatIfData ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 20
        }}>
          {whatIfData.comparisons.map((c, idx) => {
            const isBaseline = c.scenario_name === whatIfData.baseline_scenario;
            return (
              <div
                key={idx}
                style={{
                  background: isBaseline ? '#263825' : 'var(--color-forest-surface)',
                  color: 'var(--color-offwhite)',
                  border: isBaseline ? '1.5px solid var(--color-lime)' : '1px solid var(--color-forest-border)',
                  borderRadius: 14,
                  padding: 26,
                  boxShadow: isBaseline ? '0 12px 32px var(--color-lime-glow)' : 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 100,
                      background: isBaseline ? 'var(--color-lime)' : 'rgba(255, 255, 255, 0.08)',
                      color: isBaseline ? '#121B11' : 'var(--color-muted)'
                    }}>
                      {isBaseline ? 'CURRENT BASELINE' : 'ALTERNATIVE SCENARIO'}
                    </span>
                    {!isBaseline && (
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 700,
                        color: c.delta_from_baseline_pct >= 0 ? 'var(--color-lime)' : '#F87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {c.delta_from_baseline_pct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {c.delta_from_baseline_pct >= 0 ? `+${c.delta_from_baseline_pct.toFixed(1)}%` : `${c.delta_from_baseline_pct.toFixed(1)}%`}
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--color-offwhite)' }}>
                    {c.scenario_name}
                  </h4>

                  <div style={{
                    fontSize: 32,
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: isBaseline ? 'var(--color-lime)' : 'var(--color-offwhite)',
                    margin: '10px 0'
                  }}>
                    {c.predicted_yield_tonnes_per_ha.toFixed(2)} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-muted)' }}>t/ha</span>
                  </div>
                </div>

                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid rgba(169, 180, 158, 0.15)',
                  fontSize: 12.5,
                  color: 'var(--color-muted)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>90% Confidence:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)', fontWeight: 600 }}>
                    {c.conformal_interval_90[0].toFixed(2)} – {c.conformal_interval_90[1].toFixed(2)} t/ha
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 14,
          border: '1px solid var(--color-forest-border)',
          padding: 60,
          textAlign: 'center',
          color: 'var(--color-muted)'
        }}>
          <Sparkles size={32} style={{ margin: '0 auto 12px', color: 'var(--color-lime)' }} />
          <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 6 }}>
            Ready for What-If Simulation
          </h4>
          <p style={{ fontSize: 13.5, maxWidth: 360, margin: '0 auto' }}>
            Click "Simulate What-If Scenarios" above to compare your current field inputs against drought, excess rainfall, and heat conditions.
          </p>
        </div>
      )}
    </div>
  );
};
