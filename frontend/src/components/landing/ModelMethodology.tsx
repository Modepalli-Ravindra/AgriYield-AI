import React from 'react';
import { CheckCircle2 } from 'lucide-react';

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
    desc: 'Fast leaf-wise tree growth benchmark evaluated across the 4-way disjoint group split for high-throughput exploration.'
  },
  {
    name: 'PyTorch Tabular MLP',
    family: 'Deep Feedforward Neural Network',
    role: 'Deep Learning Comparator',
    r2: '0.9612',
    rmse: '1.618 t/ha',
    mae: '0.942 t/ha',
    active: false,
    desc: '3-layer fully connected architecture with BatchNorm, ReLU activations, and Dropout. Captures continuous embeddings for comparison against tree estimators.'
  }
];

export const ModelMethodology: React.FC = () => {
  return (
    <section id="insights" style={{ padding: '96px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-offwhite-border)' }}>
      <div className="container">
        <div style={{ maxWidth: 740, marginBottom: 50 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-forest)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            04 / MODEL METHODOLOGY & EMPIRICAL BENCHMARKS
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-forest-dark)',
            marginTop: 12,
            marginBottom: 16,
            letterSpacing: '-0.025em'
          }}>
            Rigorous multi-model validation.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
            Rather than relying on a single untested algorithm, AgriYield AI compares four distinct 
            architectures evaluated on disjoint group-level holdout sets to prevent data leakage.
          </p>
        </div>

        {/* Model Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 20
        }}>
          {MODELS.map((m) => (
            <div
              key={m.name}
              style={{
                background: m.active ? 'var(--color-forest)' : 'var(--color-offwhite)',
                color: m.active ? 'var(--color-offwhite)' : 'var(--text-primary-light)',
                border: m.active ? '1px solid var(--color-forest-border)' : '1px solid var(--color-offwhite-border)',
                borderRadius: 18,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: m.active ? '0 12px 32px rgba(45, 62, 44, 0.25)' : 'var(--shadow-subtle)',
                position: 'relative'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: m.active ? 'var(--color-lime)' : '#E2E6DC',
                  color: m.active ? 'var(--color-forest-dark)' : 'var(--color-forest)'
                }}>
                  {m.role}
                </span>
                {m.active && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: 'var(--color-lime)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <CheckCircle2 size={13} /> ACTIVE
                  </span>
                )}
              </div>

              <h4 style={{
                fontSize: 19,
                fontWeight: 700,
                marginBottom: 4,
                color: m.active ? 'var(--color-offwhite)' : 'var(--color-forest-dark)'
              }}>
                {m.name}
              </h4>
              <span style={{
                fontSize: 12,
                color: m.active ? 'var(--color-muted)' : 'var(--text-muted-light)',
                marginBottom: 18,
                display: 'block'
              }}>
                {m.family}
              </span>

              {/* Metrics */}
              <div style={{
                background: m.active ? 'rgba(0, 0, 0, 0.25)' : '#FFFFFF',
                borderRadius: 12,
                padding: '12px 14px',
                border: m.active ? '1px solid rgba(169, 180, 158, 0.15)' : '1px solid var(--color-offwhite-border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                textAlign: 'center',
                marginBottom: 16
              }}>
                <div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: m.active ? 'var(--color-muted)' : 'var(--text-muted-light)' }}>R²</span>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.active ? 'var(--color-lime)' : 'var(--color-forest)' }}>{m.r2}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: m.active ? 'var(--color-muted)' : 'var(--text-muted-light)' }}>RMSE</span>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.rmse.split(' ')[0]}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: m.active ? 'var(--color-muted)' : 'var(--text-muted-light)' }}>MAE</span>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.mae.split(' ')[0]}</div>
                </div>
              </div>

              <p style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: m.active ? 'var(--color-muted)' : 'var(--text-muted-light)',
                marginTop: 'auto'
              }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
