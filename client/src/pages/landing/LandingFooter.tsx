import React from 'react';
import { Feather } from 'lucide-react';
import type { PageView } from '../../types/index';

interface LandingFooterProps {
  onNavigate: (page: PageView) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate }) => {
  const scrollTo = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="landing-footer" aria-label="Footer">
      <div className="landing-footer-container">
        <div className="landing-footer-grid">
          {/* Brand Column */}
          <div className="landing-footer-brand-col">
            <button
              className="landing-brand"
              onClick={() => scrollTo('top')}
              style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Readora home"
            >
              <img
                src="/readora-logo.png"
                alt="Readora — Read What Matters"
                style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
              />
            </button>
            <p className="landing-footer-tagline-text">
              A privacy-first, distraction-free reading platform for the independent web.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <div className="landing-footer-col-title">Navigation</div>
            <ul className="landing-footer-links">
              <li>
                <button className="landing-footer-link" onClick={() => scrollTo('top')}>
                  Home
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => onNavigate('discover')}>
                  Discover Blogs
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => onNavigate('inbox')}>
                  Reading Dashboard
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => onNavigate('subscriptions')}>
                  Subscriptions
                </button>
              </li>
            </ul>
          </div>

          {/* Product & Philosophy Column */}
          <div>
            <div className="landing-footer-col-title">Product</div>
            <ul className="landing-footer-links">
              <li>
                <button className="landing-footer-link" onClick={() => scrollTo('features')}>
                  Key Features
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => scrollTo('preview')}>
                  Dashboard Preview
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => scrollTo('privacy')}>
                  Privacy Architecture
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => scrollTo('about')}>
                  Editorial Manifesto
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Settings Column */}
          <div>
            <div className="landing-footer-col-title">Account</div>
            <ul className="landing-footer-links">
              <li>
                <button className="landing-footer-link" onClick={() => onNavigate('login')}>
                  Sign in
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => onNavigate('signup')}>
                  Create account
                </button>
              </li>
              <li>
                <button className="landing-footer-link" onClick={() => onNavigate('settings')}>
                  Preferences & Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 Readora. All rights reserved.</span>
          <span className="landing-footer-motto">A quieter internet is a richer mind.</span>
        </div>
      </div>
    </footer>
  );
};