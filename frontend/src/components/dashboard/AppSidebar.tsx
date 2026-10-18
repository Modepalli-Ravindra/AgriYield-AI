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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onLogout
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
    <aside className="app-sidebar" style={{
      width: 270,
      background: '#121B11',
      borderRight: '1px solid var(--color-forest-border)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 8px',
          marginBottom: 32
        }}>
          <img 
            src="/logo.png" 
            alt="Terraflect" 
            style={{
              width: 38,
              height: 38,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(228, 253, 151, 0.3))'
            }} 
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)', letterSpacing: '-0.02em' }}>
              Terraflect
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)' }}>
              INTELLIGENCE PLATFORM
            </span>
          </div>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, padding: 0, margin: 0 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 16px',
                      borderRadius: 12,
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#121B11' : 'var(--color-muted)',
                      backgroundColor: isActive ? 'var(--color-lime)' : 'transparent',
                      boxShadow: isActive ? '0 4px 14px var(--color-lime-glow)' : 'none',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* User profile section */}
      <div style={{
        paddingTop: 18,
        borderTop: '1px solid var(--color-forest-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-forest-surface)',
            border: '1px solid var(--color-forest-border)',
            color: 'var(--color-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserIcon style={{ width: 18, height: 18 }} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: 'var(--color-offwhite)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentUser?.full_name || 'Agronomist'}
            </div>
            <div style={{
              fontSize: 11,
              color: 'var(--color-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentUser?.email || 'Active Session'}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: 8,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted)',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          title="Sign Out"
        >
          <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </aside>
  );
};
