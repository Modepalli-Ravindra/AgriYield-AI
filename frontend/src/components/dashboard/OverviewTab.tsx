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
  CheckCircle2
} from 'lucide-react';
import type { UserProfile } from '../../types';

interface OverviewTabProps {
  currentUser: UserProfile | null;
  onNavigate: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ currentUser, onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Streamlined Welcome Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2819 0%, #131E12 100%)',
        borderRadius: 14,
        padding: '14px 20px',
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
            gap: 5,
            padding: '4px 10px',
            borderRadius: 100,
            background: 'rgba(228, 253, 151, 0.12)',
            color: 'var(--color-lime)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700
          }}>
            <CheckCircle2 size={12} />
            <span>AI CROP INTELLIGENCE</span>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)', margin: 0, lineHeight: 1.2 }}>
              Welcome back, {currentUser?.full_name || currentUser?.email.split('@')[0] || 'Researcher'}
            </h2>
            <span style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
              Terraflect calibrated inference engine is online. Ready for multi-factor yield forecasting.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className="btn-primary" 
            onClick={() => onNavigate('predict')}
            style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}
          >
            <SparklesIcon style={{ width: 14, height: 14 }} />
            <span>New Prediction</span>
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('history')}
            style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}
          >
            <History size={14} />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* 4 Compact Metric Cards (Single Row) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12
      }}>
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '12px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <BarChart3 size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Model Precision
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
            96.8% <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-muted)' }}>R²</span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Verified across 101 countries with 1.46 t/ha error margin.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '12px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Coverage Guarantee
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-lime)', marginBottom: 2 }}>
            90% Bounds
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Conformal intervals showing realistic worst and best cases.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '12px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <CloudSun size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Dimensions
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
            6 Core Drivers
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Rainfall, Temperature, Pesticides, Region, Year & Crop.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 12,
          padding: '12px 14px',
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sliders size={14} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Explainable AI
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
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
            padding: '14px 16px',
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
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10
            }}>
              <SparklesIcon style={{ width: 17, height: 17 }} />
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              Yield Forecast
            </h4>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.4, margin: 0 }}>
              Instant single-field prediction with conformal confidence ranges.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 12, fontWeight: 600, marginTop: 12 }}>
            <span>Launch Predictor</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('explain')}
          style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '14px 16px',
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
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10
            }}>
              <Layers size={17} />
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              TreeSHAP Analysis
            </h4>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.4, margin: 0 }}>
              See exactly which climatic variables boosted or lowered harvest.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 12, fontWeight: 600, marginTop: 12 }}>
            <span>Explain Factors</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('sensitivity')}
          style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '14px 16px',
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
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10
            }}>
              <Sliders size={17} />
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              Climate Curves
            </h4>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.4, margin: 0 }}>
              Simulate dynamic changes in rainfall and temperature.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 12, fontWeight: 600, marginTop: 12 }}>
            <span>Analyze Curves</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('benchmarks')}
          style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '14px 16px',
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
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10
            }}>
              <GitCompare size={17} />
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              ML Benchmarks
            </h4>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.4, margin: 0 }}>
              XGBoost vs Random Forest vs LightGBM vs Deep MLP.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-lime)', fontSize: 12, fontWeight: 600, marginTop: 12 }}>
            <span>View Benchmarks</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
};
