import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, CheckCircle2, AlertCircle, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onSuccess?: () => void;
  returnTo?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess, returnTo }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ email, password, rememberMe });
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate(returnTo || 'inbox');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setGoogleNotice(
      'Google Sign-In is ready for production credentials (set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in server/.env). For now, use email and password.'
    );
    setTimeout(() => setGoogleNotice(null), 6000);
  };

  const handleQuickDemoLogin = async () => {
    setEmail('demo@readora.com');
    setPassword('readora123');
    setError(null);
    setLoading(true);
    try {
      await login({ email: 'demo@readora.com', password: 'readora123', rememberMe: true });
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate(returnTo || 'inbox');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Editorial Branding Panel */}
      <div className="auth-editorial-panel">
        <div className="auth-editorial-top">
          <div className="auth-brand-lockup">
            <img
              src="/readora-logo.png"
              alt="Readora — Read What Matters"
              style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>

        <div className="auth-editorial-center">
          <h1 className="auth-editorial-headline">A quieter corner of the internet.</h1>
          <p className="auth-editorial-desc">
            Your favorite independent writing, gathered in one calm reading space. No algorithms, no invasive trackers,
            just thoughtful prose in chronological order.
          </p>

          <div className="auth-quote-card">
            <p className="auth-quote-text">
              “Read intentionally. Discover independently. Own your attention.”
            </p>
            <span className="auth-quote-source">— Readora Manifesto</span>
          </div>
        </div>

        <div className="auth-editorial-bottom">
          <button
            type="button"
            className="auth-back-link"
            onClick={() => onNavigate('inbox')}
          >
            <ArrowLeft size={16} />
            <span>Continue reading anonymously</span>
          </button>
        </div>
      </div>

      {/* Right Authentication Card */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-pill-badge">ACCOUNT ACCESS</span>
            <h2>Welcome back</h2>
            <p>Continue where your curiosity left off.</p>
          </div>

          {error && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {googleNotice && (
            <div className="auth-alert info" role="status">
              <Compass size={18} />
              <span>{googleNotice}</span>
            </div>
          )}

          {/* Pre-configured Demo User Card */}
          <div
            style={{
              background: '#eef5ec',
              border: '1px solid #c9dec6',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '12.5px', color: '#1a4427', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>🔑</span> Demo User Credentials
              </strong>
              <span style={{ fontSize: '10px', background: '#20452f', color: '#fff', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                Instant Access
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#3d5943', lineHeight: 1.5, marginBottom: '10px' }}>
              <div>Email: <strong>demo@readora.com</strong></div>
              <div>Password: <strong>readora123</strong></div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#20452f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>⚡ 1-Click Auto Fill & Log In</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => onNavigate('forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner-row">
                  <span className="auth-spinner" />
                  <span>Signing in…</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="auth-oauth-btn"
            onClick={handleGoogleAuth}
            title="Sign in with Google"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="auth-card-footer">
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-link-bold"
                onClick={() => onNavigate('signup')}
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
