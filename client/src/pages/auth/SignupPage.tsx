import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User as UserIcon, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignupPageProps {
  onNavigate: (page: string) => void;
  onSuccess?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, onSuccess }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        name: name.trim() || undefined
      });
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('inbox');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
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
          <h1 className="auth-editorial-headline">Your library, wherever you read.</h1>
          <p className="auth-editorial-desc">
            Creating an account is completely optional. If you choose to sign up, you can optionally synchronize your
            subscriptions across devices while keeping your reading history strictly private.
          </p>

          <div className="auth-privacy-box">
            <div className="privacy-header">
              <ShieldCheck size={18} color="#20452f" />
              <strong>Privacy First Architecture</strong>
            </div>
            <ul className="privacy-list">
              <li>• Zero tracking scripts or third-party ads</li>
              <li>• Local-first: articles cached on your device</li>
              <li>• Anonymous reading is always supported</li>
            </ul>
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

      {/* Right Registration Card */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-pill-badge">CREATE ACCOUNT</span>
            <h2>Start your membership</h2>
            <p>Join a community committed to a calmer web.</p>
          </div>

          {error && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="signup-name">
                Full name <span className="label-optional">(optional)</span>
              </label>
              <div className="auth-input-wrapper">
                <UserIcon size={16} className="auth-input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="signup-email"
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
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

              {/* Password Requirements Checklist */}
              {password.length > 0 && (
                <div className="auth-requirements">
                  <span className={`req-item ${hasMinLength ? 'met' : ''}`}>
                    <CheckCircle2 size={12} /> 8+ characters
                  </span>
                  <span className={`req-item ${hasLetter ? 'met' : ''}`}>
                    <CheckCircle2 size={12} /> Letters
                  </span>
                  <span className={`req-item ${hasNumberOrSymbol ? 'met' : ''}`}>
                    <CheckCircle2 size={12} /> Numbers or symbols
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm-password">Confirm password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span className="auth-field-error">Passwords do not match.</span>
              )}
            </div>

            <div className="auth-terms-note">
              By creating an account, you agree to our respectful{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{' '}
              and privacy policy. We will never sell your information.
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || (confirmPassword.length > 0 && !passwordsMatch)}
            >
              {loading ? (
                <span className="auth-spinner-row">
                  <span className="auth-spinner" />
                  <span>Creating account…</span>
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-link-bold"
                onClick={() => onNavigate('login')}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
