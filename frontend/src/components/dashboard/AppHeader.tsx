import React from 'react';
import { 
  ShieldCheckIcon, 
  ArrowLeftIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
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
  currentUser: _currentUser,
  onLogout,
  onBackToLanding
}) => {
  return (
    <header className="app-topbar">
      <div>
        <h2 style={{ fontSize: 19, color: 'var(--color-offwhite)', fontWeight: 800 }}>
          {title}
        </h2>
        <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          {subtitle}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(228, 253, 151, 0.08)',
          border: '1px solid var(--color-forest-border)',
          padding: '6px 14px',
          borderRadius: 100,
          fontSize: 12,
          color: 'var(--color-offwhite)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-lime)', boxShadow: '0 0 8px var(--color-lime)' }} />
          <span>DATABASE ONLINE</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(228, 253, 151, 0.15)',
          border: '1px solid var(--color-lime)',
          padding: '6px 14px',
          borderRadius: 100,
          fontSize: 12,
          color: 'var(--color-lime)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700
        }}>
          <ShieldCheckIcon style={{ width: 15, height: 15 }} />
          <span>90% CONFIDENCE BOUNDS</span>
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="btn-secondary"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            <ArrowLeftIcon style={{ width: 14, height: 14 }} />
            <span>Public Home</span>
          </button>
        )}

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            color: '#FCA5A5',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Sign out of current session"
        >
          <ArrowRightOnRectangleIcon style={{ width: 15, height: 15 }} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
