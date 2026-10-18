import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../../types';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onBackToLanding?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBackToLanding
}) => {
  return (
    <header className="app-topbar">
      <div>
        <h2 style={{ fontSize: 18, color: 'var(--color-forest-dark)', fontWeight: 700 }}>
          {title}
        </h2>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted-light)' }}>
          {subtitle}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(45, 62, 44, 0.06)',
          border: '1px solid var(--color-offwhite-border)',
          padding: '4px 10px',
          borderRadius: 100,
          fontSize: 12,
          color: 'var(--color-forest)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A' }} />
          <span>API ONLINE • POSTGRES</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--color-lime-subtle)',
          border: '1px solid var(--color-lime)',
          padding: '4px 10px',
          borderRadius: 100,
          fontSize: 12,
          color: 'var(--color-forest)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600
        }}>
          <ShieldCheck size={14} />
          <span>90% CONFORMAL UQ</span>
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--color-forest)',
              padding: '6px 12px',
              borderRadius: 6,
              background: 'var(--color-offwhite)'
            }}
          >
            Public Site
          </button>
        )}
      </div>
    </header>
  );
};
