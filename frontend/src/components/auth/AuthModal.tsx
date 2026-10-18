import React, { useState } from 'react';
import { X, Sprout, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--color-lime)',
            color: 'var(--color-forest-dark)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Sprout size={24} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: 22, color: 'var(--color-forest-dark)' }}>
            {mode === 'login' ? 'Sign in to AgriYield AI' : 'Create Researcher Account'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted-light)', marginTop: 4 }}>
            {mode === 'login' 
              ? 'Access verified prediction tools, batch processing, and history.'
              : 'Join the environmental intelligence platform for crop analytics.'}
          </p>
        </div>

        <div className="modal-tabs">
          <button 
            type="button"
            className={`modal-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`modal-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: '#FDF2F2',
            border: '1px solid #F87171',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#B91C1C',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-fullname">Full Name</label>
                <input 
                  id="auth-fullname"
                  className="form-input"
                  type="text"
                  placeholder="Dr. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-org">Organization / Institution</label>
                <input 
                  id="auth-org"
                  className="form-input"
                  type="text"
                  placeholder="Agronomy Research Lab"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address *</label>
            <input 
              id="auth-email"
              className="form-input"
              type="email"
              required
              placeholder="researcher@institution.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password *</label>
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
            style={{ width: '100%', marginTop: 8, padding: '12px 0' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
