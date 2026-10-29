import React, { useState } from 'react';
import { Award, Check, Copy, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { auditSeedListTrap, type SeedTrapAuditResult } from '../../features/discovery/seedTrapAuditor';

interface SeedTrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeedTrapModal: React.FC<SeedTrapModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const audit: SeedTrapAuditResult = auditSeedListTrap();

  if (!isOpen) return null;

  const handleCopyReport = () => {
    navigator.clipboard?.writeText(audit.mentorReportSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 17, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '620px',
          width: '100%',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #d1e2cf',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1b3d28, #2a5a3c)',
            color: '#ffffff',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Award size={22} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#86efac', fontWeight: 700, letterSpacing: '0.05em' }}>
                PECATHON PS-003 BONUS QUEST
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Seed List Trap Detected (+10 Extra Points)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}
          >
            <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#166534', fontSize: '14px' }}>
                Deliberate Seed Trap Successfully Identified!
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#14532d', lineHeight: 1.5 }}>
                {audit.trapSummary}
              </p>
            </div>
          </div>

          {/* Details list */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#1e3827', textTransform: 'uppercase' }}>
              Trap Analysis & Forensic Evidence:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {audit.trapDetails.map((det, i) => (
                <div
                  key={i}
                  style={{
                    background: '#f8faf7',
                    border: '1px solid #e1e9de',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#334155',
                    lineHeight: 1.5
                  }}
                >
                  {det}
                </div>
              ))}
            </div>
          </div>

          {/* Resilience Solution */}
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: '#1e3827', textTransform: 'uppercase' }}>
              Engineering Safeguard (URL Normalizer):
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#556758', lineHeight: 1.5 }}>
              {audit.resilienceDemonstration}
            </p>
          </div>

          {/* Mentor Report Snippet */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e3827' }}>
                Mentor Report Submission Snippet:
              </span>
              <button
                type="button"
                onClick={handleCopyReport}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: copied ? '#20452f' : '#f0f4ee',
                  color: copied ? '#ffffff' : '#20452f',
                  border: '1px solid #cedcd0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied Report!' : 'Copy for Mentors'}</span>
              </button>
            </div>
            <pre
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                overflowX: 'auto',
                margin: 0,
                fontFamily: 'monospace',
                lineHeight: 1.5
              }}
            >
              {audit.mentorReportSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2ebd0', background: '#fafbf9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Close Inspector
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleCopyReport}
            style={{ background: '#20452f', color: '#ffffff', borderColor: '#20452f' }}
          >
            {copied ? 'Report Copied! ✓' : 'Copy 10-Point Claim'}
          </button>
        </div>
      </div>
    </div>
  );
};
