import React from 'react';
import { ShieldCheck, Database, Sliders, EyeOff, Share2, Feather } from 'lucide-react';

export const LandingPrivacySection: React.FC = () => {
  const privacyPillars = [
    {
      icon: <ShieldCheck size={22} />,
      title: 'No Mandatory Account',
      text: 'Start reading immediately. You do not need to provide an email or create an account to subscribe to RSS feeds or browse articles.'
    },
    {
      icon: <Database size={22} />,
      title: 'Local-First Storage',
      text: 'Your subscriptions, reading history, and notes live in your browser’s local IndexedDB storage. You can read your cached library completely offline.'
    },
    {
      icon: <Sliders size={22} />,
      title: 'Full Data Ownership',
      text: 'Export your subscriptions to standard OPML 2.0 anytime. Take your library to any RSS reader or import existing collections with one click.'
    },
    {
      icon: <EyeOff size={22} />,
      title: 'Zero Tracking Scripts',
      text: 'No third-party trackers, retargeting pixels, or surveillance analytics. We never sell data or build cross-site behavior profiles.'
    },
    {
      icon: <Share2 size={22} />,
      title: 'Opt-In Discovery',
      text: 'Recommendations only use aggregated, anonymized feed overlaps with your explicit consent. Your personal reading choices remain private.'
    },
    {
      icon: <Feather size={22} />,
      title: 'Sanitized Content',
      text: 'All external article HTML is purified and isolated with DOMPurify, stripping tracking cookies, third-party embeds, and malicious scripts.'
    }
  ];

  return (
    <section className="landing-privacy-section" id="privacy" aria-label="Privacy Philosophy">
      <div className="landing-privacy-container">
        <div className="landing-section-header">
          <div className="landing-eyebrow">
            <Feather size={14} color="#204A35" />
            <span>Your Reading, Your Rules</span>
          </div>

          <h2 className="landing-section-title">
            A quieter internet. A little more privacy.
          </h2>

          <p className="landing-section-subtitle">
            Most modern feeds are designed to capture your attention and sell your habits.
            Readora is designed for reading: intentional, private, and under your control.
          </p>
        </div>

        <div className="landing-privacy-grid">
          {privacyPillars.map((pillar, i) => (
            <div key={i} className="landing-privacy-card">
              <div className="landing-privacy-icon">{pillar.icon}</div>
              <h3 className="landing-privacy-title">{pillar.title}</h3>
              <p className="landing-privacy-text">{pillar.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};