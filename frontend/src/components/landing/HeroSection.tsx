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
      paddingTop: 110,
      paddingBottom: 45,
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
        height: 500,
        background: 'radial-gradient(ellipse at 50% 10%, rgba(228, 253, 151, 0.12) 0%, rgba(18, 27, 17, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Split Grid: Left side text/CTAs, Right side Animation Component */}
        <div className="hero-split-grid" style={{ marginBottom: 40 }}>
          {/* Left Column */}
          <div className="hero-split-left">
            <div className="section-pill-badge" style={{ marginBottom: 16 }}>
              <CpuChipIcon />
              <span>ENVIRONMENTAL INTELLIGENCE PLATFORM</span>
            </div>

            {/* Exactly two lines headline as requested */}
            <h1 style={{
              fontSize: 'clamp(28px, 3.2vw, 48px)',
              lineHeight: 1.15,
              fontWeight: 800,
              color: 'var(--color-offwhite)',
              letterSpacing: '-0.03em',
              marginBottom: 14
            }}>
              Predict crop yields with <br />
              <span style={{ color: 'var(--color-lime)' }}>environmental intelligence.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(14.5px, 1.1vw, 17px)',
              color: 'var(--color-muted)',
              marginBottom: 24,
              lineHeight: 1.55,
              maxWidth: 540
            }}>
              A production application combining machine learning, regional climate data, and 
              conformal uncertainty bounds to give farmers and agronomists clear yield expectations.
            </p>

            {/* Action CTAs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 24
            }}>
              <button className="btn-primary" onClick={onGetStarted} style={{ padding: '12px 26px', fontSize: 14 }}>
                <span>Launch Prediction Console</span>
                <ArrowRightIcon style={{ width: 15, height: 15 }} />
              </button>
              <button className="btn-secondary" onClick={onExploreMethodology} style={{ padding: '12px 22px', fontSize: 14 }}>
                <span>Explore How It Works</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div style={{
              display: 'flex',
              gap: 16,
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
          gap: 18,
          textAlign: 'left'
        }}>
          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 16,
            padding: '20px 20px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChartBarIcon style={{ width: 17, height: 17 }} />
              </div>
              <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                PREDICTIVE PRECISION
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
              96.8% Accuracy
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              R² = 0.9681 & 1.46 t/ha RMSE evaluated across strict disjoint geographic test splits.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 16,
            padding: '20px 20px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheckIcon style={{ width: 17, height: 17 }} />
              </div>
              <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                UNCERTAINTY BOUNDS
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
              90% Confidence
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              Statistically calibrated conformal prediction intervals showing best-case and worst-case bounds.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 16,
            padding: '20px 20px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SunIcon style={{ width: 17, height: 17 }} />
              </div>
              <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                ENVIRONMENTAL FACTORS
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
              6 Core Indicators
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              Joint analysis of Rainfall, Temperature, Fertilizer, Pesticides, Soil Quality, and Crop category.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 16,
            padding: '20px 20px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SparklesIcon style={{ width: 17, height: 17 }} />
              </div>
              <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                LOCAL & GLOBAL SHAP
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
              Explainable AI
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              Exact TreeSHAP attributions reveal precisely which climatic variables drove the yield up or down.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
