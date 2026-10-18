import React from 'react';
import { 
  Sprout, 
  ArrowRight, 
  LineChart, 
  Sliders, 
  Layers, 
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'radial-gradient(circle at 70% 30%, #293B28 0%, #1D2A1C 60%, #152014 100%)',
        borderRadius: 20,
        padding: '32px 36px',
        color: 'var(--color-offwhite)',
        border: '1px solid var(--color-forest-border)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 24
      }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 100,
            background: 'rgba(228, 253, 151, 0.12)',
            color: 'var(--color-lime)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            marginBottom: 12
          }}>
            <CheckCircle2 size={13} />
            <span>AUTHENTICATED RESEARCH WORKSPACE</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 8 }}>
            Welcome back, {currentUser?.full_name || currentUser?.email.split('@')[0] || 'Researcher'}
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            The AgriYield AI engine is online. Production XGBoost regressor (R² = 0.9681) is active with 
            InsForge PostgreSQL persistence and 90% non-parametric conformal uncertainty calibration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => onNavigate('predict')}
            style={{ padding: '12px 20px', fontSize: 14 }}
          >
            <Sprout size={16} />
            <span>Run New Prediction</span>
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('batch')}
            style={{ padding: '12px 20px', fontSize: 14 }}
          >
            <Layers size={16} />
            <span>Batch Analysis</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--color-offwhite-border)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted-light)' }}>
            DEPLOYED PRODUCTION ESTIMATOR
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-forest-dark)', marginTop: 6, marginBottom: 4 }}>
            XGBoost Pipeline
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--color-forest-light)', fontWeight: 600 }}>
            300 Estimators • Max Depth 6
          </span>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--color-offwhite-border)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted-light)' }}>
            ACCURACY & ERROR INDEX
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-forest-dark)', marginTop: 6, marginBottom: 4 }}>
            R² 0.9681 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted-light)' }}>• RMSE 1.466 t/ha</span>
          </div>
          <span style={{ fontSize: 12.5, color: '#16A34A', fontWeight: 600 }}>
            Audited 4-Way Group Disjoint Split
          </span>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--color-offwhite-border)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted-light)' }}>
            CONFORMAL UNCERTAINTY BOUNDS
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-forest-dark)', marginTop: 6, marginBottom: 4 }}>
            90% Nominal
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--color-forest-light)', fontWeight: 600 }}>
            Crop-Conditional Non-Parametric
          </span>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--color-offwhite-border)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted-light)' }}>
            CLOUD PERSISTENCE
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-forest-dark)', marginTop: 6, marginBottom: 4 }}>
            InsForge PostgreSQL
          </div>
          <span style={{ fontSize: 12.5, color: '#16A34A', fontWeight: 600 }}>
            Active Connection Pool • User Isolated
          </span>
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <div>
        <h3 style={{ fontSize: 20, color: 'var(--color-forest-dark)', marginBottom: 16 }}>
          Analytical Tools & Workflows
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20
        }}>
          <div 
            onClick={() => onNavigate('predict')}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-offwhite-border)',
              boxShadow: 'var(--shadow-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-forest)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-offwhite-border)')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(45, 62, 44, 0.08)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={20} />
              </div>
              <ArrowRight size={16} color="var(--color-forest)" />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-forest-dark)', marginBottom: 6 }}>Single Yield Prediction</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted-light)', lineHeight: 1.5 }}>
              Interactively adjust rainfall, temperature, and agrochemical inputs to compute point yield and conformal intervals.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('explain')}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-offwhite-border)',
              boxShadow: 'var(--shadow-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-forest)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-offwhite-border)')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(45, 62, 44, 0.08)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LineChart size={20} />
              </div>
              <ArrowRight size={16} color="var(--color-forest)" />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-forest-dark)', marginBottom: 6 }}>TreeSHAP Feature Attribution</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted-light)', lineHeight: 1.5 }}>
              Inspect exact additive feature contributions showing which environmental variables boosted or suppressed yield.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('sensitivity')}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-offwhite-border)',
              boxShadow: 'var(--shadow-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-forest)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-offwhite-border)')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(45, 62, 44, 0.08)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sliders size={20} />
              </div>
              <ArrowRight size={16} color="var(--color-forest)" />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-forest-dark)', marginBottom: 6 }}>Climate Sensitivity Analysis</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted-light)', lineHeight: 1.5 }}>
              Sweep parameters from -30% to +30% around baseline to identify tipping points and yield elasticities.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('whatif')}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-offwhite-border)',
              boxShadow: 'var(--shadow-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-forest)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-offwhite-border)')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(45, 62, 44, 0.08)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitCompare size={20} />
              </div>
              <ArrowRight size={16} color="var(--color-forest)" />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-forest-dark)', marginBottom: 6 }}>What-If Climate Simulator</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted-light)', lineHeight: 1.5 }}>
              Compare multi-scenario counterfactual weather shifts and evaluate expected harvest deltas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
