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
    <section id="features" style={{ padding: '100px 0', backgroundColor: '#121B11', borderTop: '1px solid var(--color-forest-border)', borderBottom: '1px solid var(--color-forest-border)' }}>
      <div className="container">
        <div style={{ maxWidth: 760, marginBottom: 54 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-lime)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            02 / CORE SYSTEM CAPABILITIES
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 44px)',
            color: 'var(--color-offwhite)',
            marginTop: 12,
            marginBottom: 16,
            fontWeight: 800,
            letterSpacing: '-0.025em'
          }}>
            A comprehensive, scientifically audited prediction suite.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Every module in AgriYield AI has been empirically verified across 28,242 historical records, 
            providing verified accuracy, exact feature attributions, and non-parametric uncertainty quantification.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 24
        }}>
          {/* Card 1: Production Pipeline (Span 8) */}
          <div style={{
            gridColumn: 'span 8',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(228, 253, 151, 0.15)',
                  color: 'var(--color-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Cpu size={22} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: 'rgba(228, 253, 151, 0.15)',
                  color: 'var(--color-lime)',
                  padding: '4px 12px',
                  borderRadius: 100
                }}>
                  PRODUCTION PIPELINE
                </span>
              </div>
              <h3 style={{ fontSize: 22, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
                Production XGBoost Regressor Pipeline
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Trained on FAOSTAT environmental indicators across 101 countries. Serves point yield estimates 
                in metric tonnes per hectare (t/ha) with an independently audited R² of 0.9681 and RMSE of 1.466 t/ha.
              </p>
            </div>

            <div style={{
              background: 'rgba(18, 27, 17, 0.8)',
              borderRadius: 14,
              padding: '18px 22px',
              border: '1px solid rgba(169, 180, 158, 0.18)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 16
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
          <div style={{
            gridColumn: 'span 4',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(228, 253, 151, 0.15)',
                  color: 'var(--color-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: 'rgba(228, 253, 151, 0.15)',
                  color: 'var(--color-lime)',
                  padding: '4px 12px',
                  borderRadius: 100
                }}>
                  90% MARGINAL
                </span>
              </div>
              <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
                Conformal Uncertainty Bounds
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                Every prediction is accompanied by non-parametric conformal lower and upper harvest bounds, guaranteeing 90% finite-sample coverage without gaussian distribution assumptions.
              </p>
            </div>

            <div style={{
              background: 'rgba(18, 27, 17, 0.8)',
              borderRadius: 12,
              padding: 14,
              border: '1px solid rgba(169, 180, 158, 0.18)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-lime)'
            }}>
              Q_conformal: Crop-conditional non-negative intervals
            </div>
          </div>

          {/* Card 3: TreeSHAP (Span 4) */}
          <div style={{
            gridColumn: 'span 4',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <LineChart size={22} />
              </div>
              <h3 style={{ fontSize: 19, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 700 }}>
                TreeSHAP Local Explainability
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                Exact additive feature attribution breaks down why the model predicted a yield, quantifying rain, temperature, and agrochemical influences.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              marginTop: 18,
              fontSize: 11.5,
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ background: 'rgba(228, 253, 151, 0.15)', color: 'var(--color-lime)', padding: '3px 8px', borderRadius: 4 }}>+ Rain Delta</span>
              <span style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#F87171', padding: '3px 8px', borderRadius: 4 }}>- Heat Deficit</span>
            </div>
          </div>

          {/* Card 4: Multi-Model Benchmark (Span 4) */}
          <div style={{
            gridColumn: 'span 4',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <GitCompare size={22} />
              </div>
              <h3 style={{ fontSize: 19, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 700 }}>
                Comparative Model Benchmarks
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                Side-by-side empirical comparison between XGBoost, Random Forest, LightGBM, and PyTorch Deep MLP across standard evaluation splits.
              </p>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 18,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)'
            }}>
              <span>4 Architectures</span>
              <span style={{ color: 'var(--color-lime)', fontWeight: 700 }}>R² &gt; 0.96 All Trees</span>
            </div>
          </div>

          {/* Card 5: Sensitivity & What-If (Span 4) */}
          <div style={{
            gridColumn: 'span 4',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Sliders size={22} />
              </div>
              <h3 style={{ fontSize: 19, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 700 }}>
                Sensitivity & What-If Scenarios
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                Simulate agricultural decisions before implementation by sweeping rainfall, temperature, or fertilizer inputs to identify optimal yield curves.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              marginTop: 18,
              fontSize: 11.5,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)'
            }}>
              <span>±50% Range Sweeps</span>
              <span style={{ color: 'var(--color-lime)' }}>• Dynamic Curves</span>
            </div>
          </div>

          {/* Card 6: InsForge PostgreSQL (Span 6) */}
          <div style={{
            gridColumn: 'span 6',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 28,
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Database size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 700 }}>InsForge PostgreSQL Persistence</h4>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Production Cloud Database Layer</span>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
              Thread-safe connection pool with user-isolated prediction history, audited schema migrations, and real-time query rollback protection.
            </p>
          </div>

          {/* Card 7: Input Validation (Span 6) */}
          <div style={{
            gridColumn: 'span 6',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 28,
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 700 }}>Agronomic Range & OOD Warnings</h4>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Input Sanitization & Protection</span>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
              Pydantic-enforced bounds with advisory warnings for unusual weather conditions, preventing invalid or physically impossible inference.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
