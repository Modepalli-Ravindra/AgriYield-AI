import React from 'react';
import { 
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
  onBackToLanding: _onBackToLanding
}) => {
  return (
    <header className="app-topbar">
      <div>
        <h2 style={{ 
          fontSize: 22, 
          color: 'var(--color-offwhite)', 
          fontWeight: 800, 
          marginBottom: 3, 
          letterSpacing: '-0.02em' 
        }}>
          {title}
        </h2>
        <span style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
          {subtitle}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            color: '#FCA5A5',
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Sign out of current session"
        >
          <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
