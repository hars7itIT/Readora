import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthCallbackPageProps {
  onNavigate: (page: string) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Finalizing authentication…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const errorParam = params.get('error');

    if (errorParam) {
      setStatus('error');
      setMessage(decodeURIComponent(errorParam));
      return;
    }

    if (token) {
      try {
        localStorage.setItem('small_reader_auth_token', token);
        setStatus('success');
        setMessage('Authentication successful! Redirecting to your reading space…');
        setTimeout(() => {
          onNavigate('inbox');
        }, 1200);
      } catch {
        setStatus('error');
        setMessage('Failed to persist authentication token.');
      }
    } else {
      // If already logged in, redirect home
      if (user) {
        setStatus('success');
        setMessage('Already signed in! Returning to library…');
        setTimeout(() => onNavigate('inbox'), 800);
      } else {
        setStatus('error');
        setMessage('No authentication token received from provider.');
      }
    }
  }, [user, onNavigate]);

  return (
    <div className="auth-page-container">
      <div className="auth-form-panel" style={{ width: '100%', maxWidth: '520px', margin: '60px auto' }}>
        <div className="auth-card" style={{ textAlign: 'center', padding: '48px 36px' }}>
          {status === 'processing' && (
            <div>
              <span className="auth-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', marginTop: '20px', fontSize: '22px' }}>
                Connecting your account…
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '14px', marginTop: '8px' }}>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <CheckCircle2 size={42} color="#20452f" style={{ margin: '0 auto' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', marginTop: '20px', fontSize: '22px' }}>Welcome!</h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '14px', marginTop: '8px' }}>{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <AlertCircle size={42} color="#b33939" style={{ margin: '0 auto' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', marginTop: '20px', fontSize: '22px' }}>
                Authentication Failed
              </h2>
              <p style={{ color: '#b33939', fontSize: '14px', marginTop: '8px' }}>{message}</p>
              <div style={{ marginTop: '28px' }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={() => onNavigate('login')}
                >
                  <ArrowLeft size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
