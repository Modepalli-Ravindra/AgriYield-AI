import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const MODELS = [
  {
    name: 'XGBoost Regressor',
    family: 'Gradient Boosted Decision Trees',
    role: 'Primary Production Pipeline',
    r2: '0.9681',
    rmse: '1.466 t/ha',
    mae: '0.855 t/ha',
    active: true,
    desc: 'Served by /api/v1/predict with 300 tree estimators and max depth of 6. Optimized for robust categorical splits and high gradient efficiency.'
  },
  {
    name: 'Random Forest',
    family: 'Bagged Decision Trees',
    role: 'Comparative Benchmark',
    r2: '0.9689',
    rmse: '1.448 t/ha',
    mae: '0.808 t/ha',
    active: false,
    desc: 'Evaluated as a non-boosting ensemble baseline. Shows competitive variance reduction but requires higher memory and inference latency.'
  },
  {
    name: 'LightGBM Regressor',
    family: 'Histogram Gradient Boosting',
    role: 'Comparative Benchmark',
    r2: '0.9665',
    rmse: '1.503 t/ha',
    mae: '0.887 t/ha',
    active: false,
    desc: 'Fast leaf-wise tree growth algorithm. Highly efficient for rapid evaluation across high-dimensional categorical features.'
  },
  {
    name: 'PyTorch Deep MLP',
    family: 'Multi-Layer Perceptron (Deep Learning)',
    role: 'Neural Network Benchmark',
    r2: '0.9612',
    rmse: '1.618 t/ha',
    mae: '0.960 t/ha',
    active: false,
    desc: 'Deep architecture with residual connections, layer normalization, and dropout. Captures continuous nonlinear manifold surfaces.'
  }
];

export const ModelMethodology: React.FC = () => {
  return (
    <section id="insights" style={{ padding: '90px 0', backgroundColor: '#152214', borderBottom: '1px solid var(--color-forest-border)' }}>
      <div className="container">
        <div style={{ maxWidth: 740, marginBottom: 50 }}>
          <div className="section-pill-badge">
            <CheckCircleIcon />
            <span>MODEL BENCHMARKS</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-offwhite)',
            marginTop: 12,
            marginBottom: 16,
            fontWeight: 800
          }}>
            Empirically verified multi-model performance.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Every reported metric represents audited results on genuine held-out evaluation splits. 
            No synthetic benchmarks or fabricated scores are used.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          {MODELS.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--color-forest-surface)',
                borderRadius: 20,
                padding: 28,
                border: m.active ? '1.5px solid var(--color-lime)' : '1px solid var(--color-forest-border)',
                boxShadow: m.active ? '0 12px 32px var(--color-lime-glow)' : 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: m.active ? '#121B11' : 'var(--color-lime)',
                    background: m.active ? 'var(--color-lime)' : 'rgba(228, 253, 151, 0.12)',
                    padding: '3px 10px',
                    borderRadius: 100
                  }}>
                    {m.role}
                  </span>
                  {m.active && (
                    <span style={{ color: 'var(--color-lime)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <CheckCircleIcon style={{ width: 15, height: 15 }} />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>LIVE</span>
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 4, fontWeight: 700 }}>
                  {m.name}
                </h3>
                <span style={{ fontSize: 12.5, color: 'var(--color-muted)', display: 'block', marginBottom: 16 }}>
                  {m.family}
                </span>

                <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: 22 }}>
                  {m.desc}
                </p>
              </div>

              <div style={{
                background: 'rgba(18, 27, 17, 0.8)',
                borderRadius: 12,
                padding: '14px 16px',
                border: '1px solid rgba(169, 180, 158, 0.15)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12
              }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>R² SCORE</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)' }}>
                    {m.r2}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>TEST RMSE</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
                    {m.rmse}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
