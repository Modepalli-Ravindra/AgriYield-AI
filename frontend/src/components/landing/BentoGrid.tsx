import React from 'react';
import { 
  ChartBarIcon, 
  PresentationChartLineIcon, 
  ShieldCheckIcon, 
  CpuChipIcon, 
  AdjustmentsHorizontalIcon, 
  ExclamationCircleIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

export const BentoGrid: React.FC = () => {
  return (
    <section id="features" style={{ padding: '90px 0', backgroundColor: '#121B11', borderTop: '1px solid var(--color-forest-border)', borderBottom: '1px solid var(--color-forest-border)' }}>
      <div className="container">
        <div style={{ maxWidth: 760, marginBottom: 50 }}>
          <div className="section-pill-badge">
            <ChartBarIcon />
            <span>CORE CAPABILITIES</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 44px)',
            color: 'var(--color-offwhite)',
            marginTop: 12,
            marginBottom: 16,
            fontWeight: 800,
            letterSpacing: '-0.025em'
          }}>
            Comprehensive intelligence for agricultural planning.
          </h2>
          <p style={{ fontSize: 16.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Every tool in the AgriYield AI suite connects directly to the validated backend API, 
            providing instant single-field inferences, batch processing, and uncertainty analysis.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 24
        }}>
          {/* Card 1: Production XGBoost Engine (Span 7) */}
          <div style={{
            gridColumn: 'span 7',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 34,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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
                  <CpuChipIcon style={{ width: 22, height: 22 }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--color-lime)',
                  background: 'rgba(228, 253, 151, 0.12)',
                  padding: '4px 12px',
                  borderRadius: 100
                }}>
                  PRIMARY INFERENCE PIPELINE
                </span>
              </div>
              <h3 style={{ fontSize: 22, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
                High-Performance Gradient Boosted Trees
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
                Production pipeline optimized with 300 estimators, max depth 6, and robust cross-entropy loss. 
                Delivers sub-15ms inference latency across all 10 staple crop species and 101 global agricultural regions.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: 20,
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid rgba(169, 180, 158, 0.12)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-offwhite)'
            }}>
              <div><span style={{ color: 'var(--color-muted)' }}>Latency:</span> &lt; 15ms</div>
              <div><span style={{ color: 'var(--color-muted)' }}>Estimators:</span> 300 Trees</div>
              <div><span style={{ color: 'var(--color-muted)' }}>Coverage:</span> 101 Regions</div>
            </div>
          </div>

          {/* Card 2: Conformal UQ (Span 5) */}
          <div style={{
            gridColumn: 'span 5',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 34,
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
                marginBottom: 20
              }}>
                <ShieldCheckIcon style={{ width: 22, height: 22 }} />
              </div>
              <h3 style={{ fontSize: 21, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
                Conformal Uncertainty Bounds
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
                Non-parametric conformal intervals conditioned on crop species guarantee a 90% statistical coverage guarantee. 
                Essential for risk assessment during drought or unusual heat events.
              </p>
            </div>
            <div style={{
              background: 'rgba(18, 27, 17, 0.75)',
              borderRadius: 12,
              padding: '12px 16px',
              border: '1px solid rgba(169, 180, 158, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12.5,
              fontFamily: 'var(--font-mono)',
              marginTop: 20
            }}>
              <span style={{ color: 'var(--color-muted)' }}>Empirical Coverage:</span>
              <span style={{ color: 'var(--color-lime)', fontWeight: 700 }}>90.2% Calibrated</span>
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
                <PresentationChartLineIcon style={{ width: 22, height: 22 }} />
              </div>
              <h3 style={{ fontSize: 19, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 700 }}>
                TreeSHAP Explainability
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                Exact additive feature attribution breaks down why the model predicted a yield, quantifying rain, temperature, and input influences.
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
                <ChartBarIcon style={{ width: 22, height: 22 }} />
              </div>
              <h3 style={{ fontSize: 19, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 700 }}>
                Multi-Model Benchmarking
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
              <span style={{ color: 'var(--color-lime)', fontWeight: 700 }}>R² &gt; 0.96 Across Models</span>
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
                <AdjustmentsHorizontalIcon style={{ width: 22, height: 22 }} />
              </div>
              <h3 style={{ fontSize: 19, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 700 }}>
                Sensitivity & What-If Scenarios
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                Simulate agricultural decisions before implementation by sweeping rainfall, temperature, or chemical treatments to identify optimal yield curves.
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
              <span style={{ color: 'var(--color-lime)' }}>Dynamic Curves</span>
            </div>
          </div>

          {/* Card 6: InsForge Cloud Persistence (Span 6) */}
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
                <CircleStackIcon style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 700 }}>Cloud PostgreSQL Persistence</h4>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Managed Database Architecture</span>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55 }}>
              Thread-safe connection pool with user-isolated prediction history, audited schema migrations, and real-time query protection.
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
                <ExclamationCircleIcon style={{ width: 20, height: 20 }} />
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
