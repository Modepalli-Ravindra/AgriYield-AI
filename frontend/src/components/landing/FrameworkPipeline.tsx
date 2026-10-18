import React from 'react';
import { 
  CloudIcon, 
  CheckCircleIcon, 
  CpuChipIcon, 
  ShieldCheckIcon, 
  DocumentCheckIcon 
} from '@heroicons/react/24/outline';

const STAGES = [
  {
    step: '01',
    title: 'Environmental Inputs',
    subtitle: 'Climate & Agronomic Indicators',
    desc: 'Ingests rainfall, average temperature, pesticide application, country baseline, and crop species indicators.',
    icon: CloudIcon
  },
  {
    step: '02',
    title: 'Input Validation',
    subtitle: 'Range & Outlier Protection',
    desc: 'Validates strict numerical bounds and generates advisory alerts if climate values exceed historical training ranges.',
    icon: CheckCircleIcon
  },
  {
    step: '03',
    title: 'Prediction Pipeline',
    subtitle: 'XGBoost & Deep Learning Models',
    desc: 'Inference executed through optimized gradient boosted trees with 300 estimators, capturing nonlinear interactions.',
    icon: CpuChipIcon
  },
  {
    step: '04',
    title: 'Explainability & Bounds',
    subtitle: 'TreeSHAP & Conformal UQ',
    desc: 'Computes exact additive feature contributions and establishes 90% non-parametric conformal uncertainty intervals.',
    icon: ShieldCheckIcon
  },
  {
    step: '05',
    title: 'Decision Support',
    subtitle: 'Actionable Harvest Forecast',
    desc: 'Delivers interpretable yield estimates in metric tonnes/ha, uncertainty boundaries, and sensitivity simulations.',
    icon: DocumentCheckIcon
  }
];

export const FrameworkPipeline: React.FC = () => {
  return (
    <section id="methodology" style={{ padding: '90px 0', backgroundColor: '#121B11', borderBottom: '1px solid var(--color-forest-border)' }}>
      <div className="container">
        <div style={{ maxWidth: 740, marginBottom: 50 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-lime)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            APPLICATION WORKFLOW
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-offwhite)',
            marginTop: 12,
            marginBottom: 16,
            fontWeight: 800
          }}>
            How AgriYield AI processes environmental data.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            A sequential five-stage pipeline designed for scientific transparency, mathematical rigor, 
            and immediate decision support for agronomists and agricultural planners.
          </p>
        </div>

        {/* Pipeline Process Flow */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 20,
          position: 'relative'
        }}>
          {STAGES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--color-forest-surface)',
                  borderRadius: 18,
                  padding: 26,
                  border: '1px solid var(--color-forest-border)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 800,
                      color: 'var(--color-lime)',
                      background: 'rgba(228, 253, 151, 0.12)',
                      padding: '4px 10px',
                      borderRadius: 100
                    }}>
                      {s.step}
                    </span>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(228, 253, 151, 0.1)',
                      color: 'var(--color-lime)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ width: 18, height: 18 }} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 4, fontWeight: 700 }}>
                    {s.title}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 12, fontWeight: 500 }}>
                    {s.subtitle}
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
