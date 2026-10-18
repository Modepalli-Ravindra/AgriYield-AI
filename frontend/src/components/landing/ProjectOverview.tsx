import React from 'react';
import { 
  CloudIcon, 
  CpuChipIcon, 
  ScaleIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export const ProjectOverview: React.FC = () => {
  return (
    <section id="overview" style={{ padding: '90px 0', backgroundColor: '#152214' }}>
      <div className="container">
        <div style={{ maxWidth: 780, marginBottom: 50 }}>
          <div className="section-pill-badge">
            <CpuChipIcon />
            <span>INTELLIGENCE ARCHITECTURE</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 44px)',
            color: 'var(--color-offwhite)',
            marginTop: 12,
            marginBottom: 16,
            letterSpacing: '-0.025em',
            fontWeight: 800
          }}>
            Environmental climate science meets machine intelligence.
          </h2>
          <p style={{ fontSize: 16.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Agricultural productivity faces variability from shifting rainfall patterns, temperature 
            extremes, and changing input conditions. AgriYield AI delivers a calibrated, multi-model 
            pipeline to estimate harvest outcomes with full attribution and confidence bounds.
          </p>
        </div>

        {/* 4 Pillars in clean symmetrical 2x2 grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
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
              <CloudIcon style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
              Climate Volatility Analysis
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Precipitation anomalies and heat stress are mapped continuously across regional historical baselines, 
              capturing non-linear climate dependencies that traditional agronomic tables miss.
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
              <CpuChipIcon style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
              Integrated ML & DL Models
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Ensemble gradient-boosted trees (XGBoost, LightGBM, Random Forest) together with deep neural 
              networks (PyTorch MLP) capture tabular feature boundaries and complex continuous manifolds.
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
              <ScaleIcon style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
              Explainable Decision Support
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              TreeSHAP attribution decomposes predictions into exact marginal contributions (t/ha), allowing 
              users to understand exactly how temperature, rainfall, and inputs influence the harvest.
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
              <ShieldCheckIcon style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 10, fontWeight: 700 }}>
              Calibrated Uncertainty Bounds
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Group-conditional conformal prediction provides guaranteed 90% confidence bands, giving farmers 
              realistic best-case and worst-case harvest expectations under climate uncertainty.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
