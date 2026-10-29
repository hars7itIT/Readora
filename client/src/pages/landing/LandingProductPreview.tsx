import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Feather,
  Search,
  Share2,
  Type,
  Plus,
  Compass,
  Inbox
} from 'lucide-react';
import type { Post, Feed } from '../../types/index';

interface LandingProductPreviewProps {
  onOpenApp: () => void;
  posts?: Post[];
  feeds?: Feed[];
  totalArticlesCount?: number;
  unreadCount?: number;
  starredCount?: number;
}

export const LandingProductPreview: React.FC<LandingProductPreviewProps> = ({
  onOpenApp,
  posts = [],
  feeds = [],
  totalArticlesCount = 732,
  unreadCount = 706,
  starredCount = 84
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'unread' | 'saved'>('all');
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);

  const previewArticles = [
    {
      title: 'Quasi quae est modi quis quam in impedit',
      feed: 'Clementina DuBuque’s Blog',
      author: 'Clementina DuBuque',
      time: '1 min read',
      date: '29 Oct',
      tags: ['discussion', 'writing', 'independent'],
      content:
        'Quasi quae est modi quis quam in impedit. Quisquam fuga quae voluptates. Ut tempora non est et delectus. Velit sunt et qui deleniti distinctio vel recusandae. Writing independently allows authors to explore deep questions without chasing the ephemeral dopamine loops of the social feed.'
    },
    {
      title: 'A quieter web for deliberate thinkers',
      feed: 'Glenna Reichert’s Journal',
      author: 'Glenna Reichert',
      time: '2 min read',
      date: '28 Oct',
      tags: ['culture', 'essay', 'minimalism'],
      content:
        'When algorithms dictate what we see, we lose the serendipity of human curation. RSS and personal web publishing give us back our agency. We read at our own cadence, free of noisy metrics.'
    },
    {
      title: 'Notes on typography and reading environments',
      feed: 'Nicholas Runolfsdottir',
      author: 'Nicholas Runolfsdottir',
      time: '3 min read',
      date: '27 Oct',
      tags: ['design', 'typography', 'web'],
      content:
        'Editorial legibility is not an accident. Proper line-height, warm ivory paper tones, and humanist serifs relieve eye fatigue and invite contemplation.'
    }
  ];

  const currentPost = previewArticles[selectedPreviewIndex] || previewArticles[0];

  return (
    <section className="landing-preview-section" id="preview" aria-label="Product Preview">
      <div className="landing-preview-container">
        {/* Section Header */}
        <div className="landing-section-header">
          <div className="landing-eyebrow">
            <Feather size={14} color="#204A35" />
            <span>A Closer Look</span>
          </div>

          <h2 className="landing-section-title">
            A better way to read the open web.
          </h2>

          <p className="landing-section-subtitle">
            Readora helps you take control of your reading. Follow the voices you care about,
            explore new perspectives, and enjoy a calmer, more intentional internet.
          </p>
        </div>

        {/* Dashboard Preview Window */}
        <div className="landing-dashboard-window">
          {/* Browser Window Chrome */}
          <div className="landing-window-chrome">
            <div className="landing-window-dots">
              <span className="landing-window-dot red" />
              <span className="landing-window-dot yellow" />
              <span className="landing-window-dot green" />
            </div>
            <div className="landing-window-url-bar">
              <span>https://readora.local/app</span>
            </div>
            <div style={{ width: '40px' }} />
          </div>

          {/* Three-Column Application UI Preview */}
          <div className="landing-mock-grid">
            {/* Sidebar Mock */}
            <aside className="landing-mock-sidebar">
              <div className="landing-mock-brand">
                <img
                  src="/readora-logo.png"
                  alt="Readora"
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                />
              </div>

              <div className="landing-mock-nav-group">
                <div className={`landing-mock-nav-item ${activeTab === 'all' ? 'active' : ''}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Inbox size={13} /> Recommendation
                  </span>
                  <span className="landing-mock-badge">{totalArticlesCount}</span>
                </div>
                <div className={`landing-mock-nav-item ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => setActiveTab('popular')}>
                  <span>Popular Post</span>
                  <span className="landing-mock-badge" style={{ background: '#df7e47', color: '#fff' }}>Hot</span>
                </div>
                <div className={`landing-mock-nav-item ${activeTab === 'unread' ? 'active' : ''}`}>
                  <span>Unread only</span>
                  <span className="landing-mock-badge">{unreadCount}</span>
                </div>
                <div className={`landing-mock-nav-item ${activeTab === 'saved' ? 'active' : ''}`}>
                  <span>Saved articles</span>
                  <span className="landing-mock-badge">{starredCount}</span>
                </div>
                <div className="landing-mock-nav-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={13} /> Discover
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#df7e47', textTransform: 'uppercase' }}>
                    New
                  </span>
                </div>
              </div>

              <div>
                <div className="landing-mock-feed-title">
                  Subscriptions (23)
                </div>
                <div className="landing-mock-nav-group">
                  <div className="landing-mock-feed-item">
                    <span>Glenna Reichert</span>
                    <span style={{ fontSize: '10px', color: '#889886' }}>24</span>
                  </div>
                  <div className="landing-mock-feed-item">
                    <span>Clementina DuBuque</span>
                    <span style={{ fontSize: '10px', color: '#889886' }}>18</span>
                  </div>
                  <div className="landing-mock-feed-item">
                    <span>Kurtis Weissnat</span>
                    <span style={{ fontSize: '10px', color: '#889886' }}>27</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Timeline Column Mock */}
            <div className="landing-mock-timeline">
              <div className="landing-mock-timeline-header">
                <button
                  type="button"
                  className={`landing-mock-filter-chip ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  Recommendation
                </button>
                <button
                  type="button"
                  className={`landing-mock-filter-chip ${activeTab === 'popular' ? 'active' : ''}`}
                  onClick={() => setActiveTab('popular')}
                >
                  Popular Post
                </button>
                <button
                  type="button"
                  className={`landing-mock-filter-chip ${activeTab === 'unread' ? 'active' : ''}`}
                  onClick={() => setActiveTab('unread')}
                >
                  Unread
                </button>
                <button
                  type="button"
                  className={`landing-mock-filter-chip ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  Saved
                </button>
              </div>

              <div className="landing-mock-article-list">
                {previewArticles.map((article, idx) => (
                  <div
                    key={idx}
                    className={`landing-mock-card ${selectedPreviewIndex === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedPreviewIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="landing-mock-meta">
                      {article.feed} · {article.date} · {article.time}
                    </div>
                    <div className="landing-mock-title">{article.title}</div>
                    <div>
                      {article.tags.map((tag) => (
                        <span key={tag} className="landing-mock-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading View Mock */}
            <article className="landing-mock-reader">
              <div className="landing-mock-reader-toolbar">
                <span style={{ color: '#204A35', fontWeight: 600 }}>← Back to all articles</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Bookmark size={14} color="#204A35" />
                  <CheckCircle2 size={14} color="#204A35" />
                  <Type size={14} />
                  <Share2 size={14} />
                </div>
              </div>

              <h3 className="landing-mock-reader-title">{currentPost.title}</h3>

              <div className="landing-mock-reader-byline">
                <span style={{ fontWeight: 600, color: '#204A35' }}>{currentPost.author}</span>
                <span>·</span>
                <span>{currentPost.date}</span>
                <span>·</span>
                <Clock size={11} />
                <span>{currentPost.time}</span>
              </div>

              <div className="landing-mock-reader-body">
                <p>{currentPost.content}</p>
                <p>
                  No advertisements interrupt your focus. No social algorithms reorder your
                  timeline. You choose the publications you follow and read them in clean,
                  chronological order.
                </p>
              </div>
            </article>
          </div>
        </div>

        {/* CTA to open reading space */}
        <button
          className="landing-hero-btn-primary"
          onClick={onOpenApp}
          style={{ fontSize: '15px', padding: '14px 28px' }}
        >
          <span>Open your reading space</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};