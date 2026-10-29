import React from 'react';

export const TrustFaqFooter: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <footer style={{
      backgroundColor: '#0E160D',
      borderTop: '1px solid var(--color-forest-border)',
      padding: '54px 0 36px',
      color: 'var(--color-muted)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img 
            src="/logo.png" 
            alt="Terraflect Logo" 
            style={{
              width: 40,
              height: 40,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(228, 253, 151, 0.35))'
            }} 
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
              Terraflect
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', maxWidth: 440, margin: 0 }}>
              Intelligent crop yield estimation powered by environmental data.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={onGetStarted}
            style={{ padding: '10px 24px', fontSize: 13.5 }}
          >
            Launch Console
          </button>
        </div>
      </div>
      <div className="container" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(169, 180, 158, 0.12)', fontSize: 12, color: 'var(--color-muted-dark)', textAlign: 'center' }}>
        Terraflect Platform · Enterprise Environmental Intelligence
      </div>
    </footer>
  );
};
