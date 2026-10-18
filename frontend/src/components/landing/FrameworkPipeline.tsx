import React from 'react';
import { ArrowRight } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    step: '01',
    name: 'Environmental Inputs',
    role: 'Primary Variables',
    desc: 'Captures region, crop species, annual precipitation, average surface temperature, pesticide tonnage, and technological trend year.'
  },
  {
    step: '02',
    name: 'Integrity Validation',
    role: 'Pre-flight Pipeline',
    desc: 'Strict non-negative numerical bounds, categorical OHE alignment, and out-of-distribution advisory warning triggers.'
  },
  {
    step: '03',
    name: 'ML–DL Inference',
    role: 'Production XGBoost',
    desc: 'Transforms features through preprocessor pipeline into production XGBoost regressor (R² = 0.9681) to compute base yield in t/ha.'
  },
  {
    step: '04',
    name: 'Explainability & UQ',
    role: 'TreeSHAP & Conformal',
    desc: 'Decomposes feature influence with exact additive Shapley values while calibrating 90% non-parametric conformal error bounds.'
  },
  {
    step: '05',
    name: 'Decisional Result',
    role: 'Actionable Intelligence',
    desc: 'Delivers estimated yield, confidence envelope, waterfall breakdown, and optional climate scenario comparisons.'
  }
];

export const FrameworkPipeline: React.FC = () => {
  return (
    <section id="methodology" style={{ padding: '96px 0', backgroundColor: 'var(--color-offwhite)' }}>
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
            03 / SYSTEM ARCHITECTURE & PROCESS PIPELINE
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-forest-dark)',
            marginTop: 12,
            marginBottom: 16,
            letterSpacing: '-0.025em'
          }}>
            How the framework processes environmental factors.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
            From raw agro-climatic observations to calibrated uncertainty envelopes, every step in the 
            pipeline preserves physical validity and mathematical integrity.
          </p>
        </div>

        {/* Process Pipeline Track */}
        <div className="pipeline-track">
          {PIPELINE_STAGES.map((s, idx) => (
            <div key={s.step} className="pipeline-node">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12
              }}>
                <span className="pipeline-node-number">STAGE {s.step}</span>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <span style={{ color: 'var(--color-muted)', display: 'inline-block' }}>
                    <ArrowRight size={14} />
                  </span>
                )}
              </div>
              <h4 className="pipeline-node-title">{s.name}</h4>
              <span style={{
                display: 'inline-block',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-forest-light)',
                background: 'var(--color-offwhite)',
                padding: '2px 8px',
                borderRadius: 4,
                marginBottom: 10,
                border: '1px solid var(--color-offwhite-border)'
              }}>
                {s.role}
              </span>
              <p className="pipeline-node-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
