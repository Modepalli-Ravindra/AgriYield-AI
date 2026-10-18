import React from 'react';
import { 
  Squares2X2Icon, 
  ChartBarIcon, 
  DocumentDuplicateIcon, 
  PresentationChartLineIcon, 
  AdjustmentsHorizontalIcon, 
  ArrowsRightLeftIcon, 
  CpuChipIcon, 
  ClockIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  sidebarCollapsed = false,
  onToggleSidebar
}) => {
  const NAV_ITEMS = [
    { id: 'overview', label: 'System Overview', icon: Squares2X2Icon },
    { id: 'predict', label: 'Yield Prediction', icon: ChartBarIcon },
    { id: 'batch', label: 'Batch Processing', icon: DocumentDuplicateIcon },
    { id: 'explain', label: 'Factor Contributions', icon: PresentationChartLineIcon },
    { id: 'sensitivity', label: 'Climate Sensitivity', icon: AdjustmentsHorizontalIcon },
    { id: 'whatif', label: 'What-If Scenarios', icon: ArrowsRightLeftIcon },
    { id: 'benchmarks', label: 'Model Benchmarks', icon: CpuChipIcon },
    { id: 'history', label: 'Prediction History', icon: ClockIcon }
  ];

  return (
    <aside 
      className="app-sidebar" 
      style={{
        width: sidebarCollapsed ? 76 : 250,
        background: '#121B11',
        borderRight: '1px solid var(--color-forest-border)',
        padding: sidebarCollapsed ? '16px 10px' : '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div>
        {/* Brand & Toggle Header */}
        {sidebarCollapsed ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginBottom: 22
          }}>
            <img 
              src="/logo.png" 
              alt="Terraflect" 
              title="Terraflect Intelligence Platform - Click to expand"
              onClick={onToggleSidebar}
              style={{
                width: 34,
                height: 34,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(228, 253, 151, 0.35))',
                cursor: 'pointer'
              }} 
            />
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="sidebar-toggle-btn"
                title="Expand sidebar"
                style={{
                  width: 32,
                  height: 26,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--color-forest-border)',
                  color: 'var(--color-lime)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ChevronRightIcon style={{ width: 15, height: 15 }} />
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
            marginBottom: 22
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <img 
                src="/logo.png" 
                alt="Terraflect" 
                title="Terraflect Intelligence Platform"
                style={{
                  width: 34,
                  height: 34,
                  objectFit: 'contain',
                  flexShrink: 0,
                  filter: 'drop-shadow(0 2px 8px rgba(228, 253, 151, 0.35))'
                }} 
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--color-offwhite)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Terraflect
                </div>
                <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', letterSpacing: '0.04em' }}>
                  INTELLIGENCE
                </span>
              </div>
            </div>

            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="sidebar-toggle-btn"
                title="Collapse sidebar"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-forest-border)',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <ChevronLeftIcon style={{ width: 15, height: 15 }} />
              </button>
            )}
          </div>
        )}

        {/* Navigation list */}
        <nav>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5, padding: 0, margin: 0 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    title={item.label}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      gap: 12,
                      padding: sidebarCollapsed ? '10px 0' : '9px 14px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#121B11' : 'var(--color-muted)',
                      backgroundColor: isActive ? 'var(--color-lime)' : 'transparent',
                      boxShadow: isActive ? '0 3px 12px var(--color-lime-glow)' : 'none',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* User profile & Logout footer */}
      <div style={{
        paddingTop: 14,
        borderTop: '1px solid var(--color-forest-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        flexDirection: sidebarCollapsed ? 'column' : 'row',
        gap: sidebarCollapsed ? 12 : 8
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }} 
          title={currentUser?.email || 'Active Session'}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            color: 'var(--color-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserIcon style={{ width: 16, height: 16 }} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--color-offwhite)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser?.full_name || 'Agronomist'}
              </div>
              <div style={{
                fontSize: 10.5,
                color: 'var(--color-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser?.email || 'Active Session'}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: '7px 9px',
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            color: '#FCA5A5',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Sign out / Logout"
        >
          <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </aside>
  );
};
