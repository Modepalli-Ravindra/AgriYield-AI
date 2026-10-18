import React from 'react';

/**
 * Modern 21st.dev / shadcn-style Button Spinner
 * Dual-ring with pulsing lime core
 */
export const ButtonSpinner: React.FC<{ size?: number; text?: string }> = ({ 
  size = 18, 
  text 
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div 
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Outer glowing orbital ring */}
        <div 
          className="orbital-ring"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(228, 253, 151, 0.2)',
            borderTopColor: 'var(--color-lime)',
            borderRightColor: 'var(--color-lime)',
            boxShadow: '0 0 10px rgba(228, 253, 151, 0.4)'
          }}
        />
        {/* Inner pulsing core dot */}
        <div 
          style={{
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: '50%',
            backgroundColor: 'var(--color-lime)',
            boxShadow: '0 0 6px var(--color-lime)'
          }}
        />
      </div>
      {text && <span>{text}</span>}
    </div>
  );
};

/**
 * 21st.dev-inspired Neural AI Pipeline Loader
 * Multi-ring radar pulse with live stage progression text
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
  const orbSize = size === 'sm' ? 44 : size === 'lg' ? 72 : 56;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size === 'sm' ? '18px' : '32px 20px',
      textAlign: 'center'
    }}>
      {/* Multi-layered Pulsing Orbital System */}
      <div style={{ position: 'relative', width: orbSize, height: orbSize, marginBottom: 16 }}>
        {/* Outer Ripple Wave */}
        <div 
          className="ripple-wave"
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: '50%',
            border: '1.5px solid rgba(228, 253, 151, 0.25)',
            boxShadow: '0 0 18px rgba(228, 253, 151, 0.2)'
          }}
        />

        {/* Counter-rotating Orbital Ring */}
        <div 
          className="orbital-ring-reverse"
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px dashed rgba(228, 253, 151, 0.4)'
          }}
        />

        {/* Primary Spinning Ring */}
        <div 
          className="orbital-ring"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderTopColor: 'var(--color-lime)',
            borderRightColor: 'var(--color-lime)',
            boxShadow: '0 0 12px rgba(228, 253, 151, 0.6)'
          }}
        />

        {/* Center Glowing Seed / Core */}
        <div 
          className="pulse-core"
          style={{
            position: 'absolute',
            inset: '24%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-lime) 0%, rgba(228, 253, 151, 0.3) 70%, transparent 100%)',
            boxShadow: '0 0 16px var(--color-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      <div style={{ fontSize: size === 'sm' ? 14 : 15, fontWeight: 700, color: 'var(--color-offwhite)', marginBottom: 4 }}>
        {title}
      </div>
      <p style={{ fontSize: size === 'sm' ? 12 : 13, color: 'var(--color-muted)', maxWidth: 360, margin: 0, lineHeight: 1.5 }}>
        {subtitle}
      </p>

      {/* Modern Shimmer Progress Line */}
      <div style={{
        width: 140,
        height: 3,
        background: 'rgba(228, 253, 151, 0.1)',
        borderRadius: 10,
        marginTop: 14,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div 
          className="shimmer-bar"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '45%',
            background: 'linear-gradient(90deg, transparent, var(--color-lime), transparent)',
            borderRadius: 10
          }}
        />
      </div>
    </div>
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
    <div 
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'rgba(30, 44, 29, 0.7)',
        ...style
      }}
    />
  );
};
