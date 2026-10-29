import React from 'react';
import { Feather } from 'lucide-react';

export const LandingAboutSection: React.FC = () => {
  return (
    <section className="landing-manifesto-section" id="about" aria-label="About and Manifesto">
      <div className="landing-manifesto-container">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#E3EBDF',
              color: '#204A35',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Feather size={20} />
          </div>
        </div>

        <blockquote className="landing-manifesto-quote">
          “The open web was built on independent thinkers, personal essays, and thoughtful discourse.
          Readora was created to protect that spirit: a slower, calmer internet where you decide
          what deserves your attention.”
        </blockquote>

        <div className="landing-manifesto-author">
          Readora Manifesto · Read What Matters
        </div>
      </div>
    </section>
  );
};