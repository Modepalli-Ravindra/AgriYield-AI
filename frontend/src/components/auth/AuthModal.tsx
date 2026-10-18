import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ExclamationCircleIcon, 
  ArrowRightIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import * as api from '../../api';
import type { UserProfile } from '../../types';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.loginUser(email, password);
        onSuccess(res.user);
      } else {
        const res = await api.registerUser(email, password, fullName || undefined, organization || undefined);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
        background: '#162215',
        border: '1px solid var(--color-forest-border)',
        borderRadius: 24,
        padding: '36px',
        color: 'var(--color-offwhite)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: 'var(--color-muted)',
            padding: 6,
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
        >
          <XMarkIcon style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img 
            src="/logo.png" 
            alt="AgriYield AI" 
            style={{
              width: 54,
              height: 54,
              objectFit: 'contain',
              marginBottom: 12,
              filter: 'drop-shadow(0 2px 10px rgba(228, 253, 151, 0.35))'
            }} 
          />
          <h3 style={{ fontSize: 22, color: 'var(--color-offwhite)', fontWeight: 800 }}>
            {mode === 'login' ? 'Sign in to AgriYield AI' : 'Create Account'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 4 }}>
            {mode === 'login' 
              ? 'Access real-time prediction tools, batch processing, and history.'
              : 'Join the environmental intelligence platform for crop analytics.'}
          </p>
        </div>

        <div className="modal-tabs">
          <button 
            type="button"
            className={mode === 'login' ? 'modal-tab-btn active' : 'modal-tab-btn'}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={mode === 'register' ? 'modal-tab-btn active' : 'modal-tab-btn'}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 10,
            padding: '11px 14px',
            color: '#FCA5A5',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <ExclamationCircleIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }} htmlFor="auth-fullname">
                  Full Name
                </label>
                <input 
                  id="auth-fullname"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Ravindra Modepalli"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }} htmlFor="auth-org">
                  Organization / Farm Enterprise
                </label>
                <input 
                  id="auth-org"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Agricultural Advisory Group"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }} htmlFor="auth-email">
              Email Address *
            </label>
            <input 
              id="auth-email"
              className="form-input"
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }} htmlFor="auth-password">
              Password *
            </label>
            <input 
              id="auth-password"
              className="form-input"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '12px 0', marginTop: 8, fontSize: 14.5 }}
          >
            {loading ? (
              <>
                <ArrowPathIcon style={{ width: 16, height: 16 }} className="animate-spin" />
                <span>{mode === 'login' ? 'Authenticating...' : 'Registering Account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRightIcon style={{ width: 16, height: 16 }} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
