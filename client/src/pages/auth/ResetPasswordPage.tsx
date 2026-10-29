import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiVerifyResetToken } from '../../services/authApi';

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
  token?: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate, token: propToken }) => {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState<string>(propToken || '');
  const [verifying, setVerifying] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Extract token from window.location.search if not passed via props
  useEffect(() => {
    let activeToken = propToken;
    if (!activeToken) {
      const urlParams = new URLSearchParams(window.location.search);
      activeToken = urlParams.get('token') || '';
    }
    setToken(activeToken);

    if (!activeToken) {
      setVerifying(false);
      setTokenValid(false);
      setError('Password reset token is missing. Please request a new link.');
      return;
    }

    void apiVerifyResetToken(activeToken)
      .then((res) => {
        setTokenValid(res.valid);
        if (!res.valid) {
          setError('This password reset link is invalid or has expired. Please request a new one.');
        }
      })
      .catch(() => {
        setTokenValid(false);
        setError('Could not verify reset token.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [propToken]);

  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
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
          <h1 className="auth-editorial-headline">Create a new secure password.</h1>
          <p className="auth-editorial-desc">
            Choose a strong password with at least 8 characters. After resetting, your other active sessions will be
            signed out automatically.
          </p>
        </div>

        <div className="auth-editorial-bottom">
          <button
            type="button"
            className="auth-back-link"
            onClick={() => onNavigate('login')}
          >
            <ArrowLeft size={16} />
            <span>Back to sign in</span>
          </button>
        </div>
      </div>

      {/* Right Reset Card */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-pill-badge">CHOOSE NEW PASSWORD</span>
            <h2>Set new password</h2>
            <p>Ensure your account remains safe and secure.</p>
          </div>

          {verifying ? (
            <div className="auth-loading-box">
              <span className="auth-spinner" />
              <p>Verifying reset token…</p>
            </div>
          ) : success ? (
            <div className="auth-success-box">
              <CheckCircle2 size={36} color="#20452f" />
              <h3>Password Updated</h3>
              <p>Your password has been successfully reset. You can now sign in with your new credentials.</p>
              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={() => onNavigate('login')}
                >
                  Sign in now
                </button>
              </div>
            </div>
          ) : !tokenValid ? (
            <div className="auth-error-box">
              <AlertCircle size={36} color="#b33939" />
              <h3>Link Expired or Invalid</h3>
              <p>{error || 'This reset link has expired or was already used.'}</p>
              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={() => onNavigate('forgot-password')}
                >
                  Request a new link
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {error && (
                <div className="auth-alert error" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="new-password">New password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

                {newPassword.length > 0 && (
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
                <label htmlFor="confirm-new-password">Confirm new password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="confirm-new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <span className="auth-field-error">Passwords do not match.</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !passwordsMatch || !hasMinLength}
              >
                {loading ? (
                  <span className="auth-spinner-row">
                    <span className="auth-spinner" />
                    <span>Updating password…</span>
                  </span>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>
          )}

          <div className="auth-card-footer">
            <p>
              Remember your password?{' '}
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
