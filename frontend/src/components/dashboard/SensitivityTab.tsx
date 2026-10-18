import React from 'react';
import { Sliders, Loader2 } from 'lucide-react';
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
            Climate Sensitivity Analysis
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 4 }}>
            See how crop yield responds as a single environmental factor (like rain or temperature) increases or decreases.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select
            value={sensParam}
            onChange={(e) => setSensParam(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '9px 16px', fontSize: 13.5 }}
          >
            <option value="rainfall_mm">Vary Rainfall (mm)</option>
            <option value="avg_temp_c">Vary Temperature (°C)</option>
            <option value="pesticides_tonnes">Vary Pesticides (tonnes)</option>
          </select>

          <button
            className="btn-primary"
            onClick={onRunSensitivity}
            disabled={loading}
            style={{ padding: '10px 22px', fontSize: 14 }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sweeping Parameter...</span>
              </>
            ) : (
              <>
                <Sliders size={16} />
                <span>Simulate Response</span>
              </>
            )}
          </button>
        </div>
      </div>

      {sensData ? (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 20,
          padding: 28,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h4 style={{ fontSize: 18, color: 'var(--color-offwhite)', marginBottom: 4, fontWeight: 700 }}>
            Yield Response Curve across Varying {sensParam.replace('_', ' ').toUpperCase()}
          </h4>
          <span style={{ fontSize: 13, color: 'var(--color-muted)', display: 'block', marginBottom: 24 }}>
            Baseline Value: {sensData.baseline_value} • Baseline Predicted Yield: {sensData.baseline_prediction_tonnes_per_ha.toFixed(2)} t/ha
          </span>

          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 180, 158, 0.12)" />
                <XAxis 
                  dataKey="value" 
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  label={{ value: sensParam, position: 'insideBottom', offset: -10, fill: 'var(--color-muted)', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  label={{ value: 'Yield (t/ha)', angle: -90, position: 'insideLeft', fill: 'var(--color-muted)', fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toFixed(2)} t/ha`, 'Yield']}
                  contentStyle={{ background: '#141F13', borderRadius: 10, border: '1px solid var(--color-forest-border)', color: '#F7F7EF', fontSize: 12 }}
                />
                <ReferenceLine y={sensData.baseline_prediction_tonnes_per_ha} stroke="rgba(228, 253, 151, 0.4)" strokeDasharray="4 4" label={{ value: 'Baseline', fill: 'var(--color-lime)', fontSize: 11 }} />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#E4FD97" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#121B11', stroke: '#E4FD97', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#E4FD97' }}
                />
              </LineChart>
            </ResponsiveContainer>
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
          <Sliders size={32} style={{ margin: '0 auto 12px', color: 'var(--color-lime)' }} />
          <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 6 }}>
            Ready for Sensitivity Sweep
          </h4>
          <p style={{ fontSize: 13.5, maxWidth: 360, margin: '0 auto' }}>
            Select a parameter above and click "Simulate Response" to generate the dynamic yield sensitivity curve.
          </p>
        </div>
      )}
    </div>
  );
};
