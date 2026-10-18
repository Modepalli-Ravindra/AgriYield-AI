import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { 
  ArrowRight, 
  History, 
  ShieldCheck, 
  BarChart3, 
  CloudSun, 
  Layers,
  Sliders,
  GitCompare,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { UserProfile } from '../../types';

interface OverviewTabProps {
  currentUser: UserProfile | null;
  onNavigate: (tab: string) => void;
}

const CROP_BASELINE_DATA = [
  { crop: 'Potatoes', yield: 31.2, low: 27.5, high: 35.8 },
  { crop: 'Cassava', yield: 19.8, low: 16.4, high: 23.2 },
  { crop: 'Maize', yield: 7.8, low: 6.2, high: 9.5 },
  { crop: 'Rice', yield: 6.5, low: 5.2, high: 7.9 },
  { crop: 'Wheat', yield: 5.3, low: 4.1, high: 6.4 },
  { crop: 'Soybeans', yield: 3.9, low: 3.0, high: 4.8 }
];

const CLIMATE_DRIVERS = [
  { factor: 'Annual Rainfall (mm)', impact: '+38.5%', pct: '88%', color: '#E4FD97' },
  { factor: 'Mean Temperature (?C)', impact: '-26.2%', pct: '66%', color: '#FCD34D' },
  { factor: 'Crop Protection / Pesticides', impact: '+18.4%', pct: '48%', color: '#93C5FD' },
  { factor: 'Soil & Geographic Baseline', impact: '+16.9%', pct: '42%', color: '#A78BFA' }
];

const CustomCropTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#121B11',
        border: '1px solid var(--color-lime)',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        fontSize: 11.5
      }}>
        <div style={{ color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 2 }}>{label}</div>
        <div style={{ color: 'var(--color-lime)', fontWeight: 800 }}>
          Expected Yield: {data.yield} t/ha
        </div>
        <div style={{ color: 'var(--color-muted)', fontSize: 10.5, marginTop: 2 }}>
          90% Bounds: {data.low} - {data.high} t/ha
        </div>
      </div>
    );
  }
  return null;
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ currentUser, onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Streamlined Welcome Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2819 0%, #131E12 100%)',
        borderRadius: 14,
        padding: '12px 18px',
        color: 'var(--color-offwhite)',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(228, 253, 151, 0.1)',
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid rgba(228, 253, 151, 0.2)',
            fontSize: 10.5,
            fontWeight: 700,
            color: 'var(--color-lime)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <SparklesIcon style={{ width: 13, height: 13 }} />
            <span>AI Crop Intelligence</span>
          </div>

          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--color-offwhite)' }}>
              Welcome back, {currentUser?.full_name || 'Agronomist'}
            </h3>
            <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: '2px 0 0', lineHeight: 1.3 }}>
              Terraflect calibrated inference engine is online. Ready for multi-factor yield forecasting.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onNavigate('predict')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-lime)',
              color: '#121B11',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 10px var(--color-lime-glow)',
              transition: 'all 0.2s ease'
            }}
          >
            <SparklesIcon style={{ width: 14, height: 14 }} />
            <span>New Prediction</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-forest-border)',
              color: 'var(--color-offwhite)',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <History size={13} />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12
      }}>
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '11px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <BarChart3 size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Model Precision
            </span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
            96.8% <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-muted)' }}>R?</span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Verified across 101 countries with 1.46 t/ha error margin.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '11px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Coverage Guarantee
            </span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-lime)', marginBottom: 2 }}>
            90% Bounds
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Conformal intervals showing realistic worst and best cases.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '11px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <CloudSun size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Dimensions
            </span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
            6 Core Drivers
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Rainfall, Temperature, Pesticides, Region, Year & Crop.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '11px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sliders size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Explainable AI
            </span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
            TreeSHAP Insights
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Exact climatic variables reveal why yields rise or fall.
          </p>
        </div>
      </div>

      {/* Practical Action Tools Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12
      }}>
        <div 
          onClick={() => onNavigate('predict')}
          style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <SparklesIcon style={{ width: 16, height: 16 }} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              Yield Forecast
            </h4>
            <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.35, margin: 0 }}>
              Instant single-field prediction with conformal confidence ranges.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 11.5, fontWeight: 600, marginTop: 10 }}>
            <span>Launch Predictor</span>
            <ArrowRight size={12} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('explain')}
          style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Layers size={16} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              TreeSHAP Analysis
            </h4>
            <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.35, margin: 0 }}>
              See exactly which climatic variables boosted or lowered harvest.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 11.5, fontWeight: 600, marginTop: 10 }}>
            <span>Explain Factors</span>
            <ArrowRight size={12} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('sensitivity')}
          style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Sliders size={16} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              Climate Curves
            </h4>
            <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.35, margin: 0 }}>
              Simulate dynamic changes in rainfall and temperature.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 11.5, fontWeight: 600, marginTop: 10 }}>
            <span>Analyze Curves</span>
            <ArrowRight size={12} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('benchmarks')}
          style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <GitCompare size={16} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              ML Benchmarks
            </h4>
            <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.35, margin: 0 }}>
              XGBoost vs Random Forest vs LightGBM vs Deep MLP.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 11.5, fontWeight: 600, marginTop: 10 }}>
            <span>View Benchmarks</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>

      {/* Bottom Visual Telemetry & Analytics Hub */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1.1fr',
        gap: 12,
        marginTop: 2
      }}>
        {/* Left: Multi-Crop Yield Baseline Chart */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '12px 16px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <BarChart3 size={15} style={{ color: 'var(--color-lime)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-offwhite)' }}>
                Global Crop Yield Baselines & Uncertainty (t/ha)
              </span>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-lime)',
              background: 'rgba(228, 253, 151, 0.08)',
              padding: '2px 7px',
              borderRadius: 4,
              border: '1px solid rgba(228, 253, 151, 0.2)'
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-lime)', display: 'inline-block' }} />
              90% Conformal Calibrated
            </span>
          </div>

          <div style={{ width: '100%', height: 165 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CROP_BASELINE_DATA} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="crop" 
                  stroke="var(--color-muted)" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                />
                <YAxis 
                  stroke="var(--color-muted)" 
                  fontSize={10.5} 
                  tickLine={false}
                  axisLine={false}
                  unit=" t"
                />
                <Tooltip content={<CustomCropTooltip />} />
                <Bar 
                  dataKey="yield" 
                  name="Expected Yield"
                  fill="var(--color-lime)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--color-muted)', paddingTop: 4 }}>
            <span>*Calibrated across 28,242 multi-country FAO validated field records</span>
            <span 
              onClick={() => onNavigate('benchmarks')}
              style={{ color: 'var(--color-lime)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              Full Model Benchmarks <ArrowRight size={11} />
            </span>
          </div>
        </div>

        {/* Right: Climatic Feature Sensitivity Telemetry */}
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '12px 16px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Activity size={15} style={{ color: 'var(--color-lime)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-offwhite)' }}>
                Global Climatic Feature Impact
              </span>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
              TreeSHAP Weights
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CLIMATE_DRIVERS.map((item) => (
              <div key={item.factor}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, fontSize: 11 }}>
                  <span style={{ color: 'var(--color-offwhite)', fontWeight: 500 }}>{item.factor}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: item.color, fontWeight: 600 }}>{item.impact}</span>
                </div>
                <div style={{ width: '100%', height: 5, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: item.pct,
                    height: '100%',
                    background: item.color,
                    borderRadius: 3,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 6,
            padding: '5px 8px',
            marginTop: 4,
            fontSize: 10.5,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
              <span style={{ color: 'var(--color-offwhite)' }}>Live Calibrated Engine</span>
            </div>
            <span 
              onClick={() => onNavigate('explain')}
              style={{ color: 'var(--color-lime)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              Analyze Factors <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
