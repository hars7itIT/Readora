import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, Clock, MoreHorizontal, Check, ExternalLink, Share2 } from 'lucide-react';
import type { Post } from '../../types/index';

interface ArticleCardProps {
  post: Post;
  isSelected: boolean;
  onSelect: (post: Post) => void;
  onToggleRead: (post: Post) => void;
  onToggleStar?: (post: Post) => void;
  onSelectTag?: (tag: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  isSelected,
  onSelect,
  onToggleRead,
  onToggleStar,
  onSelectTag
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close card menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showMenu]);

  // Deterministic fallback thumbnail for cards without an explicit thumbnail
  const getThumbnailUrl = () => {
    if (post.thumbnailUrl) return post.thumbnailUrl;
    if (post.imageUrl) return post.imageUrl;
    let hash = 0;
    for (let i = 0; i < post.title.length; i++) hash = post.title.charCodeAt(i) + ((hash << 5) - hash);
    const seed = (Math.abs(hash) % 50) + 1;
    return `https://picsum.photos/seed/${seed}/320/220`;
  };

  const dateLabel = new Date(post.publishedAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short'
  });

  const readingTime = post.readingTimeMinutes || 1;
  const tags = post.tags && post.tags.length > 0 ? post.tags.slice(0, 3) : ['writing', 'independent'];

  const handleCopyLink = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = post.link && !post.link.startsWith('local://') ? post.link : window.location.href;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  return (
    <article
      className={`editorial-article-card ${isSelected ? 'selected' : ''} ${post.read ? 'read' : 'unread'}`}
      onClick={() => onSelect(post)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(post);
      }}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Left Thumbnail */}
      <div className="card-thumbnail-wrap">
        <img
          src={getThumbnailUrl()}
          alt={post.title}
          loading="lazy"
          className="card-thumbnail-img"
        />
      </div>

      {/* Right Content */}
      <div className="card-body-content">
        {/* Header Metadata */}
        <div className="card-meta-line">
          <span className="card-source-title">{post.feedTitle}</span>
          <span className="meta-dot">·</span>
          <span className="card-date">{dateLabel}</span>
          <span className="meta-dot">·</span>
          <span className="card-reading-time">
            <Clock size={11} /> {readingTime} min
          </span>

          {!post.read && <span className="card-unread-indicator" title="Unread article" />}
        </div>

        {/* Title */}
        <h3 className="card-headline">{post.title}</h3>

        {/* Excerpt */}
        <p className="card-excerpt">
          {post.summary || 'Click to read this full independent piece in distraction-free reader mode.'}
        </p>

        {/* Direct Link Row for instant external access */}
        {post.link && !post.link.startsWith('local://') && (
          <div className="card-direct-link-row" onClick={(e) => e.stopPropagation()}>
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card-direct-link-anchor"
              title={`Direct link: ${post.link}`}
            >
              <ExternalLink size={11} className="card-link-icon" />
              <span className="card-link-url">{post.link}</span>
            </a>
            <button
              type="button"
              className={`card-quick-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              title={copied ? 'Copied to clipboard!' : 'Copy direct link'}
            >
              {copied ? <Check size={11} /> : <Share2 size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Footer: Tags and Actions */}
        <div className="card-footer-row">
          <div className="card-tags-list">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="card-tag-pill clickable"
                title={`Filter articles by #${tag}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="card-actions-group" onClick={(e) => e.stopPropagation()}>
            {onToggleStar && (
              <button
                className={`card-action-btn ${post.starred ? 'active' : ''}`}
                title={post.starred ? 'Saved to library' : 'Save article'}
                onClick={() => onToggleStar(post)}
                aria-label={post.starred ? 'Saved' : 'Save'}
              >
                <Bookmark
                  size={14}
                  fill={post.starred ? '#20452f' : 'none'}
                  color={post.starred ? '#20452f' : 'currentColor'}
                />
              </button>
            )}

            <button
              className={`card-action-btn ${post.read ? 'active' : ''}`}
              title={post.read ? 'Mark unread' : 'Mark as read'}
              onClick={() => onToggleRead(post)}
              aria-label={post.read ? 'Mark unread' : 'Mark read'}
            >
              <Check size={14} color={post.read ? '#20452f' : 'currentColor'} />
            </button>

            {/* More Options Dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                className="card-action-btn"
                title="More actions"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="More actions"
              >
                <MoreHorizontal size={15} />
              </button>

              {showMenu && (
                <div
                  className="card-popover-menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '100%',
                    marginBottom: '4px',
                    background: '#ffffff',
                    border: '1px solid #dfe8dc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 20,
                    minWidth: '160px',
                    padding: '4px'
                  }}
                >
                  <button
                    type="button"
                    className="menu-link-btn"
                    onClick={handleCopyLink}
                    style={{ width: '100%', textAlign: 'left', fontSize: '12px', padding: '6px 10px', display: 'flex', gap: '6px', alignItems: 'center' }}
                  >
                    <Share2 size={13} /> Copy link
                  </button>
                  {post.link && !post.link.startsWith('local://') && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-link-btn"
                      onClick={() => setShowMenu(false)}
                      style={{ width: '100%', textAlign: 'left', fontSize: '12px', padding: '6px 10px', display: 'flex', gap: '6px', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                    >
                      <ExternalLink size={13} /> Open external site
                    </a>
                  )}
                  <button
                    type="button"
                    className="menu-link-btn"
                    onClick={() => {
                      onToggleRead(post);
                      setShowMenu(false);
                    }}
                    style={{ width: '100%', textAlign: 'left', fontSize: '12px', padding: '6px 10px', display: 'flex', gap: '6px', alignItems: 'center' }}
                  >
                    <Check size={13} /> {post.read ? 'Mark as unread' : 'Mark as read'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
