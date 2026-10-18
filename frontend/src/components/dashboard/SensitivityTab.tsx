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
      {/* Controls card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700 }}>
              Environmental Elasticity & Parameter Sweep
            </h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted-light)' }}>
              Evaluate yield response across a [-30%, +30%] variation range.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary-light)' }}>Target Variable:</label>
            <select
              className="form-input"
              value={sensParam}
              onChange={(e) => setSensParam(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="rainfall_mm">Annual Rainfall (rainfall_mm)</option>
              <option value="avg_temp_c">Average Temperature (avg_temp_c)</option>
              <option value="pesticides_tonnes">Pesticides Applied (pesticides_tonnes)</option>
            </select>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={onRunSensitivity}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Simulating Sweep...</span>
            </>
          ) : (
            <>
              <Sliders size={16} />
              <span>Run Sensitivity Sweep</span>
            </>
          )}
        </button>
      </div>

      {sensData ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 18,
          padding: 28,
          border: '1px solid var(--color-offwhite-border)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h4 style={{ fontSize: 16, color: 'var(--color-forest-dark)', fontWeight: 700 }}>
                Yield Response Curve for {sensData.parameter}
              </h4>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted-light)' }}>
                Baseline Value: {sensData.baseline_value} • Baseline Yield: {sensData.baseline_prediction_tonnes_per_ha.toFixed(3)} t/ha
              </span>
            </div>
            <span style={{
              background: 'var(--color-offwhite)',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--color-forest)',
              border: '1px solid var(--color-offwhite-border)'
            }}>
              {sensData.elasticity_summary}
            </span>
          </div>

          <div style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" />
                <XAxis 
                  dataKey="value" 
                  tick={{ fontSize: 11, fill: '#6E7E67' }}
                  label={{ value: `${sensData.parameter} value`, position: 'insideBottom', offset: -10, fontSize: 12 }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6E7E67' }}
                  label={{ value: 'Estimated Yield (tonnes/ha)', angle: -90, position: 'insideLeft', fontSize: 12 }} 
                />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toFixed(4)} t/ha`, 'Yield']}
                  contentStyle={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E3E7DE', fontSize: 12 }}
                />
                <ReferenceLine x={sensData.baseline_value} stroke="#E4FD97" strokeWidth={2} label={{ value: 'Baseline', fill: '#2D3E2C', fontSize: 11 }} />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#2D3E2C" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#2D3E2C' }} 
                  activeDot={{ r: 6, fill: '#E4FD97', stroke: '#2D3E2C', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
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
          Select an environmental factor and click "Run Sensitivity Sweep" to generate an elasticity curve.
        </div>
      )}
    </div>
  );
};
