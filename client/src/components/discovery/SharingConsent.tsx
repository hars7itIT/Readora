import React from 'react';
import { ShieldCheck, LoaderCircle, Info } from 'lucide-react';

interface SharingConsentProps {
  consent: boolean;
  onConsentChange: (enabled: boolean) => void;
  onShare: () => void;
  isSharing: boolean;
  hasFeeds: boolean;
}

export const SharingConsent: React.FC<SharingConsentProps> = ({
  consent,
  onConsentChange,
  onShare,
  isSharing,
  hasFeeds
}) => {
  return (
    <div className="opt-in-panel">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#204A35" />
          <strong>Anonymous, Opt-In Discovery</strong>
        </div>
        <p style={{ margin: '6px 0 10px 0', fontSize: '13px', lineHeight: 1.5, color: '#4b5b4a' }}>
          When enabled, your client shares an unordered, anonymous batch of feeds to compute community suggestions.
          No accounts, tokens, or persistent IDs are stored.
        </p>
        <label className="toggle-label" style={{ marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => onConsentChange(e.target.checked)}
          />
          <span className="toggle-ui" />
          <span>Enable opt-in sharing</span>
        </label>
        <div style={{ fontSize: '11px', color: '#768775', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
          <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Turning sharing off stops all future submissions immediately. Previously submitted anonymous batches cannot be
            identified or deleted on request and will automatically expire and delete after 90 days.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
        <button
          className="secondary-button"
          disabled={isSharing || !hasFeeds || !consent}
          onClick={onShare}
          title={!consent ? 'Enable opt-in sharing first' : 'Submit anonymous subscription batch'}
        >
          {isSharing ? <LoaderCircle className="spin" size={15} /> : <ShieldCheck size={15} />}
          Share now
        </button>
      </div>
    </div>
  );
};
