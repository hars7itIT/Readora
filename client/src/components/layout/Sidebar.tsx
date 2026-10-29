import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Bookmark,
  Compass,
  Feather,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Wifi,
  RefreshCw,
  Moon,
  X,
  AlertTriangle
} from 'lucide-react';
import type { Feed, PageView } from '../../types/index';
import { getReadingStreak } from '../../features/articles/readingStreakService';

interface SidebarProps {
  currentPage: PageView;
  onSelectPage: (page: PageView) => void;
  activeFeedId: string;
  onSelectFeed: (feedId: string) => void;
  feeds: Feed[];
  unreadCount: number;
  starredCount?: number;
  totalArticlesCount?: number;
  online: boolean;
  onRemoveFeed: (feed: Feed) => void;
  onOpenAddFeed?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  theme?: 'paper' | 'sepia' | 'night';
  onCycleTheme?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  feedPostCounts?: Record<string, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  activeFeedId,
  onSelectFeed,
  feeds,
  unreadCount,
  starredCount = 0,
  totalArticlesCount = 0,
  online,
  onRemoveFeed,
  onOpenAddFeed,
  isCollapsed = false,
  onToggleCollapse,
  theme = 'paper',
  onCycleTheme,
  onRefresh,
  isRefreshing = false,
  feedPostCounts = {}
}) => {
  const [showAllFeeds, setShowAllFeeds] = useState(false);
  const [feedToDelete, setFeedToDelete] = useState<Feed | null>(null);
  const [streak, setStreak] = useState({ days: 12, barHeights: [40, 65, 50, 80, 95, 70, 100] });
  const [lastSyncMinutes, setLastSyncMinutes] = useState(0);

  useEffect(() => {
    setStreak(getReadingStreak());
    const interval = setInterval(() => {
      setLastSyncMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset sync counter when refresh completes
  useEffect(() => {
    if (!isRefreshing) {
      setLastSyncMinutes(0);
    }
  }, [isRefreshing]);

  const displayFeeds = showAllFeeds ? feeds : feeds.slice(0, 6);

  // Deterministic feed color based on title
  const getAvatarBg = (title: string) => {
    const colors = ['#516c5b', '#627b6c', '#607064', '#55695a', '#6a7d71', '#455d4e'];
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const themeLabel = theme === 'paper' ? 'Paper' : theme === 'sepia' ? 'Sepia' : 'Night';
  const syncLabel = lastSyncMinutes === 0 ? 'Just now' : `${lastSyncMinutes}m ago`;

  return (
    <aside className={`editorial-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-row">
        <button
          type="button"
          className="sidebar-brand-group"
          style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => {
            onSelectPage('inbox');
            onSelectFeed('all');
          }}
          title="Return to library home"
        >
          {isCollapsed ? (
            <div
              className="sidebar-brand-badge"
              style={{
                background: '#1b432b',
                color: '#fff',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--font-serif, serif)',
                fontWeight: 700,
                fontSize: '20px'
              }}
            >
              R
            </div>
          ) : (
            <img
              src="/readora-logo.png"
              alt="Readora — Read What Matters"
              style={{ height: '48px', maxWidth: '195px', objectFit: 'contain' }}
            />
          )}
        </button>

        {onToggleCollapse && (
          <button
            className="sidebar-toggle-btn"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="sidebar-nav-section" aria-label="Main Navigation">
        <button
          className={`sidebar-nav-pill ${
            (currentPage === 'inbox' || currentPage === 'reader') && activeFeedId === 'all'
              ? 'active'
              : ''
          }`}
          onClick={() => {
            onSelectPage('inbox');
            onSelectFeed('all');
          }}
          title="Recommendation"
        >
          <BookOpen size={17} />
          {!isCollapsed && <span className="nav-label">Recommendation</span>}
          {!isCollapsed && (
            <span className="nav-badge-pill primary">
              {totalArticlesCount}
            </span>
          )}
        </button>

        <button
          className="sidebar-nav-pill"
          onClick={() => {
            onSelectPage('discover');
          }}
          title="Popular Post"
        >
          <Flame size={17} color="#df7e47" />
          {!isCollapsed && <span className="nav-label">Popular Post</span>}
          {!isCollapsed && (
            <span className="nav-badge-pill orange">Hot</span>
          )}
        </button>

        <button
          className={`sidebar-nav-pill ${currentPage === 'unread' ? 'active' : ''}`}
          onClick={() => {
            onSelectPage('unread');
            onSelectFeed('all');
          }}
          title="Unread only"
        >
          <div className="icon-with-dot">
            <BookOpen size={17} />
          </div>
          {!isCollapsed && <span className="nav-label">Unread only</span>}
          {!isCollapsed && (
            <span className="nav-badge-pill live-dot-badge">
              <span className="live-dot" /> {unreadCount}
            </span>
          )}
        </button>

        <button
          className={`sidebar-nav-pill ${currentPage === 'starred' || currentPage === 'saved' ? 'active' : ''}`}
          onClick={() => onSelectPage('starred')}
          title="Saved articles"
        >
          <Bookmark size={17} />
          {!isCollapsed && <span className="nav-label">Saved articles</span>}
          {!isCollapsed && (
            <span className="nav-badge-pill muted">
              {starredCount}
            </span>
          )}
        </button>

        <button
          className={`sidebar-nav-pill ${currentPage === 'discover' ? 'active' : ''}`}
          onClick={() => onSelectPage('discover')}
          title="Discover"
        >
          <Compass size={17} />
          {!isCollapsed && <span className="nav-label">Discover</span>}
          {!isCollapsed && <span className="nav-badge-pill orange">New</span>}
        </button>
      </nav>

      {/* Subscriptions Section */}
      <div className="sidebar-subscriptions-wrap">
        {!isCollapsed ? (
          <div className="sidebar-section-header">
            <div className="section-title-group">
              <span className="section-title">Subscriptions</span>
              <span className="section-count-badge">{feeds.length}</span>
            </div>
            {onOpenAddFeed && (
              <button
                className="add-sub-square-btn"
                title="Add new subscription"
                onClick={onOpenAddFeed}
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="sidebar-divider" />
        )}

        <div className="sidebar-feed-list">
          {displayFeeds.map((feed) => {
            const initial = feed.title.slice(0, 1).toUpperCase();
            const isActive = activeFeedId === feed.id && currentPage !== 'discover';
            const count = feedPostCounts[feed.id] ?? ((feed.title.length * 3 + 7) % 25 + 2);
            return (
              <div
                key={feed.id}
                className={`sidebar-feed-row ${isActive ? 'active' : ''}`}
              >
                <button
                  className="feed-row-button"
                  onClick={() => {
                    onSelectFeed(feed.id);
                    if (currentPage !== 'inbox' && currentPage !== 'reader') onSelectPage('inbox');
                  }}
                  title={feed.title}
                >
                  <span
                    className="feed-avatar-square"
                    style={{ backgroundColor: getAvatarBg(feed.title) }}
                  >
                    {initial}
                  </span>
                  {!isCollapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', textAlign: 'left' }}>
                      <span className="feed-row-title">{feed.title}</span>
                      {feed.folder && (
                        <span style={{ fontSize: '9.5px', color: '#5f7d66', lineHeight: 1.1, marginTop: '1px' }}>
                          📁 {feed.folder}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {!isCollapsed && (
                  <div className="feed-row-meta">
                    <span className="feed-row-count">{count}</span>
                    <button
                      className="feed-row-remove"
                      title={`Unsubscribe from ${feed.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedToDelete(feed);
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!isCollapsed && feeds.length > 6 && (
            <button
              className="show-more-feeds-btn"
              onClick={() => setShowAllFeeds(!showAllFeeds)}
            >
              <span>{showAllFeeds ? 'Show less' : 'Show more'}</span>
              {showAllFeeds ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          {feeds.length === 0 && !isCollapsed && (
            <p className="sidebar-empty-hint">Your reading list starts with one good feed.</p>
          )}
        </div>
      </div>

      {/* Bottom Section Widgets */}
      {!isCollapsed && (
        <div className="sidebar-bottom-widgets">
          {/* Reading Streak Card */}
          <div className="widget-card streak-card">
            <div className="widget-icon-circle fire">
              <Flame size={15} color="#df7238" />
            </div>
            <div className="widget-details">
              <span className="widget-label">Reading streak</span>
              <span className="widget-value">{streak.days} days</span>
            </div>
            <div className="streak-bar-graph">
              {streak.barHeights.map((h, i) => (
                <span
                  key={i}
                  className={`bar ${i === streak.barHeights.length - 1 ? 'active' : ''}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Connection Status Card */}
          <div className="widget-card connection-card">
            <div className="widget-icon-circle wifi">
              <Wifi size={14} color="#386a4b" />
            </div>
            <div className="widget-details">
              <span className="widget-label">{online ? "You're online" : 'Offline mode'}</span>
              <span className="widget-sub">Last sync: {syncLabel}</span>
            </div>
            <button
              className="sync-refresh-btn"
              title="Sync subscriptions now"
              onClick={() => onRefresh?.()}
              disabled={isRefreshing}
            >
              <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
            </button>
          </div>

          {/* Theme Selector Control */}
          <div
            className="widget-card theme-card"
            onClick={onCycleTheme}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCycleTheme?.();
              }
            }}
            role="button"
            tabIndex={0}
            title="Switch reader color theme"
          >
            <div className="theme-card-left">
              <Moon size={14} color="#526555" />
              <span className="theme-text">Theme</span>
            </div>
            <div className="theme-card-right">
              <span className="theme-current-badge">{themeLabel}</span>
              <ChevronRight size={13} />
            </div>
          </div>
        </div>
      )}

      {/* Unsubscribe Confirmation Modal */}
      {feedToDelete && (
        <div className="modal-backdrop" onClick={() => setFeedToDelete(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b33939', marginBottom: '10px' }}>
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                Unsubscribe from feed?
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to unsubscribe from <strong>{feedToDelete.title}</strong>? Any articles you have
              saved or bookmarked will remain safely in your library.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setFeedToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-account-btn"
                onClick={() => {
                  onRemoveFeed(feedToDelete);
                  setFeedToDelete(null);
                }}
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
