import React from 'react';
import { CloudRain, Scale, ShieldAlert, Cpu } from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  return (
    <section id="overview" style={{ padding: '96px 0', backgroundColor: 'var(--color-offwhite)' }}>
      <div className="container">
        <div style={{ maxWidth: 760, marginBottom: 56 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-forest)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            01 / PROJECT OVERVIEW
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-forest-dark)',
            marginTop: 12,
            marginBottom: 18,
            letterSpacing: '-0.025em'
          }}>
            Bridging environmental climate science with machine intelligence.
          </h2>
          <p style={{ fontSize: 16.5, color: 'var(--text-muted-light)', lineHeight: 1.65 }}>
            Agricultural productivity faces unprecedented variability due to shifting rainfall regimes, 
            rising temperature anomalies, and variable chemical input efficiency. AgriYield AI provides 
            a transparent, scientifically audited framework to anticipate harvest outcomes while quantifying 
            predictive uncertainty.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24
        }}>
          {/* Pillar 1 */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-offwhite-border)',
            borderRadius: 18,
            padding: 30,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(45, 62, 44, 0.08)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <CloudRain size={22} />
            </div>
            <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', marginBottom: 10 }}>
              Environmental Sensitivity
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
              Aggregates precipitation regimes, mean surface temperatures, and historical pesticide 
              application rates across 101 global agro-climatic zones to capture non-linear agro-meteorological responses.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-offwhite-border)',
            borderRadius: 18,
            padding: 30,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(45, 62, 44, 0.08)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', marginBottom: 10 }}>
              Integrated DL–ML Engine
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
              Combines gradient-boosted decision trees (XGBoost, LightGBM, Random Forest) with deep 
              tabular neural networks (PyTorch Tabular MLP) and meta-ensembling to evaluate architectural tradeoffs.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-offwhite-border)',
            borderRadius: 18,
            padding: 30,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(45, 62, 44, 0.08)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <Scale size={22} />
            </div>
            <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', marginBottom: 10 }}>
              Exact TreeSHAP Explainability
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
              Moves beyond black-box estimates by providing game-theoretic Shapley additive feature 
              attributions that quantify exactly how much each environmental factor nudged yield above or below base.
            </p>
          </div>

          {/* Pillar 4 */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-offwhite-border)',
            borderRadius: 18,
            padding: 30,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(45, 62, 44, 0.08)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <ShieldAlert size={22} />
            </div>
            <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)', marginBottom: 10 }}>
              Conformal Uncertainty Bounds
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
              Calibrates prediction intervals with guaranteed finite-sample nominal 90% coverage without 
              assuming normal error distributions, delivering realistic risk boundaries for agronomic planning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
