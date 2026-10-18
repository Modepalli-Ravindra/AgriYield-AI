import React from 'react';
import { GitCompare, Loader2 } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
            What-If Climate & Agrochemical Scenarios
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted-light)', marginTop: 2 }}>
            Simulate counterfactual weather extremes (e.g. +20% rainfall, +2°C heat wave, pesticide reduction).
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onRunWhatIf}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Simulating Scenarios...</span>
            </>
          ) : (
            <>
              <GitCompare size={16} />
              <span>Run Scenario Comparison</span>
            </>
          )}
        </button>
      </div>

      {whatIfData ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20
        }}>
          {whatIfData.comparisons.map((c, idx) => {
            const isBaseline = c.scenario_name === whatIfData.baseline_scenario;
            return (
              <div
                key={idx}
                style={{
                  background: isBaseline ? 'var(--color-forest)' : '#FFFFFF',
                  color: isBaseline ? 'var(--color-offwhite)' : 'var(--text-primary-light)',
                  border: isBaseline ? '1px solid var(--color-forest-border)' : '1px solid var(--color-offwhite-border)',
                  borderRadius: 18,
                  padding: 24,
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: isBaseline ? 'var(--color-lime)' : '#E2E6DC',
                    color: isBaseline ? 'var(--color-forest-dark)' : 'var(--color-forest)'
                  }}>
                    {isBaseline ? 'CURRENT BASELINE' : 'COUNTERFACTUAL'}
                  </span>
                  {!isBaseline && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: c.delta_from_baseline_pct >= 0 ? '#16A34A' : '#DC2626'
                    }}>
                      {c.delta_from_baseline_pct >= 0 ? `+${c.delta_from_baseline_pct.toFixed(2)}%` : `${c.delta_from_baseline_pct.toFixed(2)}%`}
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: isBaseline ? 'var(--color-offwhite)' : 'var(--color-forest-dark)' }}>
                  {c.scenario_name}
                </h4>

                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: isBaseline ? 'var(--color-lime)' : 'var(--color-forest)',
                  margin: '8px 0'
                }}>
                  {c.predicted_yield_tonnes_per_ha.toFixed(3)} <span style={{ fontSize: 14, fontWeight: 500 }}>t/ha</span>
                </div>

                <div style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: isBaseline ? 'var(--color-muted)' : 'var(--text-muted-light)',
                  marginBottom: 16
                }}>
                  90% Interval: [{c.conformal_interval_90[0].toFixed(2)} — {c.conformal_interval_90[1].toFixed(2)}] t/ha
                </div>

                <div style={{
                  marginTop: 'auto',
                  borderTop: isBaseline ? '1px solid rgba(169, 180, 158, 0.15)' : '1px solid var(--color-offwhite-border)',
                  paddingTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  fontSize: 12,
                  color: isBaseline ? 'var(--color-muted)' : 'var(--text-muted-light)'
                }}>
                  <div>Rainfall: {c.inputs.rainfall_mm} mm</div>
                  <div>Avg Temp: {c.inputs.avg_temp_c} °C</div>
                  <div>Pesticides: {c.inputs.pesticides_tonnes.toLocaleString()} t</div>
                </div>
              </div>
            );
          })}
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
          Click "Run Scenario Comparison" to evaluate how rainfall and temperature shifts impact harvest yields.
        </div>
      )}
    </div>
  );
};
