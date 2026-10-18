import React from 'react';
import { Sliders } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { ButtonSpinner, AIEngineLoader } from '../ui/Loader';
import type { SensitivityResponse } from '../../types';

interface SensitivityTabProps {
  sensData: SensitivityResponse | null;
  sensParam: string;
  setSensParam: (param: string) => void;
  loading: boolean;
  onRunSensitivity: () => void;
}

export const SensitivityTab: React.FC<SensitivityTabProps> = ({
  sensData,
  sensParam,
  setSensParam,
  loading,
  onRunSensitivity
}) => {
  const chartData = sensData ? sensData.values.map((v, i) => ({
    value: v,
    yield: sensData.predictions_tonnes_per_ha[i]
  })) : [];

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
            Climate Sensitivity Curve
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--color-muted)', marginTop: 2, margin: 0 }}>
            Simulate how varying individual climate parameters shifts expected yield.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="form-input"
            value={sensParam}
            onChange={(e) => setSensParam(e.target.value)}
            style={{ width: 'auto', padding: '7px 12px', fontSize: 12.5 }}
          >
            <option value="rainfall_mm">Rainfall (mm)</option>
            <option value="avg_temp_c">Temperature (°C)</option>
            <option value="pesticides_tonnes">Pesticides (tonnes)</option>
          </select>

          <button
            className="btn-primary"
            onClick={onRunSensitivity}
            disabled={loading}
            style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}
          >
            {loading ? (
              <ButtonSpinner size={15} text="Sweeping Parameter..." />
            ) : (
              <>
                <Sliders size={15} />
                <span>Simulate Response</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ background: 'var(--color-forest-surface)', borderRadius: 14, padding: '30px', border: '1px solid var(--color-forest-border)' }}>
          <AIEngineLoader 
            title="Dynamic Sweep Simulation"
            subtitle="Evaluating multi-point non-linear response curves across 50 simulated points..."
          />
        </div>
      ) : sensData ? (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 180, 158, 0.1)" />
                <XAxis dataKey="value" stroke="var(--color-muted)" fontSize={11} />
                <YAxis stroke="var(--color-muted)" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(val: any) => [`${parseFloat(val).toFixed(2)} t/ha`, 'Expected Yield']}
                  contentStyle={{
                    background: '#152214',
                    border: '1px solid var(--color-forest-border)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <ReferenceLine y={sensData.baseline_prediction_tonnes_per_ha} stroke="var(--color-lime)" strokeDasharray="4 4" label={{ value: 'Baseline', fill: 'var(--color-lime)', fontSize: 10 }} />
                <Line type="monotone" dataKey="yield" stroke="var(--color-lime)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-lime)' }} activeDot={{ r: 5 }} />
              </LineChart>
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
          <Sliders size={32} style={{ color: 'var(--color-lime)', marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, color: 'var(--color-offwhite)', marginBottom: 6 }}>Ready for Sensitivity Sweep</h4>
          <p style={{ fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
            Select an environmental parameter and click <strong>Simulate Response</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
