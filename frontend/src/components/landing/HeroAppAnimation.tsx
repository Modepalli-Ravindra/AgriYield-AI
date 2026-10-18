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
    { title: '1. Ingest', label: 'Inputs' },
    { title: '2. Engine', label: 'Attribution' },
    { title: '3. Yield & Range', label: 'Bounds' }
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
      maxWidth: 620,
      background: 'rgba(21, 34, 20, 0.95)',
      backdropFilter: 'blur(24px)',
      border: '1px solid var(--color-forest-border)',
      borderRadius: 22,
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(228, 253, 151, 0.05)',
      overflow: 'hidden',
      textAlign: 'left',
      position: 'relative'
    }}>
      {/* Top Console Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 20px',
        borderBottom: '1px solid rgba(169, 180, 158, 0.15)',
        background: 'rgba(18, 27, 17, 0.75)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-muted)',
            letterSpacing: '0.04em'
          }}>
            PIPELINE SIMULATOR
          </span>
        </div>

        {/* Play/Pause controls & manual tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 8 }}>
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
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
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'rgba(228, 253, 151, 0.12)',
              border: '1px solid rgba(228, 253, 151, 0.25)',
              color: 'var(--color-lime)',
              cursor: 'pointer'
            }}
            title={isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? <PauseIcon style={{ width: 13, height: 13 }} /> : <PlayIcon style={{ width: 13, height: 13 }} />}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div style={{ padding: '24px 22px 20px', minHeight: 280 }}>
        {/* Step 0: Input Ingestion */}
        {activeStep === 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--color-lime)' }}>
              <CloudIcon style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 1 — Multi-Factor Climate Ingestion
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 6 }}>
              Real-time Ingestion of Agronomic Drivers
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Atmospheric and farm management inputs are standardized into the feature space.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12
            }}>
              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 4 }}>
                  <CloudIcon style={{ width: 15, height: 15 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>RAINFALL</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)' }}>1,080 mm</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-lime)' }}>Optimal vegetative range</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 4 }}>
                  <SunIcon style={{ width: 15, height: 15 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>TEMPERATURE</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)' }}>16.4 °C</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>Mean growing temperature</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 4 }}>
                  <BeakerIcon style={{ width: 15, height: 15 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>PESTICIDES</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)' }}>45,000 t</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>Crop protection factor</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 4 }}>
                  <GlobeAltIcon style={{ width: 15, height: 15 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>CROP & ZONE</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-offwhite)' }}>Wheat · France</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-lime)' }}>High yield baseline</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Engine Analysis & TreeSHAP */}
        {activeStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--color-lime)' }}>
              <SparklesIcon style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 2 — Explainable AI Decomposition
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 6 }}>
              TreeSHAP Factor Attribution
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Additive feature evaluation reveals exact marginal yield impacts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#141F13', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CloudIcon style={{ width: 16, height: 16, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>Rainfall (+890mm vs baseline)</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)', fontSize: 13 }}>+1.42 t/ha</span>
              </div>

              <div style={{ background: '#141F13', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SunIcon style={{ width: 16, height: 16, color: '#F87171' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>Heat Stress Deficit</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F87171', fontSize: 13 }}>-0.28 t/ha</span>
              </div>

              <div style={{ background: '#141F13', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChartBarIcon style={{ width: 16, height: 16, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-offwhite)' }}>Crop Variety Genetics</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)', fontSize: 13 }}>+0.74 t/ha</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Yield & Uncertainty Output */}
        {activeStep === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--color-lime)' }}>
              <ShieldCheckIcon style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 3 — Yield & Confidence Bounds
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 6 }}>
              Calibrated Harvest Range (90% Confidence)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Guaranteed best-case and worst-case harvest expectations.
            </p>

            <div style={{
              background: 'radial-gradient(circle at 50% 30%, #263825 0%, #162415 100%)',
              border: '1.5px solid var(--color-lime)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 8px 24px var(--color-lime-glow)'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>PREDICTED YIELD</span>
                  <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-lime)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                    7.24 <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-offwhite)' }}>t/ha</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>~72.4 quintals/ha</span>
                </div>
              </div>

              <div style={{
                background: 'rgba(18, 27, 17, 0.85)',
                borderRadius: 10,
                padding: '12px 14px',
                border: '1px solid rgba(169, 180, 158, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>90% Confidence Bounds:</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
                    6.10 — 8.38 t/ha
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-lime)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircleIcon style={{ width: 13, height: 13 }} /> Calibrated
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
        padding: '11px 20px',
        borderTop: '1px solid rgba(169, 180, 158, 0.12)',
        background: 'rgba(18, 27, 17, 0.6)',
        fontSize: 11.5,
        color: 'var(--color-muted)'
      }}>
        <span>Interactive Demo · Stage {activeStep + 1} of 3</span>
        <button
          onClick={() => { setActiveStep((activeStep + 1) % 3); setIsPlaying(false); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-lime)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 11.5
          }}
        >
          <span>Next</span>
          <ArrowRightIcon style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  );
};
