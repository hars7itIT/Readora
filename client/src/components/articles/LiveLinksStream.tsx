import React, { useState, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  BookOpen,
  Key,
  Search,
  Filter
} from 'lucide-react';
import { bloggerService } from '../../features/blogger/bloggerService';
import type { Post } from '../../types/index';

interface LiveLinksStreamProps {
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post) => void;
  onToggleRead: (post: Post) => void;
  onToggleStar?: (post: Post) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const LiveLinksStream: React.FC<LiveLinksStreamProps> = ({
  posts,
  selectedPost,
  onSelectPost,
  onToggleRead,
  onToggleStar,
  onRefresh,
  isRefreshing = false
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveFetching, setIsLiveFetching] = useState<boolean>(false);
  const [liveNotice, setLiveNotice] = useState<string>('');

  // Auto-sync polling every 30 seconds for live incoming Blogger links
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const timer = setInterval(async () => {
      try {
        await bloggerService.fetchAllLiveBloggerLinks();
      } catch {}
      onRefresh();
    }, 30000);

    return () => clearInterval(timer);
  }, [autoSyncEnabled, onRefresh]);

  const handleManualSync = async () => {
    setIsLiveFetching(true);
    setLiveNotice('Connecting to Blogger API v3...');
    try {
      const res = await bloggerService.fetchAllLiveBloggerLinks();
      onRefresh();
      setLiveNotice(`Updated live links from Google Blogger API!`);
      setTimeout(() => setLiveNotice(''), 3000);
    } catch {
      onRefresh();
      setLiveNotice('Refreshed local links feed.');
      setTimeout(() => setLiveNotice(''), 3000);
    } finally {
      setIsLiveFetching(false);
    }
  };

  const handleCopy = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = post.link && !post.link.startsWith('local://') ? post.link : window.location.href;
    navigator.clipboard?.writeText(url);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'external';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Filter posts based on search query
  const displayedPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.link.toLowerCase().includes(q) ||
        p.feedTitle.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [posts, searchQuery]);

  return (
    <div className="live-links-stream-wrapper">
      {/* Live Stream Status Bar with API Key details */}
      <div className="live-stream-header-bar">
        <div className="live-stream-status-left">
          <span className="live-pulse-dot" />
          <span className="live-stream-title">Blogger API Live Links</span>
          <span className="live-links-count-pill">{displayedPosts.length} links</span>
          <span
            className="source-domain-pill"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', background: '#e4eee1' }}
            title={`Active API Key: ${bloggerService.apiKey}`}
          >
            <Key size={10} /> Key: AIzaSyBJzg…uzHs
          </span>
        </div>

        <div className="live-stream-status-right">
          <button
            type="button"
            className={`live-auto-poll-btn ${autoSyncEnabled ? 'active' : ''}`}
            onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
            title="Toggle live 30s auto-refresh polling"
          >
            <Radio size={12} />
            <span>{autoSyncEnabled ? 'Live: ON (30s)' : 'Live: Paused'}</span>
          </button>

          <button
            type="button"
            className="live-sync-now-btn"
            onClick={handleManualSync}
            disabled={isRefreshing || isLiveFetching}
            title="Fetch new live links from Google Blogger API v3"
          >
            <RefreshCw size={12} className={isRefreshing || isLiveFetching ? 'spin' : ''} />
            <span>{isRefreshing || isLiveFetching ? 'Fetching…' : 'Sync Blogger API'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Notice if any */}
      {liveNotice && (
        <div style={{ fontSize: '11px', color: '#20452f', background: '#eef6ec', padding: '5px 10px', borderRadius: '6px', fontWeight: 600 }}>
          ✓ {liveNotice}
        </div>
      )}

      {/* Quick Search & Filter Toolbar for Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #dce6da', borderRadius: '8px', padding: '6px 10px' }}>
        <Search size={13} color="#657a69" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter live links by domain, headline, or topic…"
          style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '12px', color: '#1e3827' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#657a69' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Stream List of Links */}
      <div className="live-links-list">
        {displayedPosts.length === 0 ? (
          <div className="timeline-empty-message">
            <p>No links found matching your filter. Click &quot;Sync Blogger API&quot; to fetch live links.</p>
          </div>
        ) : (
          displayedPosts.map((post) => {
            const isSelected = selectedPost?.id === post.id;
            const domain = getDomainFromUrl(post.link);
            const isCopied = copiedId === post.id;

            return (
              <div
                key={post.id}
                className={`live-link-card ${isSelected ? 'selected' : ''} ${post.read ? 'read' : 'unread'}`}
                onClick={() => onSelectPost(post)}
              >
                {/* Top Meta: Source Domain Badge, Blog Name & Time */}
                <div className="live-link-meta-row">
                  <div className="live-link-source-badge">
                    <span className="source-domain-pill">{domain}</span>
                    <span className="source-feed-name">{post.feedTitle}</span>
                  </div>

                  <div className="live-link-time-badge">
                    <Clock size={11} />
                    <span>{formatTimeAgo(post.publishedAt)}</span>
                    {!post.read && <span className="live-unread-indicator" title="New link" />}
                  </div>
                </div>

                {/* Post Title - Clickable directly */}
                <h4 className="live-link-headline">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    title={`Open link: ${post.link}`}
                  >
                    {post.title}
                  </a>
                </h4>

                {/* Prominent Real-Time URL Box */}
                <div className="live-url-display-box" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="live-url-anchor"
                    title={`Open ${post.link}`}
                  >
                    <ExternalLink size={13} className="live-url-icon" />
                    <span className="live-url-text">{post.link}</span>
                  </a>

                  <button
                    type="button"
                    className={`live-url-copy-btn ${isCopied ? 'copied' : ''}`}
                    onClick={(e) => handleCopy(post, e)}
                    title={isCopied ? 'Copied to clipboard!' : 'Copy link'}
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Quick Controls */}
                <div className="live-link-footer-row" onClick={(e) => e.stopPropagation()}>
                  <div className="live-link-tags">
                    {post.tags?.slice(0, 3).map((t) => (
                      <span key={t} className="live-tag-chip">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="live-link-actions">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="live-action-icon-btn"
                      title="Open external website directly"
                    >
                      <ExternalLink size={13} />
                      <span>Open Link ↗</span>
                    </a>

                    <button
                      type="button"
                      className="live-action-icon-btn"
                      onClick={() => onSelectPost(post)}
                      title="Read post article in reader view"
                    >
                      <BookOpen size={13} />
                      <span>Reader</span>
                    </button>

                    {onToggleStar && (
                      <button
                        type="button"
                        className={`live-action-icon-btn ${post.starred ? 'active' : ''}`}
                        onClick={() => onToggleStar(post)}
                        title={post.starred ? 'Saved' : 'Save'}
                      >
                        <Bookmark
                          size={13}
                          fill={post.starred ? '#20452f' : 'none'}
                          color={post.starred ? '#20452f' : 'currentColor'}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      className={`live-action-icon-btn ${post.read ? 'active' : ''}`}
                      onClick={() => onToggleRead(post)}
                      title={post.read ? 'Mark unread' : 'Mark read'}
                    >
                      <CheckCircle2 size={13} color={post.read ? '#20452f' : 'currentColor'} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
