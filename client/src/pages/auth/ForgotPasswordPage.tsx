import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      // In accordance with security requirements, always show generic success or clear message
      setSubmitted(true);
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
          <h1 className="auth-editorial-headline">Account recovery made simple.</h1>
          <p className="auth-editorial-desc">
            We'll send you a secure link to reset your password. Reset links expire within 1 hour for your security.
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

      {/* Right Form Card */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-pill-badge">PASSWORD RECOVERY</span>
            <h2>Forgot password?</h2>
            <p>Enter the email address associated with your account.</p>
          </div>

          {error && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="auth-success-box">
              <CheckCircle2 size={36} color="#20452f" />
              <h3>Instructions Sent</h3>
              <p>
                If an account exists with <strong>{email}</strong>, you will receive password reset instructions
                shortly. Please check your inbox and spam folder.
              </p>
              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={() => onNavigate('login')}
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="recovery-email">Email address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner-row">
                    <span className="auth-spinner" />
                    <span>Sending instructions…</span>
                  </span>
                ) : (
                  'Send reset link'
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
