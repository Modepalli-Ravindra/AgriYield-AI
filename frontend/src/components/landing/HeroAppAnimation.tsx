import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowRightIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  ChartBarIcon, 
  CloudIcon, 
  SunIcon, 
  BeakerIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export const HeroAppAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const steps = [
    { title: '1. Ingest Data', label: 'Environmental Input' },
    { title: '2. ML/DL Engine', label: 'Feature Attribution' },
    { title: '3. Yield & Range', label: 'Calibrated Bounds' }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div style={{
      width: '100%',
      maxWidth: 960,
      margin: '0 auto 48px',
      background: 'rgba(21, 34, 20, 0.95)',
      backdropFilter: 'blur(24px)',
      border: '1px solid var(--color-forest-border)',
      borderRadius: 24,
      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 30px rgba(228, 253, 151, 0.05)',
      overflow: 'hidden',
      textAlign: 'left',
      position: 'relative'
    }}>
      {/* Top Console Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(169, 180, 158, 0.15)',
        background: 'rgba(18, 27, 17, 0.75)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--color-muted)',
            letterSpacing: '0.04em'
          }}>
            LIVE APPLICATION PIPELINE SIMULATOR
          </span>
        </div>

        {/* Play/Pause controls & manual tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.25)', padding: 3, borderRadius: 10 }}>
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  background: activeStep === idx ? 'var(--color-lime)' : 'transparent',
                  color: activeStep === idx ? '#121B11' : 'var(--color-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(228, 253, 151, 0.12)',
              border: '1px solid rgba(228, 253, 151, 0.25)',
              color: 'var(--color-lime)',
              cursor: 'pointer'
            }}
            title={isPlaying ? 'Pause auto-play' : 'Resume auto-play'}
          >
            {isPlaying ? <PauseIcon style={{ width: 15, height: 15 }} /> : <PlayIcon style={{ width: 15, height: 15 }} />}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div style={{ padding: '32px 32px 28px', minHeight: 310 }}>
        {/* Step 0: Input Ingestion */}
        {activeStep === 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-lime)' }}>
              <CloudIcon style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 1 — Multi-Factor Climate Ingestion
              </span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 8 }}>
              Real-time Ingestion of Environmental & Agronomic Drivers
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              The application ingests precise atmospheric and farm input values to construct an agro-climatic profile.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14
            }}>
              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-lime)', marginBottom: 6 }}>
                  <CloudIcon style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>RAINFALL</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-offwhite)' }}>1,080 mm</div>
                <span style={{ fontSize: 11, color: 'var(--color-lime)' }}>Optimal range for wheat</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-lime)', marginBottom: 6 }}>
                  <SunIcon style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>TEMPERATURE</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-offwhite)' }}>16.4 °C</div>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Mean growing temperature</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-lime)', marginBottom: 6 }}>
                  <BeakerIcon style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>PESTICIDES</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-offwhite)' }}>45,000 t</div>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Crop protection factor</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-lime)', marginBottom: 6 }}>
                  <GlobeAltIcon style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>CROP & REGION</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-offwhite)' }}>Wheat · France</div>
                <span style={{ fontSize: 11, color: 'var(--color-lime)' }}>High yield baseline zone</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Engine Analysis & TreeSHAP */}
        {activeStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-lime)' }}>
              <SparklesIcon style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 2 — Explainable AI Decomposition
              </span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 8 }}>
              TreeSHAP Quantifies Exactly Why the Yield Changes
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              No black-box guesswork. Every factor is evaluated additively to reveal its precise impact on final harvest tonnage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#141F13', borderRadius: 12, padding: '12px 18px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CloudIcon style={{ width: 18, height: 18, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>Rainfall (+890mm vs regional normal)</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)', fontSize: 14 }}>+1.42 t/ha impact</span>
              </div>

              <div style={{ background: '#141F13', borderRadius: 12, padding: '12px 18px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SunIcon style={{ width: 18, height: 18, color: '#F87171' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>Growing Season Heat Deficit</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F87171', fontSize: 14 }}>-0.28 t/ha impact</span>
              </div>

              <div style={{ background: '#141F13', borderRadius: 12, padding: '12px 18px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ChartBarIcon style={{ width: 18, height: 18, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>Crop Variety Genetics Ceiling</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)', fontSize: 14 }}>+0.74 t/ha impact</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Yield & Uncertainty Output */}
        {activeStep === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-lime)' }}>
              <ShieldCheckIcon style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 3 — Actionable Yield & Confidence Interval
              </span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 8 }}>
              Estimated Harvest with Guaranteed 90% Confidence Bounds
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Provides both a point estimate and a statistically proven range so farm planners know best and worst-case scenarios.
            </p>

            <div style={{
              background: 'radial-gradient(circle at 50% 30%, #263825 0%, #162415 100%)',
              border: '1.5px solid var(--color-lime)',
              borderRadius: 18,
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
              boxShadow: '0 8px 28px var(--color-lime-glow)'
            }}>
              <div>
                <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>PREDICTED HARVEST YIELD</span>
                <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--color-lime)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                  7.24 <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-offwhite)' }}>t/ha</span>
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>Equivalent to ~72.4 quintals per hectare</span>
              </div>

              <div style={{
                background: 'rgba(18, 27, 17, 0.85)',
                borderRadius: 14,
                padding: '16px 20px',
                border: '1px solid rgba(169, 180, 158, 0.2)'
              }}>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>90% Confidence Interval:</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
                  6.10 — 8.38 t/ha
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-lime)', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <CheckCircleIcon style={{ width: 14, height: 14 }} /> 
                  Coverage guaranteed across test splits
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Step Indicator Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        borderTop: '1px solid rgba(169, 180, 158, 0.12)',
        background: 'rgba(18, 27, 17, 0.6)',
        fontSize: 12.5,
        color: 'var(--color-muted)'
      }}>
        <span>Interactive Application Demo · Step {activeStep + 1} of 3</span>
        <button
          onClick={() => { setActiveStep((activeStep + 1) % 3); setIsPlaying(false); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-lime)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <span>Next Stage</span>
          <ArrowRightIcon style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
};
