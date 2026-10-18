import React from 'react';
import { 
  ArrowRightIcon, 
  ChartBarIcon, 
  ShieldCheckIcon, 
  SunIcon, 
  SparklesIcon,
  CpuChipIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeroAppAnimation } from './HeroAppAnimation';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreMethodology: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onExploreMethodology
}) => {
  return (
    <section style={{
      position: 'relative',
      paddingTop: 130,
      paddingBottom: 70,
      overflow: 'hidden',
      backgroundColor: '#121B11'
    }}>
      {/* Background radial gradient glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 1200,
        height: 600,
        background: 'radial-gradient(ellipse at 50% 10%, rgba(228, 253, 151, 0.12) 0%, rgba(18, 27, 17, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Split Grid: Left side text/CTAs, Right side Animation Component */}
        <div className="hero-split-grid">
          {/* Left Column */}
          <div className="hero-split-left">
            <div className="section-pill-badge" style={{ marginBottom: 20 }}>
              <CpuChipIcon />
              <span>ENVIRONMENTAL INTELLIGENCE PLATFORM</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 3.8vw, 56px)',
              lineHeight: 1.12,
              fontWeight: 800,
              color: 'var(--color-offwhite)',
              letterSpacing: '-0.03em',
              marginBottom: 18
            }}>
              Predict crop yields with <span style={{ color: 'var(--color-lime)' }}>environmental intelligence</span>.
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 1.15vw, 17.5px)',
              color: 'var(--color-muted)',
              marginBottom: 32,
              lineHeight: 1.6,
              maxWidth: 580
            }}>
              A production application combining machine learning, regional climate data, and 
              conformal uncertainty bounds to give farmers and agronomists clear yield expectations.
            </p>

            {/* Action CTAs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 32
            }}>
              <button className="btn-primary" onClick={onGetStarted} style={{ padding: '13px 28px', fontSize: 14.5 }}>
                <span>Launch Prediction Console</span>
                <ArrowRightIcon style={{ width: 15, height: 15 }} />
              </button>
              <button className="btn-secondary" onClick={onExploreMethodology} style={{ padding: '13px 24px', fontSize: 14.5 }}>
                <span>Explore How It Works</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div style={{
              display: 'flex',
              gap: 18,
              flexWrap: 'wrap',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <CheckCircleIcon style={{ width: 14, height: 14, color: 'var(--color-lime)' }} />
                96.8% Accuracy
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <CheckCircleIcon style={{ width: 14, height: 14, color: 'var(--color-lime)' }} />
                90% Confidence Bounds
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <CheckCircleIcon style={{ width: 14, height: 14, color: 'var(--color-lime)' }} />
                TreeSHAP Attributions
              </span>
            </div>
          </div>

          {/* Right Column: HeroAppAnimation arranged beside the hero text */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <HeroAppAnimation />
          </div>
        </div>

        {/* Key Metrics Grid Below */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          textAlign: 'left'
        }}>
          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 18,
            padding: '24px 22px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChartBarIcon style={{ width: 18, height: 18 }} />
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                PREDICTIVE PRECISION
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              96.8% Accuracy
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
              R² = 0.9681 & 1.46 t/ha RMSE evaluated across strict disjoint geographic test splits.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 18,
            padding: '24px 22px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheckIcon style={{ width: 18, height: 18 }} />
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                UNCERTAINTY BOUNDS
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              90% Confidence
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Statistically calibrated conformal prediction intervals showing best-case and worst-case bounds.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 18,
            padding: '24px 22px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SunIcon style={{ width: 18, height: 18 }} />
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                ENVIRONMENTAL FACTORS
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              6 Core Indicators
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Joint analysis of Rainfall, Temperature, Fertilizer, Pesticides, Soil Quality, and Crop category.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 18,
            padding: '24px 22px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SparklesIcon style={{ width: 18, height: 18 }} />
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                LOCAL & GLOBAL SHAP
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              Explainable AI
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Exact TreeSHAP attributions reveal precisely which climatic variables drove the yield up or down.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
