import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface InvalidUrlAlertProps {
  isOpen: boolean;
  onClose: () => void;
  attemptedUrl: string;
  errorMessage: string;
  suggestion?: string;
}

export const InvalidUrlAlert: React.FC<InvalidUrlAlertProps> = ({
  isOpen,
  onClose,
  attemptedUrl,
  errorMessage,
  suggestion
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="invalid-url-alert-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 28, 22, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="invalid-url-alert-title"
    >
      <div
        className="invalid-url-alert-box"
        style={{
          background: '#ffffff',
          border: '2px solid #e05244',
          borderRadius: '14px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 12px 36px rgba(224, 82, 68, 0.25)',
          overflow: 'hidden',
          animation: 'alertShake 0.35s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red Alert Header */}
        <div
          style={{
            background: '#fff2f0',
            borderBottom: '1px solid #fedcd8',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#fee4e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d92d20'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3
                id="invalid-url-alert-title"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#b42318'
                }}
              >
                Invalid Link Detected!
              </h3>
              <span style={{ fontSize: '11.5px', color: '#7a271a' }}>
                URL Validation & Security Guardrail
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#912018',
              padding: '4px',
              display: 'flex',
              borderRadius: '6px'
            }}
            title="Dismiss alert"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alert Body */}
        <div style={{ padding: '20px' }}>
          <div
            style={{
              background: '#f8faf7',
              border: '1px solid #e2ebd0',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '14px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#334155',
              wordBreak: 'break-all'
            }}
          >
            <strong>Input:</strong> {attemptedUrl || '(empty)'}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px' }}>
            <ShieldAlert size={18} color="#d92d20" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                {errorMessage}
              </div>
              {suggestion && (
                <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.5 }}>
                  <strong>Suggestion:</strong> {suggestion}
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#d92d20',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(217, 45, 32, 0.3)'
              }}
            >
              I Understand, Fix Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
