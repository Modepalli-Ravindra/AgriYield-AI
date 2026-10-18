import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ExclamationCircleIcon, 
  ArrowRightIcon, 
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password criteria checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!hasMinLength) {
        setError('Password must contain at least 8 characters.');
        return;
      }
      if (!hasUpperCase) {
        setError('Password must contain at least one uppercase letter (A-Z).');
        return;
      }
      if (!hasLowerCase) {
        setError('Password must contain at least one lowercase letter (a-z).');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.loginUser(email, password);
        onSuccess(res.user);
      } else {
        const res = await api.registerUser(email, password, fullName || undefined, undefined);
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
        position: 'relative',
        maxWidth: 480,
        width: '100%'
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
            alt="Terraflect" 
            style={{
              width: 54,
              height: 54,
              objectFit: 'contain',
              marginBottom: 12,
              filter: 'drop-shadow(0 2px 10px rgba(228, 253, 151, 0.35))'
            }} 
          />
          <h3 style={{ fontSize: 22, color: 'var(--color-offwhite)', fontWeight: 800 }}>
            {mode === 'login' ? 'Sign in to Terraflect' : 'Create Account'}
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
            <div style={{ position: 'relative' }}>
              <input 
                id="auth-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'register' ? 'Min 8 chars, uppercase & lowercase' : '••••••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: showPassword ? 'var(--color-lime)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <EyeSlashIcon style={{ width: 19, height: 19 }} />
                ) : (
                  <EyeIcon style={{ width: 19, height: 19 }} />
                )}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }} htmlFor="auth-confirm-password">
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="auth-confirm-password"
                    className="form-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: showConfirmPassword ? 'var(--color-lime)' : 'var(--color-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon style={{ width: 19, height: 19 }} />
                    ) : (
                      <EyeIcon style={{ width: 19, height: 19 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirement Badges */}
              <div style={{
                background: 'rgba(28, 42, 27, 0.65)',
                border: '1px solid rgba(228, 253, 151, 0.12)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  color: hasMinLength ? 'var(--color-lime)' : 'var(--color-muted)' 
                }}>
                  <CheckCircleIcon style={{ width: 14, height: 14, color: hasMinLength ? 'var(--color-lime)' : '#5A6E58' }} />
                  <span>Min 8 characters</span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  color: hasUpperCase ? 'var(--color-lime)' : 'var(--color-muted)' 
                }}>
                  <CheckCircleIcon style={{ width: 14, height: 14, color: hasUpperCase ? 'var(--color-lime)' : '#5A6E58' }} />
                  <span>Uppercase (A-Z)</span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  color: hasLowerCase ? 'var(--color-lime)' : 'var(--color-muted)' 
                }}>
                  <CheckCircleIcon style={{ width: 14, height: 14, color: hasLowerCase ? 'var(--color-lime)' : '#5A6E58' }} />
                  <span>Lowercase (a-z)</span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  color: passwordsMatch ? 'var(--color-lime)' : 'var(--color-muted)' 
                }}>
                  <CheckCircleIcon style={{ width: 14, height: 14, color: passwordsMatch ? 'var(--color-lime)' : '#5A6E58' }} />
                  <span>Passwords match</span>
                </div>
              </div>
            </>
          )}

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
