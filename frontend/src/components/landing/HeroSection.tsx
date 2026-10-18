import React from 'react';
import { ArrowRight, Cpu, BarChart3, ShieldCheck, ThermometerSun, Sparkles } from 'lucide-react';
import { CanvasReveal } from './CanvasReveal';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreMethodology: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExploreMethodology }) => {
  return (
    <section className="hero-section" style={{
      position: 'relative',
      minHeight: '92vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '130px 24px 80px',
      background: 'radial-gradient(ellipse at 50% 15%, #243523 0%, #172416 45%, #10180F 100%)',
      overflow: 'hidden'
    }}>
      <CanvasReveal />
      
      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 1100 }}>
        {/* Editorial Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(228, 253, 151, 0.1)',
          border: '1px solid rgba(228, 253, 151, 0.25)',
          padding: '6px 16px',
          borderRadius: 100,
          marginBottom: 24,
          color: 'var(--color-lime)',
          fontSize: 12.5,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          letterSpacing: '0.04em'
        }}>
          <Cpu size={14} />
          <span>RESEARCH-GRADE AGRI-TECH FRAMEWORK</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 5.2vw, 68px)',
          lineHeight: 1.1,
          fontWeight: 800,
          color: 'var(--color-offwhite)',
          letterSpacing: '-0.03em',
          maxWidth: 960,
          margin: '0 auto 24px'
        }}>
          Predict crop yields with <span style={{ color: 'var(--color-lime)' }}>environmental intelligence</span>.
        </h1>

        {/* Supporting Copy */}
        <p style={{
          fontSize: 'clamp(16px, 1.3vw, 19px)',
          color: 'var(--color-muted)',
          maxWidth: 780,
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          An integrated machine-learning and deep-learning framework that analyzes environmental 
          factors to estimate crop yield, explain influential variables, and communicate prediction uncertainty.
        </p>

        {/* Action CTAs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 60
        }}>
          <button className="btn-primary" onClick={onGetStarted} style={{ padding: '14px 32px', fontSize: 15 }}>
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" onClick={onExploreMethodology} style={{ padding: '14px 28px', fontSize: 15 }}>
            <span>Explore the methodology</span>
          </button>
        </div>

        {/* Key Metrics & Features Grid — Balanced Geometry, No Mock Clutter */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                <BarChart3 size={18} />
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                PREDICTIVE PRECISION
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              96.8% Accuracy
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
              R² = 0.9681 & 1.46 t/ha RMSE evaluated across strict 4-way disjoint geographic test splits.
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
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                UNCERTAINTY BOUNDS
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
              90% Confidence
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Non-parametric crop-conditional conformal intervals showing guaranteed lower and upper harvest bounds.
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
                <ThermometerSun size={18} />
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
                <Sparkles size={18} />
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
