import React from 'react';
import { 
  GitCompare, 
  LineChart, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  AlertCircle,
  Database
} from 'lucide-react';

export const BentoGrid: React.FC = () => {
  return (
    <section id="features" style={{ padding: '96px 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-offwhite-border)', borderBottom: '1px solid var(--color-offwhite-border)' }}>
      <div className="container">
        <div style={{ maxWidth: 740, marginBottom: 54 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-forest)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            02 / RESEARCH & ENGINEERING CAPABILITIES
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-forest-dark)',
            marginTop: 12,
            marginBottom: 16,
            letterSpacing: '-0.025em'
          }}>
            A comprehensive, scientifically audited prediction suite.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
            Every module in AgriYield AI has been empirically verified across 28,242 historical records, 
            providing verified accuracy, exact feature attributions, and non-parametric uncertainty quantification.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Card 1: Production Pipeline (Span 8) */}
          <div className="bento-card bento-card-dark bento-span-8">
            <div className="bento-header">
              <div className="bento-icon-wrapper">
                <Cpu size={22} />
              </div>
              <span className="bento-badge">PRODUCTION DEPLOYED</span>
            </div>
            <h3 className="bento-title" style={{ color: 'var(--color-offwhite)' }}>
              Production XGBoost Regressor Pipeline
            </h3>
            <p className="bento-desc">
              Trained on FAOSTAT environmental indicators across 101 countries. Serves point yield estimates 
              in metric tonnes per hectare (t/ha) with an independently audited R² of 0.9681 and RMSE of 1.466 t/ha.
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 14,
              padding: '16px 20px',
              border: '1px solid rgba(169, 180, 158, 0.18)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 16,
              marginTop: 'auto'
            }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>TEST R² SCORE</span>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-lime)' }}>0.9681</div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>TEST RMSE</span>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-offwhite)' }}>1.466 <span style={{ fontSize: 13, fontWeight: 400 }}>t/ha</span></div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>ESTIMATORS</span>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-offwhite)' }}>300 <span style={{ fontSize: 13, fontWeight: 400 }}>trees</span></div>
              </div>
            </div>
          </div>

          {/* Card 2: Conformal Uncertainty (Span 4) */}
          <div className="bento-card bento-span-4">
            <div className="bento-header">
              <div className="bento-icon-wrapper">
                <ShieldCheck size={22} />
              </div>
              <span className="bento-badge">GUARANTEED 90%</span>
            </div>
            <h3 className="bento-title" style={{ color: 'var(--color-forest-dark)' }}>
              Group-Aware Conformal Bounds
            </h3>
            <p className="bento-desc">
              Finite-sample distribution-free prediction intervals calibrated per crop category. Delivers empirical 
              coverage guarantees with strict physical yield non-negativity enforcement.
            </p>
            <div style={{
              background: 'var(--color-offwhite)',
              borderRadius: 12,
              padding: '14px',
              border: '1px solid var(--color-offwhite-border)',
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted-light)' }}>Coverage Level</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-forest)' }}>90.0% Nominal</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#E2E6DC', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '90%', height: '100%', background: 'var(--color-forest)' }} />
              </div>
            </div>
          </div>

          {/* Card 3: TreeSHAP Attribution (Span 4) */}
          <div className="bento-card bento-span-4">
            <div className="bento-header">
              <div className="bento-icon-wrapper">
                <LineChart size={22} />
              </div>
              <span className="bento-badge">GAME THEORETIC</span>
            </div>
            <h3 className="bento-title" style={{ color: 'var(--color-forest-dark)' }}>
              Exact TreeSHAP Attribution
            </h3>
            <p className="bento-desc">
              Explains prediction mechanics through exact Shapley waterfall attributions satisfying strict local additivity: 
              base value plus all feature contributions equals predicted yield.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 'auto',
              background: 'var(--color-offwhite)',
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--color-offwhite-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary-light)' }}>Rainfall Impact</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#2E7D32', fontWeight: 600 }}>+0.42 t/ha</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary-light)' }}>Heat Stress (Avg Temp)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#C62828', fontWeight: 600 }}>-0.85 t/ha</span>
              </div>
            </div>
          </div>

          {/* Card 4: Comparative Benchmarks (Span 4) */}
          <div className="bento-card bento-span-4">
            <div className="bento-header">
              <div className="bento-icon-wrapper">
                <GitCompare size={22} />
              </div>
              <span className="bento-badge">4 ARCHITECTURES</span>
            </div>
            <h3 className="bento-title" style={{ color: 'var(--color-forest-dark)' }}>
              Multi-Model Research Suite
            </h3>
            <p className="bento-desc">
              Empirical side-by-side benchmark comparing Random Forest (0.9689), XGBoost (0.9681), 
              LightGBM (0.9665), and PyTorch Tabular MLP (0.9612).
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--color-offwhite)',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid var(--color-offwhite-border)',
              marginTop: 'auto'
            }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted-light)' }}>Ensemble Meta-Model</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-forest)' }}>RidgeCV Stacking</span>
            </div>
          </div>

          {/* Card 5: Sensitivity & What-If (Span 4) */}
          <div className="bento-card bento-span-4">
            <div className="bento-header">
              <div className="bento-icon-wrapper">
                <Sliders size={22} />
              </div>
              <span className="bento-badge">SWEEP [-30%, +30%]</span>
            </div>
            <h3 className="bento-title" style={{ color: 'var(--color-forest-dark)' }}>
              Sensitivity & What-If Simulator
            </h3>
            <p className="bento-desc">
              Evaluate elasticity responses across rainfall, temperature, and pesticide variations. 
              Simulate climate scenarios and contrast yield deltas against historical baseline.
            </p>
            <div style={{
              display: 'flex',
              gap: 6,
              marginTop: 'auto'
            }}>
              <span style={{ fontSize: 11, background: 'var(--color-offwhite)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-offwhite-border)', color: 'var(--text-secondary-light)' }}>Rainfall Sweep</span>
              <span style={{ fontSize: 11, background: 'var(--color-offwhite)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-offwhite-border)', color: 'var(--text-secondary-light)' }}>Temperature Delta</span>
            </div>
          </div>

          {/* Card 6: Batch API & OOD Warnings (Span 6) */}
          <div className="bento-card bento-span-6">
            <div className="bento-header">
              <div className="bento-icon-wrapper">
                <AlertCircle size={22} />
              </div>
              <span className="bento-badge">MAX 50 ITEMS</span>
            </div>
            <h3 className="bento-title" style={{ color: 'var(--color-forest-dark)' }}>
              Batch Predictions & Input Validation
            </h3>
            <p className="bento-desc">
              High-throughput batch endpoint supporting up to 50 concurrent agricultural scenarios. 
              Equipped with strict out-of-distribution advisory warnings for extreme weather extremes.
            </p>
          </div>

          {/* Card 7: InsForge Managed PostgreSQL (Span 6) */}
          <div className="bento-card bento-card-dark bento-span-6">
            <div className="bento-header">
              <div className="bento-icon-wrapper">
                <Database size={22} />
              </div>
              <span className="bento-badge">INSFORGE POSTGRES</span>
            </div>
            <h3 className="bento-title" style={{ color: 'var(--color-offwhite)' }}>
              Audited History & Multi-User Isolation
            </h3>
            <p className="bento-desc">
              Cloud-managed PostgreSQL persistence with strict user isolation, connection pooling, 
              and foreign key referential integrity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
