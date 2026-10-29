import React from 'react';
import { ArrowRight, Compass, Feather } from 'lucide-react';

interface LandingFinalCTAProps {
  onOpenApp: () => void;
  onOpenDiscover: () => void;
}

export const LandingFinalCTA: React.FC<LandingFinalCTAProps> = ({ onOpenApp, onOpenDiscover }) => {
  return (
    <section className="landing-final-cta-section" aria-label="Call to Action">
      <div className="landing-final-cta-container">
        <div className="landing-final-cta-leaf">
          <Feather size={24} />
        </div>

        <h2 className="landing-final-cta-title">
          Make room for better reading.
        </h2>

        <p className="landing-final-cta-desc">
          Follow the writers you love. Discover the ones you haven’t met yet.
        </p>

        <div className="landing-final-cta-actions">
          <button
            className="landing-final-btn-primary"
            onClick={onOpenApp}
            aria-label="Start reading with Readora"
          >
            <span>Start reading</span>
            <ArrowRight size={16} />
          </button>

          <button
            className="landing-final-btn-secondary"
            onClick={onOpenDiscover}
            aria-label="Explore independent blogs directory"
          >
            <Compass size={16} />
            <span>Explore independent blogs</span>
          </button>
        </div>
      </div>
    </section>
  );
};