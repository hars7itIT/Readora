import React from 'react';
import { Feather, PlusCircle, Compass, BookOpen } from 'lucide-react';

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Find your favorite blogs',
      desc: 'Add any RSS, Atom, or website URL directly, or browse curated collections of independent voices in the Discover directory.',
      icon: <Compass size={20} />
    },
    {
      step: '02',
      title: 'Build your personal reading space',
      desc: 'Follow feeds and organize the articles you want to read. Star noteworthy essays, add private margin notes, and group your subscriptions.',
      icon: <PlusCircle size={20} />
    },
    {
      step: '03',
      title: 'Read without distractions',
      desc: 'Browse chronologically, save articles to read later, and read cached content offline whenever you disconnect from the internet.',
      icon: <BookOpen size={20} />
    }
  ];

  return (
    <section className="landing-workflow-section" id="how-it-works" aria-label="How It Works">
      <div className="landing-workflow-container">
        <div className="landing-section-header">
          <div className="landing-eyebrow">
            <Feather size={14} color="#204A35" />
            <span>Simple by Design</span>
          </div>

          <h2 className="landing-section-title">
            How Readora works.
          </h2>

          <p className="landing-section-subtitle">
            Three simple steps to reclaim your reading routine from algorithms.
          </p>
        </div>

        <div className="landing-steps-grid">
          {steps.map((s, idx) => (
            <div key={idx} className="landing-step-card">
              <div className="landing-step-number">{s.step}</div>
              <h3 className="landing-step-title">{s.title}</h3>
              <p className="landing-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};