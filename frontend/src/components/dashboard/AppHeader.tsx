import React from 'react';
import { 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onBackToLanding?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  currentUser: _currentUser,
  onLogout,
  onBackToLanding: _onBackToLanding,
  sidebarCollapsed = false,
  onToggleSidebar
}) => {
  return (
    <header className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="sidebar-toggle-btn"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <Bars3Icon style={{ width: 18, height: 18 }} />
            ) : (
              <ChevronLeftIcon style={{ width: 18, height: 18 }} />
            )}
          </button>
        )}

        <div>
          <h2 style={{ 
            fontSize: 18, 
            color: 'var(--color-offwhite)', 
            fontWeight: 800, 
            marginBottom: 2, 
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            {title}
          </h2>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            {subtitle}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            color: '#FCA5A5',
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Sign out / Logout"
        >
          <ArrowRightOnRectangleIcon style={{ width: 15, height: 15 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
