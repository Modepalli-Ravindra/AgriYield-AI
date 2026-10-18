import React from 'react';
import { CloudRain, Scale, ShieldAlert, Cpu } from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  return (
    <section id="overview" style={{ padding: '100px 0', backgroundColor: '#152214' }}>
      <div className="container">
        <div style={{ maxWidth: 780, marginBottom: 56 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-lime)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            01 / PROJECT OVERVIEW
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 44px)',
            color: 'var(--color-offwhite)',
            marginTop: 12,
            marginBottom: 18,
            letterSpacing: '-0.025em',
            fontWeight: 800
          }}>
            Bridging environmental climate science with machine intelligence.
          </h2>
          <p style={{ fontSize: 16.5, color: 'var(--color-muted)', lineHeight: 1.65 }}>
            Agricultural productivity faces unprecedented variability due to shifting rainfall regimes, 
            rising temperature anomalies, and variable chemical input efficiency. AgriYield AI provides 
            a mathematically grounded, dual-model architecture to reliably estimate harvest yield before fieldwork begins.
          </p>
        </div>

        {/* 4 Pillars in clean symmetrical 2x2 grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 28
        }}>
          <div style={{
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 32,
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <CloudRain size={22} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 12, fontWeight: 700 }}>
              Climate & Weather Volatility
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Extreme precipitation fluctuations, prolonged heat spells, and changing seasons directly threaten food security. 
              Traditional agronomic lookup tables fail to capture complex, multi-factor climate dependencies.
            </p>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 32,
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 12, fontWeight: 700 }}>
              Integrated ML & DL Architectures
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Combining gradient-boosted trees (XGBoost, LightGBM, Random Forest) with deep neural networks 
              (PyTorch MLP) allows the system to capture both tabular feature splits and deep continuous cross-interactions.
            </p>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 32,
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <Scale size={22} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 12, fontWeight: 700 }}>
              Explainable Decision Support
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Black-box predictions lack credibility in scientific and farming contexts. We utilize TreeSHAP 
              (Shapley Additive exPlanations) to transparently isolate each factor's exact marginal contribution in tonnes per hectare.
            </p>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 20,
            padding: 32,
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <ShieldAlert size={22} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 12, fontWeight: 700 }}>
              Conformal Uncertainty Bounds
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Point estimates can be misleading under severe weather anomalies. Group-aware conformal prediction 
              generates rigorous 90% confidence bands, giving farmers reliable best-case and worst-case harvest expectations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
