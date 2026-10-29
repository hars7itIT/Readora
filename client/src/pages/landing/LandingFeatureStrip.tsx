import React from 'react';
import { BookOpen, Feather, Wifi, Compass } from 'lucide-react';

export const LandingFeatureStrip: React.FC = () => {
  const features = [
    {
      icon: <BookOpen size={22} />,
      title: 'All Your Favorite Blogs',
      desc: 'Follow independent writers and read everything in one place.'
    },
    {
      icon: <Feather size={22} />,
      title: 'Distraction-Free Reading',
      desc: 'A clean, focused reading experience without unnecessary clutter.'
    },
    {
      icon: <Wifi size={22} />,
      title: 'Read Anywhere',
      desc: 'Offline support keeps your cached articles available without internet.'
    },
    {
      icon: <Compass size={22} />,
      title: 'Discover New Voices',
      desc: 'Find independent blogs through curated collections and recommendations.'
    }
  ];

  return (
    <section className="landing-feature-strip-section" id="features" aria-label="Key Features">
      <div className="landing-feature-strip-container">
        {features.map((f, i) => (
          <div key={i} className="landing-feature-item">
            <div className="landing-feature-icon-circle" aria-hidden="true">
              {f.icon}
            </div>
            <div className="landing-feature-text">
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};