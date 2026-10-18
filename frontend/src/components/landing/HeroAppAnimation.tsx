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
    { title: '1. Ingest' },
    { title: '2. Engine' },
    { title: '3. Yield & Range' }
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
      maxWidth: 630,
      background: 'rgba(21, 34, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--color-forest-border)',
      borderRadius: 20,
      boxShadow: '0 20px 54px rgba(0, 0, 0, 0.6), 0 0 25px rgba(228, 253, 151, 0.06)',
      overflow: 'hidden',
      textAlign: 'left',
      position: 'relative'
    }}>
      {/* Top Console Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(169, 180, 158, 0.15)',
        background: 'rgba(18, 27, 17, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 8.5, height: 8.5, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: 8.5, height: 8.5, borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: 8.5, height: 8.5, borderRadius: '50%', background: '#10B981' }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 7 }}>
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 5,
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
              width: 26,
              height: 26,
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

      {/* Main Interactive Stage with balanced scaling */}
      <div style={{ padding: '22px 24px 20px', minHeight: 250 }}>
        {/* Step 0: Input Ingestion */}
        {activeStep === 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, color: 'var(--color-lime)' }}>
              <CloudIcon style={{ width: 15, height: 15 }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 1 — Climate Inputs
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 5 }}>
              Ingesting Weather & Crop Indicators
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
              Standardizing rainfall, temperature, and agrochemicals into features.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12
            }}>
              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 3 }}>
                  <CloudIcon style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>RAINFALL</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)' }}>1,080 mm</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-lime)' }}>Optimal range</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 3 }}>
                  <SunIcon style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>TEMPERATURE</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)' }}>16.4 °C</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>Mean growing temp</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 3 }}>
                  <BeakerIcon style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>PESTICIDES</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)' }}>45,000 t</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>Crop treatment</span>
              </div>

              <div style={{ background: '#141F13', border: '1px solid var(--color-forest-border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-lime)', marginBottom: 3 }}>
                  <GlobeAltIcon style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>CROP & ZONE</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-offwhite)' }}>Wheat · France</div>
                <span style={{ fontSize: 10.5, color: 'var(--color-lime)' }}>Temperate zone</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Engine Analysis & TreeSHAP */}
        {activeStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, color: 'var(--color-lime)' }}>
              <SparklesIcon style={{ width: 15, height: 15 }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 2 — Explainable AI
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 5 }}>
              TreeSHAP Factor Attribution
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>
              Exact additive contributions on harvest volume.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#141F13', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CloudIcon style={{ width: 15, height: 15, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-offwhite)' }}>Rainfall (+890mm vs baseline)</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)', fontSize: 13 }}>+1.42 t/ha</span>
              </div>

              <div style={{ background: '#141F13', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SunIcon style={{ width: 15, height: 15, color: '#F87171' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-offwhite)' }}>Growing Season Heat Deficit</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F87171', fontSize: 13 }}>-0.28 t/ha</span>
              </div>

              <div style={{ background: '#141F13', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-forest-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChartBarIcon style={{ width: 15, height: 15, color: 'var(--color-lime)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-offwhite)' }}>Crop Variety Genetics</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-lime)', fontSize: 13 }}>+0.74 t/ha</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Yield & Uncertainty Output */}
        {activeStep === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, color: 'var(--color-lime)' }}>
              <ShieldCheckIcon style={{ width: 15, height: 15 }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                Stage 3 — Yield & Bounds
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 5 }}>
              Predicted Harvest & Confidence Limits
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>
              Calibrated expected yield with non-parametric boundaries.
            </p>

            <div style={{
              background: 'radial-gradient(circle at 50% 30%, #263825 0%, #162415 100%)',
              border: '1.5px solid var(--color-lime)',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 6px 20px var(--color-lime-glow)'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>PREDICTED YIELD</span>
                  <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-lime)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                    7.24 <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-offwhite)' }}>t/ha</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>~72.4 quintals/ha</span>
                </div>
              </div>

              <div style={{
                background: 'rgba(18, 27, 17, 0.85)',
                borderRadius: 10,
                padding: '10px 14px',
                border: '1px solid rgba(169, 180, 158, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>90% Confidence Bounds:</div>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--color-offwhite)', fontFamily: 'var(--font-mono)' }}>
                    6.10 — 8.38 t/ha
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-lime)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircleIcon style={{ width: 13, height: 13 }} /> 90% Calibrated
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
        padding: '11px 22px',
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
