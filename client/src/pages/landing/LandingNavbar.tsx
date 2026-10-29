import React, { useState } from 'react';
import { Feather, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  onOpenApp: () => void;
  onOpenDiscover: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  theme?: 'paper' | 'sepia' | 'night';
  onCycleTheme?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onOpenApp,
  onOpenDiscover,
  onOpenLogin,
  onOpenSignup,
  theme = 'paper',
  onCycleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'discover' | 'privacy' | 'about'>('home');

  const scrollToSection = (id: string, tab: 'home' | 'features' | 'privacy' | 'about') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
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
    <header className="landing-navbar-wrapper">
      <nav className="landing-navbar" aria-label="Main Navigation">
        {/* Brand */}
        <button
          className="landing-brand"
          onClick={() => scrollToSection('top', 'home')}
          aria-label="Readora home"
          style={{ background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img
            src="/readora-logo.png"
            alt="Readora — Read What Matters"
            style={{ height: '56px', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </button>

        {/* Center Desktop Navigation */}
        <ul className="landing-nav-center">
          <li>
            <button
              className={`landing-nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => scrollToSection('top', 'home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={`landing-nav-link ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => scrollToSection('features', 'features')}
            >
              Features
            </button>
          </li>
          <li>
            <button
              className="landing-nav-link"
              onClick={() => {
                setActiveTab('discover');
                onOpenDiscover();
              }}
            >
              Discover
            </button>
          </li>
          <li>
            <button
              className={`landing-nav-link ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => scrollToSection('privacy', 'privacy')}
            >
              Privacy
            </button>
          </li>
          <li>
            <button
              className={`landing-nav-link ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => scrollToSection('about', 'about')}
            >
              About
            </button>
          </li>
          <li>
            <a
              href="/presentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-nav-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 600 }}
              title="Open Problem Statement PS-003 Solution Presentation Deck"
            >
              <span>📊</span>
              <span>PS-003 Deck</span>
            </a>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="landing-nav-right">
          {onCycleTheme && (
            <button
              className="landing-theme-toggle"
              onClick={onCycleTheme}
              title={`Current theme: ${theme}. Click to switch theme.`}
              aria-label="Toggle reader theme"
            >
              {theme === 'night' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}

          <button className="landing-btn-ghost" onClick={onOpenLogin}>
            Sign in
          </button>

          <button className="landing-btn-primary" onClick={onOpenApp}>
            <span>Get started</span>
            <ArrowRight size={14} />
          </button>

          <button
            className="landing-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`landing-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          className="landing-mobile-link"
          onClick={() => scrollToSection('top', 'home')}
        >
          Home
        </button>
        <button
          className="landing-mobile-link"
          onClick={() => scrollToSection('features', 'features')}
        >
          Features
        </button>
        <button
          className="landing-mobile-link"
          onClick={() => {
            setMobileMenuOpen(false);
            onOpenDiscover();
          }}
        >
          Discover Blogs
        </button>
        <button
          className="landing-mobile-link"
          onClick={() => scrollToSection('privacy', 'privacy')}
        >
          Privacy Philosophy
        </button>
        <button
          className="landing-mobile-link"
          onClick={() => scrollToSection('about', 'about')}
        >
          About & Manifesto
        </button>
        <a
          href="/presentation.html"
          target="_blank"
          rel="noopener noreferrer"
          className="landing-mobile-link"
          style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>📊</span>
          <span>PS-003 Solution Deck</span>
        </a>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            className="landing-btn-ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenLogin();
            }}
          >
            Sign in
          </button>
          <button
            className="landing-btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenApp();
            }}
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
};