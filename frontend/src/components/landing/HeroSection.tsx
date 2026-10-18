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
      paddingTop: 'clamp(118px, 11.5vh, 138px)',
      paddingBottom: 64,
      overflow: 'hidden',
      backgroundColor: '#121B11'
    }}>
      {/* Background Plant Canopy with Sunlight Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Real Agricultural Crop Canopy Image */}
        <img 
          src="/hero-bg.jpg" 
          alt="Agricultural Plant Canopy" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            opacity: 0.38,
            filter: 'saturate(1.15) brightness(0.92)'
          }} 
        />

        {/* Ambient Dark Forest Blend Gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(18, 27, 17, 0.78) 0%, rgba(18, 27, 17, 0.38) 35%, rgba(18, 27, 17, 0.82) 75%, #121B11 100%)'
        }} />

        {/* Golden Sunlight Beam Flare */}
        <div className="hero-sunlight-beam" />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 3 }}>
        {/* Centered Hero Content */}
        <div style={{ textAlign: 'center', maxWidth: 1180, margin: '0 auto 46px' }}>
          <div className="section-pill-badge" style={{ 
            marginBottom: 20,
            padding: '8px 22px',
            fontSize: 14,
            letterSpacing: '0.06em'
          }}>
            <CpuChipIcon style={{ width: 17, height: 17 }} />
            <span>ENVIRONMENTAL INTELLIGENCE PLATFORM</span>
          </div>

          {/* Exactly two lines headline with grand increased typography */}
          <h1 style={{
            fontSize: 'clamp(50px, 5.4vw, 80px)',
            lineHeight: 1.10,
            fontWeight: 800,
            color: 'var(--color-offwhite)',
            letterSpacing: '-0.035em',
            marginBottom: 20,
            whiteSpace: 'normal'
          }}>
            <span style={{ display: 'inline-block' }}>Predict crop yields with</span>{' '}
            <br />
            <span style={{ display: 'inline-block', color: 'var(--color-lime)' }}>environmental intelligence.</span>
          </h1>

          {/* Subtitle: decreased text size, increased width, strictly two lines */}
          <p style={{
            fontSize: 'clamp(14.5px, 1.05vw, 16px)',
            color: 'var(--color-muted)',
            marginBottom: 28,
            lineHeight: 1.55,
            maxWidth: 820,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            A production application combining machine learning, regional climate data, and 
            conformal uncertainty bounds to give farmers and agronomists clear yield expectations.
          </p>

          {/* Action CTAs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 26
          }}>
            <button className="btn-primary" onClick={onGetStarted} style={{ padding: '14px 30px', fontSize: 15 }}>
              <span>Launch Prediction Console</span>
              <ArrowRightIcon style={{ width: 16, height: 16 }} />
            </button>
            <button className="btn-secondary" onClick={onExploreMethodology} style={{ padding: '14px 26px', fontSize: 15 }}>
              <span>Explore How It Works</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 22,
            flexWrap: 'wrap',
            fontSize: 12.5,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-muted)'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 15, height: 15, color: 'var(--color-lime)' }} />
              96.8% Accuracy
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 15, height: 15, color: 'var(--color-lime)' }} />
              90% Confidence Bounds
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 15, height: 15, color: 'var(--color-lime)' }} />
              TreeSHAP Attributions
            </span>
          </div>
        </div>

        {/* Compressed Key Metrics Grid with Decreased Width */}
        <div style={{
          maxWidth: 1040,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          textAlign: 'left'
        }}>
          <div style={{
            background: 'rgba(28, 42, 27, 0.78)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChartBarIcon style={{ width: 15, height: 15 }} />
              </div>
              <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
                PREDICTIVE PRECISION
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              96.8% Accuracy
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              R² = 0.9681 & 1.46 t/ha RMSE evaluated across strict disjoint geographic test splits.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.78)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheckIcon style={{ width: 15, height: 15 }} />
              </div>
              <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
                UNCERTAINTY BOUNDS
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              90% Confidence
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              Statistically calibrated conformal prediction intervals showing best-case and worst-case bounds.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.78)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SunIcon style={{ width: 15, height: 15 }} />
              </div>
              <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
                ENVIRONMENTAL FACTORS
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              6 Core Indicators
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              Joint analysis of Rainfall, Temperature, Fertilizer, Pesticides, Soil Quality, and Crop category.
            </p>
          </div>

          <div style={{
            background: 'rgba(28, 42, 27, 0.78)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-forest-border)',
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(228, 253, 151, 0.15)',
                color: 'var(--color-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SparklesIcon style={{ width: 15, height: 15 }} />
              </div>
              <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
                LOCAL & GLOBAL SHAP
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 3 }}>
              Explainable AI
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.45 }}>
              Exact TreeSHAP attributions reveal precisely which climatic variables drove the yield up or down.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
