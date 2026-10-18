import React, { useState } from 'react';
import { ArrowRight, Cpu } from 'lucide-react';
import { CanvasReveal } from './CanvasReveal';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreMethodology: () => void;
}

// Sample illustrative presets for the demo card (explicitly marked as demo)
const DEMO_PRESETS = [
  {
    crop: 'Wheat',
    country: 'France',
    rainfall: 820,
    temp: 16.5,
    pesticides: 14500,
    demoYield: '7.12',
    demoLower: '5.98',
    demoUpper: '8.26',
    margin: '±1.14',
    coverage: '90%'
  },
  {
    crop: 'Maize',
    country: 'United States',
    rainfall: 950,
    temp: 22.0,
    pesticides: 45000,
    demoYield: '9.45',
    demoLower: '8.10',
    demoUpper: '10.80',
    margin: '±1.35',
    coverage: '90%'
  },
  {
    crop: 'Rice, paddy',
    country: 'India',
    rainfall: 1350,
    temp: 27.5,
    pesticides: 38000,
    demoYield: '3.82',
    demoLower: '2.95',
    demoUpper: '4.69',
    margin: '±0.87',
    coverage: '90%'
  },
  {
    crop: 'Potatoes',
    country: 'Germany',
    rainfall: 780,
    temp: 14.8,
    pesticides: 21000,
    demoYield: '42.80',
    demoLower: '36.50',
    demoUpper: '49.10',
    margin: '±6.30',
    coverage: '90%'
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExploreMethodology }) => {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activePreset = DEMO_PRESETS[activePresetIndex];

  return (
    <section className="hero-section">
      <CanvasReveal />
      
      <div className="container hero-content">
        <div className="hero-pill">
          <Cpu size={14} />
          <span>RESEARCH-GRADE AGRI-TECH FRAMEWORK</span>
        </div>

        <h1 className="hero-title">
          Predict crop yields with <span className="highlight">environmental intelligence</span>.
        </h1>

        <p className="hero-description">
          An integrated machine-learning and deep-learning framework that analyzes environmental 
          factors to estimate crop yield, explain influential variables, and communicate prediction uncertainty.
        </p>

        <div className="hero-cta-group">
          <button className="btn-primary" onClick={onGetStarted}>
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" onClick={onExploreMethodology}>
            <span>Explore the methodology</span>
          </button>
        </div>

        {/* Illustrative Interactive Prediction Card (Clearly Marked) */}
        <div style={{
          background: 'rgba(25, 37, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--color-forest-border)',
          borderRadius: 24,
          padding: '24px',
          maxWidth: 780,
          margin: '0 auto',
          textAlign: 'left',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Demo disclaimer banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            marginBottom: 16,
            borderBottom: '1px solid rgba(169, 180, 158, 0.15)',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--color-lime)',
                boxShadow: '0 0 8px var(--color-lime)'
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--color-lime)',
                letterSpacing: '0.04em'
              }}>
                INTERACTIVE PREVIEW • SAMPLE BENCHMARK PRESETS
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-muted)',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '2px 8px',
              borderRadius: 4
            }}>
              ILLUSTRATIVE DATA
            </span>
          </div>

          {/* Preset Selector */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            overflowX: 'auto',
            paddingBottom: 4
          }}>
            {DEMO_PRESETS.map((p, idx) => (
              <button
                key={p.crop}
                onClick={() => setActivePresetIndex(idx)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 100,
                  fontSize: 12.5,
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  background: activePresetIndex === idx ? 'var(--color-lime)' : 'rgba(255, 255, 255, 0.06)',
                  color: activePresetIndex === idx ? 'var(--color-forest-dark)' : 'var(--color-muted)',
                  border: activePresetIndex === idx ? '1px solid var(--color-lime)' : '1px solid rgba(169, 180, 158, 0.2)'
                }}
              >
                {p.crop} ({p.country})
              </button>
            ))}
          </div>

          {/* Preset Data Visual Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16
          }}>
            {/* Environmental Factors */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid rgba(169, 180, 158, 0.12)'
            }}>
              <span style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-muted)',
                display: 'block',
                marginBottom: 8
              }}>
                SIMULATED ENVIRONMENTAL FACTORS
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Rainfall:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>{activePreset.rainfall} mm/yr</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Avg Temp:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>{activePreset.temp} °C</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Pesticides:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>{activePreset.pesticides.toLocaleString()} t</span>
                </div>
              </div>
            </div>

            {/* Yield Prediction */}
            <div style={{
              background: 'rgba(45, 62, 44, 0.6)',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid rgba(228, 253, 151, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-lime)',
                display: 'block',
                marginBottom: 4
              }}>
                PRODUCTION ESTIMATOR (XGBOOST)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontSize: 32,
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-lime)',
                  lineHeight: 1
                }}>
                  {activePreset.demoYield}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>tonnes / ha</span>
              </div>
              <span style={{
                fontSize: 11.5,
                color: 'var(--color-muted)',
                marginTop: 6
              }}>
                R² = 0.9681 • Verified pipeline
              </span>
            </div>

            {/* Conformal Uncertainty */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid rgba(169, 180, 158, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-muted)',
                display: 'block',
                marginBottom: 4
              }}>
                90% CONFORMAL UNCERTAINTY
              </span>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--color-offwhite)'
              }}>
                [{activePreset.demoLower} — {activePreset.demoUpper}]
              </div>
              <span style={{
                fontSize: 11.5,
                color: 'var(--color-muted)',
                marginTop: 6
              }}>
                Non-parametric calibrated margin: {activePreset.margin} t/ha
              </span>
            </div>
          </div>
        </div>

        {/* Spec Items Footer */}
        <div className="hero-spec-pills">
          <div className="hero-spec-item">
            <span className="hero-spec-dot" />
            <span>101 Global Territories</span>
          </div>
          <div className="hero-spec-item">
            <span className="hero-spec-dot" />
            <span>10 FAOSTAT Staple Crops</span>
          </div>
          <div className="hero-spec-item">
            <span className="hero-spec-dot" />
            <span>XGBoost Production Pipeline</span>
          </div>
          <div className="hero-spec-item">
            <span className="hero-spec-dot" />
            <span>90% Nominal Conformal Bounds</span>
          </div>
          <div className="hero-spec-item">
            <span className="hero-spec-dot" />
            <span>Exact TreeSHAP Attribution</span>
          </div>
        </div>
      </div>
    </section>
  );
};
