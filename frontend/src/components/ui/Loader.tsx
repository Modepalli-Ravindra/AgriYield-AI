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
