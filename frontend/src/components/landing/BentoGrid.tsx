import React from 'react';
import { 
  ChartBarIcon, 
  PresentationChartLineIcon, 
  ShieldCheckIcon, 
  CpuChipIcon, 
  AdjustmentsHorizontalIcon, 
  CircleStackIcon
} from '@heroicons/react/24/outline';

const CAPABILITIES = [
  {
    icon: CpuChipIcon,
    tag: 'PRODUCTION ENGINE',
    title: 'Gradient Boosted Trees',
    desc: 'Served by /api/v1/predict with 300 tree estimators and max depth 6. Delivers sub-15ms inference latency across 10 staple crops and 101 global regions.',
    metric: '300 Estimators · < 15ms Latency'
  },
  {
    icon: ShieldCheckIcon,
    tag: 'UNCERTAINTY BOUNDS',
    title: 'Conformal Confidence Limits',
    desc: 'Non-parametric conformal intervals conditioned on crop species guarantee a 90% statistical coverage bound. Essential for risk mitigation during extreme weather.',
    metric: '90% Coverage Guarantee'
  },
  {
    icon: PresentationChartLineIcon,
    tag: 'EXPLAINABLE AI',
    title: 'TreeSHAP Factor Attribution',
    desc: 'Exact additive feature attribution isolates exactly how temperature, rainfall, and agrochemicals influenced the final harvest volume in tonnes per hectare.',
    metric: 'Additive Marginal Values (t/ha)'
  },
  {
    icon: ChartBarIcon,
    tag: 'BENCHMARK SUITE',
    title: 'Multi-Model Comparisons',
    desc: 'Side-by-side empirical evaluation between XGBoost, Random Forest, LightGBM, and PyTorch Deep MLP evaluated on strict disjoint geographic test splits.',
    metric: 'R² > 0.96 Across Models'
  },
  {
    icon: AdjustmentsHorizontalIcon,
    tag: 'DECISION SUPPORT',
    title: 'Sensitivity & What-If Scenarios',
    desc: 'Simulate agricultural decisions before planting by testing weather variations and chemical treatments dynamically to identify optimal yield response curves.',
    metric: '±50% Dynamic Sweeps'
  },
  {
    icon: CircleStackIcon,
    tag: 'CLOUD PERSISTENCE',
    title: 'PostgreSQL Database & Protection',
    desc: 'Thread-safe cloud PostgreSQL storage with user-isolated prediction history, schema migrations, and real-time agronomic range and outlier warnings.',
    metric: 'Secure History & Outlier Defense'
  }
];

export const BentoGrid: React.FC = () => {
  return (
    <section id="features" style={{ padding: '60px 0', backgroundColor: '#121B11', borderTop: '1px solid var(--color-forest-border)', borderBottom: '1px solid var(--color-forest-border)' }}>
      <div className="container">
        {/* Centered Section Header */}
        <div style={{ maxWidth: 1100, margin: '0 auto 36px', textAlign: 'center' }}>
          <div className="section-pill-badge" style={{ marginBottom: 12 }}>
            <ChartBarIcon />
            <span>CORE CAPABILITIES</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(22px, 2.2vw, 32px)',
            color: 'var(--color-offwhite)',
            marginBottom: 10,
            fontWeight: 800,
            letterSpacing: '-0.025em'
          }}>
            Comprehensive intelligence for agricultural planning.
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--color-muted)', lineHeight: 1.5, maxWidth: 840, margin: '0 auto' }}>
            Every tool in the AgriYield AI suite connects directly to the validated backend API, 
            providing instant single-field inferences, batch processing, and uncertainty analysis.
          </p>
        </div>

        {/* Compact Symmetrical Uniform 3x2 Grid */}
        <div className="capabilities-grid">
          {CAPABILITIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--color-forest-surface)',
                  border: '1px solid var(--color-forest-border)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(228, 253, 151, 0.12)',
                      color: 'var(--color-lime)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ width: 18, height: 18 }} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: 'var(--color-lime)',
                      background: 'rgba(228, 253, 151, 0.12)',
                      padding: '3px 9px',
                      borderRadius: 100,
                      letterSpacing: '0.04em'
                    }}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 12.8, color: 'var(--color-muted)', lineHeight: 1.48 }}>
                    {item.desc}
                  </p>
                </div>

                <div style={{
                  paddingTop: 12,
                  marginTop: 14,
                  borderTop: '1px solid rgba(169, 180, 158, 0.14)',
                  fontSize: 11.5,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{item.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
