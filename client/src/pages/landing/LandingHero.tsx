import React, { useState } from 'react';
import { ArrowRight, Compass, Check, BookOpen, Coffee, Feather } from 'lucide-react';

interface LandingHeroProps {
  onOpenApp: () => void;
  onOpenDiscover: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenApp, onOpenDiscover }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="landing-hero-section" id="top">
      <div className="landing-hero-container">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <Feather size={14} color="#204A35" />
            <span>A Calmer Internet</span>
          </div>

          <h1 className="landing-hero-title">
            Read what matters.<br />
            Not what’s trending.
          </h1>

          <p className="landing-hero-description">
            Readora brings independent blogs into one beautiful, distraction-free space.
            Follow your favorite writers, discover new voices, and read on your own terms.
          </p>

          <div className="landing-hero-cta-group">
            <button
              className="landing-hero-btn-primary"
              onClick={onOpenApp}
              aria-label="Get started free with Readora"
            >
              <span>Get started free</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="landing-hero-btn-secondary"
              onClick={onOpenDiscover}
              aria-label="Explore curated independent blogs"
            >
              <Compass size={16} color="#204A35" />
              <span>Explore blogs</span>
            </button>
          </div>

          <div className="landing-trust-row" aria-label="Privacy features">
            <div className="landing-trust-item">
              <Check size={14} className="landing-trust-check" />
              <span>No ads</span>
            </div>
            <div className="landing-trust-item">
              <Check size={14} className="landing-trust-check" />
              <span>No tracking</span>
            </div>
            <div className="landing-trust-item">
              <Check size={14} className="landing-trust-check" />
              <span>No account required</span>
            </div>
          </div>
        </div>

        {/* Right Column: Serene Reading Desk Editorial Visual */}
        <div className="landing-hero-visual">
          <div className="landing-hero-image-frame">
            {!imageError ? (
              <img
                src="/hero-reading-desk.jpg"
                alt="Cozy reading desk with hardcover books, notebook, and morning tea overlooking mountains"
                className="landing-hero-img"
                loading="eager"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #E3EBDF 0%, #D2DFCC 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  textAlign: 'center',
                  color: '#204A35'
                }}
              >
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.8 }} />
                <h3 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '24px', margin: '0 0 8px 0' }}>
                  Independent Minds
                </h3>
                <p style={{ fontSize: '14px', maxWidth: '320px', color: '#4d614a' }}>
                  Quiet spaces for reflective reading and slow ideas.
                </p>
              </div>
            )}

            {/* Gradient Overlay for Editorial Blend */}
            <div className="landing-hero-gradient-overlay" />

            {/* Framed Quote Badge */}
            <div className="landing-hero-quote-badge">
              <p className="landing-hero-quote-text">
                “A quieter internet is a richer mind.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};