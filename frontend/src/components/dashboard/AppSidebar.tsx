import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Layers, 
  LineChart, 
  Sliders, 
  GitCompare, 
  Cpu, 
  History, 
  LogOut, 
  User
} from 'lucide-react';
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
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'predict', label: 'Yield Prediction', icon: Sprout },
    { id: 'batch', label: 'Batch Processing', icon: Layers },
    { id: 'explain', label: 'Factor Contributions', icon: LineChart },
    { id: 'sensitivity', label: 'Climate Sensitivity', icon: Sliders },
    { id: 'whatif', label: 'What-If Scenarios', icon: GitCompare },
    { id: 'benchmarks', label: 'Model Benchmarks', icon: Cpu },
    { id: 'history', label: 'Prediction History', icon: History }
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
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'var(--color-lime)',
            color: '#121B11',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px var(--color-lime-glow)'
          }}>
            <Sprout size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)', letterSpacing: '-0.02em' }}>
              AgriYield AI
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)' }}>
              RESEARCH ENGINE
            </span>
          </div>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={18} />
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
            <User size={18} />
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
              {currentUser?.full_name || 'Researcher'}
            </div>
            <div style={{
              fontSize: 11,
              color: 'var(--color-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentUser?.email || 'Active User'}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: 8,
            color: 'var(--color-muted)',
            borderRadius: 8,
            transition: 'color 0.2s ease'
          }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
