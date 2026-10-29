import React from 'react';

// Self-contained keyframes injected into document head to guarantee animations run everywhere
const LOADER_STYLES = `
@keyframes spinClockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spinCounterClockwise {
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}

@keyframes pulseCoreGlow {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.75;
    box-shadow: 0 0 8px #E4FD97, inset 0 0 8px #E4FD97;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
    box-shadow: 0 0 22px #E4FD97, inset 0 0 12px #E4FD97;
  }
}

@keyframes rippleWavePulse {
  0% {
    transform: scale(0.9);
    opacity: 0.85;
    border-color: rgba(228, 253, 151, 0.6);
  }
  100% {
    transform: scale(1.45);
    opacity: 0;
    border-color: rgba(228, 253, 151, 0);
  }
}

@keyframes shimmerSlide {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(250%); }
}

@keyframes skeletonPulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
}

.tf-spin-clockwise {
  animation: spinClockwise 0.8s linear infinite !important;
}

.tf-spin-counter {
  animation: spinCounterClockwise 1.8s linear infinite !important;
}

.tf-pulse-core {
  animation: pulseCoreGlow 1.4s ease-in-out infinite !important;
}

.tf-ripple-wave {
  animation: rippleWavePulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite !important;
}

.tf-shimmer-slide {
  animation: shimmerSlide 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
}
`;

/**
 * Modern 21st.dev / shadcn-style Button Spinner
 * Dual-ring with glowing lime orbital spin and center pulse
 */
export const ButtonSpinner: React.FC<{ size?: number; text?: string }> = ({ 
  size = 18, 
  text 
}) => {
  return (
    <>
      <style>{LOADER_STYLES}</style>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
        <div 
          style={{
            width: size,
            height: size,
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {/* Outer glowing orbital ring */}
          <div 
            className="tf-spin-clockwise"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2.5px solid rgba(18, 27, 17, 0.25)',
              borderTopColor: '#121B11',
              borderRightColor: '#121B11',
              boxSizing: 'border-box'
            }}
          />
          {/* Inner core dot */}
          <div 
            style={{
              width: Math.max(4, size * 0.32),
              height: Math.max(4, size * 0.32),
              borderRadius: '50%',
              backgroundColor: '#121B11'
            }}
          />
        </div>
        {text && <span style={{ fontWeight: 700 }}>{text}</span>}
      </div>
    </>
  );
};

/**
 * 21st.dev-inspired Neural AI Pipeline Loader
 * Multi-ring radar pulse with glowing seed core & shimmer progress
 */
interface AIEngineLoaderProps {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AIEngineLoader: React.FC<AIEngineLoaderProps> = ({
  title = "Terraflect AI Pipeline Active",
  subtitle = "Calibrating environmental tensors & conformal bounds...",
  size = 'md'
}) => {
  const orbSize = size === 'sm' ? 46 : size === 'lg' ? 76 : 60;

  return (
    <>
      <style>{LOADER_STYLES}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'sm' ? '20px' : '36px 24px',
        textAlign: 'center'
      }}>
        {/* Multi-layered Pulsing Orbital System */}
        <div style={{ position: 'relative', width: orbSize, height: orbSize, marginBottom: 18 }}>
          {/* Outer Expanding Ripple Wave */}
          <div 
            className="tf-ripple-wave"
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: '2px solid rgba(228, 253, 151, 0.5)',
              boxShadow: '0 0 20px rgba(228, 253, 151, 0.3)'
            }}
          />

          {/* Counter-rotating Dashed Orbital Ring */}
          <div 
            className="tf-spin-counter"
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: '50%',
              border: '2px dashed rgba(228, 253, 151, 0.5)'
            }}
          />

          {/* Primary Spinning Ring */}
          <div 
            className="tf-spin-clockwise"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'var(--color-lime)',
              borderRightColor: 'var(--color-lime)',
              boxShadow: '0 0 16px rgba(228, 253, 151, 0.8)'
            }}
          />

          {/* Center Glowing Seed Core */}
          <div 
            className="tf-pulse-core"
            style={{
              position: 'absolute',
              inset: '25%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--color-lime) 0%, rgba(228, 253, 151, 0.4) 65%, transparent 100%)',
              boxShadow: '0 0 18px var(--color-lime)'
            }}
          />
        </div>

        <div style={{ fontSize: size === 'sm' ? 14.5 : 16, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 6 }}>
          {title}
        </div>
        <p style={{ fontSize: size === 'sm' ? 12 : 13, color: 'var(--color-muted)', maxWidth: 380, margin: 0, lineHeight: 1.5 }}>
          {subtitle}
        </p>

        {/* Shimmer Progress Scanning Bar */}
        <div style={{
          width: 160,
          height: 3.5,
          background: 'rgba(228, 253, 151, 0.12)',
          borderRadius: 10,
          marginTop: 18,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div 
            className="tf-shimmer-slide"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '50%',
              background: 'linear-gradient(90deg, transparent, var(--color-lime), transparent)',
              borderRadius: 10
            }}
          />
        </div>
      </div>
    </>
  );
};

