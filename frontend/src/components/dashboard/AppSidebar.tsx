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
    { id: 'explain', label: 'SHAP Explainability', icon: LineChart },
    { id: 'sensitivity', label: 'Climate Sensitivity', icon: Sliders },
    { id: 'whatif', label: 'What-If Simulator', icon: GitCompare },
    { id: 'benchmarks', label: 'Model Benchmarks', icon: Cpu },
    { id: 'history', label: 'Audit History', icon: History }
  ];

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: 'var(--color-lime)',
          color: 'var(--color-forest-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sprout size={18} strokeWidth={2.5} />
        </div>
        <span>AgriYield AI</span>
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="app-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange(item.id)}
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile section */}
      <div className="app-sidebar-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(228, 253, 151, 0.15)',
            color: 'var(--color-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <User size={16} />
          </div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-offwhite)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.full_name || currentUser?.email.split('@')[0] || 'Researcher'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.organization || currentUser?.email}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            padding: 8,
            color: 'var(--color-muted)',
            borderRadius: 6,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F87171')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
