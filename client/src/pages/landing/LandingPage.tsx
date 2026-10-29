import React, { useEffect } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingFeatureStrip } from './LandingFeatureStrip';
import { LandingLiveLinksStrip } from './LandingLiveLinksStrip';
import { LandingProductPreview } from './LandingProductPreview';
import { LandingPrivacySection } from './LandingPrivacySection';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingAboutSection } from './LandingAboutSection';
import { LandingFinalCTA } from './LandingFinalCTA';
import { LandingFooter } from './LandingFooter';
import { ParticleBackground } from '../../components/ui/ParticleBackground';
import type { PageView, Post, Feed } from '../../types/index';
import '../../styles/landing.css';

interface LandingPageProps {
  onNavigate: (page: PageView) => void;
  posts?: Post[];
  feeds?: Feed[];
  totalArticlesCount?: number;
  unreadCount?: number;
  starredCount?: number;
  theme?: 'paper' | 'sepia' | 'night';
  onCycleTheme?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  posts = [],
  feeds = [],
  totalArticlesCount,
  unreadCount,
  starredCount,
  theme = 'paper',
  onCycleTheme
}) => {
  useEffect(() => {
    document.title = 'Readora — Read What Matters | Calm RSS Reading';
    return () => {
      document.title = 'Readora — Read What Matters';
    };
  }, []);

  return (
    <div className="landing-container" style={{ position: 'relative' }}>
      {/* Pointer-Reactive Confetti Particle Canvas */}
      <ParticleBackground />

      {/* Sticky Editorial Navbar */}
      <LandingNavbar
        onOpenApp={() => onNavigate('inbox')}
        onOpenDiscover={() => onNavigate('discover')}
        onOpenLogin={() => onNavigate('login')}
        onOpenSignup={() => onNavigate('signup')}
        theme={theme}
        onCycleTheme={onCycleTheme}
      />

      {/* Main Content Landmark */}
      <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>
        {/* Split Hero Section */}
        <LandingHero
          onOpenApp={() => onNavigate('inbox')}
          onOpenDiscover={() => onNavigate('discover')}
        />

        {/* 4-Column Feature Highlights Strip */}
        <LandingFeatureStrip />

        {/* Real-Time Blogger Live Links Wire */}
        <LandingLiveLinksStrip />

        {/* Product Preview Section with Rendered Dashboard */}
        <LandingProductPreview
          onOpenApp={() => onNavigate('inbox')}
          posts={posts}
          feeds={feeds}
          totalArticlesCount={totalArticlesCount}
          unreadCount={unreadCount}
          starredCount={starredCount}
        />

        {/* Privacy Architecture Section */}
        <LandingPrivacySection />

        {/* 3-Step Workflow Section */}
        <LandingHowItWorks />

        {/* About & Editorial Philosophy Section */}
        <LandingAboutSection />

        {/* Dark Forest Green Final Call to Action */}
        <LandingFinalCTA
          onOpenApp={() => onNavigate('inbox')}
          onOpenDiscover={() => onNavigate('discover')}
        />
      </main>

      {/* Editorial Footer */}
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
};