/**
 * Centered 10-Second Countdown Multi-Stage AI Engine Loader
 * Displayed in the dead-center of the screen with live timer and pipeline status
 */
interface TenSecondAILoaderProps {
  title?: string;
  subtitle?: string;
}

export const TenSecondAILoader: React.FC<TenSecondAILoaderProps> = ({
  title = "Terraflect ML-DL Inference Engine",
  subtitle = "Calibrating environmental tensors and computing exact TreeSHAP attributions..."
}) => {
  const [secondsRemaining, setSecondsRemaining] = React.useState(10);
  const [stageIndex, setStageIndex] = React.useState(0);

  const PIPELINE_STAGES = [
    "1/5 · Ingesting regional agro-climatic tensors (Open-Meteo & FAO)...",
    "2/5 · Executing 300-estimator gradient boosted ensemble pass...",
    "3/5 · Computing exact TreeSHAP local game-theoretic attribution matrix...",
    "4/5 · Calibrating non-negative crop-conditional conformal intervals (90%)...",
    "5/5 · Validating mathematical additivity & assembling final forecast..."
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    const stageTimer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(stageTimer);
    };
  }, []);

  const progressPct = ((10 - secondsRemaining) / 10) * 100;

  return (
    <>
      <style>{LOADER_STYLES}</style>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(8, 14, 8, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'radial-gradient(circle at 50% 20%, #1c2b1a 0%, #0e170d 100%)',
          border: '1.5px solid var(--color-lime)',
          borderRadius: 24,
          padding: '38px 44px',
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(228, 253, 151, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Orbital Radar Pulse */}
          <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 22 }}>
            <div 
              className="tf-ripple-wave"
              style={{
                position: 'absolute',
                inset: -14,
                borderRadius: '50%',
                border: '2px solid rgba(228, 253, 151, 0.6)',
                boxShadow: '0 0 25px rgba(228, 253, 151, 0.4)'
              }}
            />
            <div 
              className="tf-spin-counter"
              style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: '2.5px dashed rgba(228, 253, 151, 0.6)'
              }}
            />
            <div 
              className="tf-spin-clockwise"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3.5px solid transparent',
                borderTopColor: 'var(--color-lime)',
                borderRightColor: 'var(--color-lime)',
                boxShadow: '0 0 20px rgba(228, 253, 151, 0.9)'
              }}
            />
            <div 
              className="tf-pulse-core"
              style={{
                position: 'absolute',
                inset: '25%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--color-lime) 0%, rgba(228, 253, 151, 0.4) 65%, transparent 100%)',
                boxShadow: '0 0 22px var(--color-lime)'
              }}
            />
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-offwhite)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {title}
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.75)', margin: '0 0 18px', maxWidth: 440, lineHeight: 1.4 }}>
            {subtitle}
          </p>

          {/* Active Pipeline Stage Tag */}
          <div style={{
            background: 'rgba(228, 253, 151, 0.1)',
            border: '1px solid rgba(228, 253, 151, 0.3)',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-lime)',
            marginBottom: 20,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {PIPELINE_STAGES[stageIndex]}
          </div>

          {/* Smooth Progress Bar */}
          <div style={{
            width: '100%',
            height: 9,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 12
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(4, progressPct))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #34D399, var(--color-lime))',
              borderRadius: 6,
              transition: 'width 1s linear',
              boxShadow: '0 0 10px rgba(228, 253, 151, 0.5)'
            }} />
          </div>

          {/* Live Remaining Time */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255, 255, 255, 0.75)'
          }}>
            <span>Processing Tensors</span>
            <span style={{ color: 'var(--color-lime)', fontWeight: 800 }}>
              {secondsRemaining}s remaining
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * shadcn-style Shimmer Skeleton placeholder
 */
export const Skeleton: React.FC<{ 
  width?: string | number; 
  height?: string | number; 
  borderRadius?: number;
  style?: React.CSSProperties;
}> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}) => {
  return (
    <>
      <style>{LOADER_STYLES}</style>
      <div 
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(30, 44, 29, 0.7)',
          animation: 'skeletonPulse 1.6s ease-in-out infinite',
          ...style
        }}
      />
    </>
  );
};
