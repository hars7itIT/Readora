import React, { useState, useEffect, useRef } from 'react';
import {
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Download,
  Clock,
  Tag,
  PenLine,
  Check,
  CheckCircle2,
  Share2,
  MoreHorizontal,
  Type
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { ArticleComments } from '../components/articles/ArticleComments';
import type { Post } from '../types/index';

interface ReaderPageProps {
  post: Post | null;
  onBack: () => void;
  onToggleRead: (post: Post) => void;
  onToggleStar?: (post: Post) => void;
  onSaveNotes?: (post: Post, notes: string) => void;
  onLoadFullText: (post: Post) => void;
  online: boolean;
  onSelectTag?: (tag: string) => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  post,
  onBack,
  onToggleRead,
  onToggleStar,
  onSaveNotes,
  onLoadFullText,
  online,
  onSelectTag
}) => {
  const [readerTheme, setReaderTheme] = useState<'paper' | 'sepia' | 'night'>(() => {
    const saved = localStorage.getItem('small-reader-theme');
    return saved === 'sepia' || saved === 'night' ? saved : 'paper';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('small-reader-font-size');
    const parsed = saved ? parseInt(saved, 10) : 18;
    return isNaN(parsed) ? 18 : parsed;
  });
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const typoMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('small-reader-theme', readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    localStorage.setItem('small-reader-font-size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typoMenuRef.current && !typoMenuRef.current.contains(e.target as Node)) {
        setShowTypographyMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTypographyMenu(false);
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (post) {
      setNotesDraft(post.notes || '');
      setEditingNotes(false);
      setNotesSavedNotice(false);
    }
  }, [post?.id]);

  if (!post) {
    return (
      <section className="editorial-content-box">
        <div className="reader-empty-select-card">
          <h3>No article selected</h3>
          <p>Choose an article from your timeline to read.</p>
          <button className="secondary-button" onClick={onBack}>
            ← Go to timeline
          </button>
        </div>
      </section>
    );
  }

  const handleSaveNotes = () => {
    if (!onSaveNotes) return;
    onSaveNotes(post, notesDraft);
    setEditingNotes(false);
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 3000);
  };

  const handleShare = async () => {
    const shareUrl = post.link || window.location.href;
    const shareData = {
      title: post.title,
      text: post.summary || post.title,
      url: shareUrl
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fall back to clipboard if cancelled or rejected
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  const dateLabel = new Date(post.publishedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <section className="editorial-content-box">
      <article className={`editorial-reader-card standalone theme-${readerTheme}`}>
        {/* Reader Toolbar */}
        <div className="reader-card-toolbar">
          <button className="reader-back-btn" onClick={onBack}>
            ← Back to all articles
          </button>

          <div className="reader-toolbar-actions">
            {onToggleStar && (
              <button
                className={`reader-tool-action-btn ${post.starred ? 'active' : ''}`}
                onClick={() => onToggleStar(post)}
                title={post.starred ? 'Saved' : 'Save article'}
              >
                <Bookmark
                  size={14}
                  fill={post.starred ? '#20452f' : 'none'}
                  color={post.starred ? '#20452f' : 'currentColor'}
                />
                <span>{post.starred ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              className="reader-tool-action-btn"
              onClick={() => onToggleRead(post)}
              title={post.read ? 'Mark unread' : 'Mark read'}
            >
              <CheckCircle2 size={14} color={post.read ? '#20452f' : 'currentColor'} />
              <span>{post.read ? 'Mark unread' : 'Mark read'}</span>
            </button>

            {/* Typography Popover */}
            <div style={{ position: 'relative' }} ref={typoMenuRef}>
              <button
                className="reader-tool-action-btn"
                onClick={() => setShowTypographyMenu(!showTypographyMenu)}
                title="Reading theme & text size"
                aria-expanded={showTypographyMenu}
              >
                <Type size={14} />
                <span>Aa</span>
              </button>

              {showTypographyMenu && (
                <div className="reader-typography-popover">
                  <div className="popover-title">Theme</div>
                  <div className="theme-toggle-pills">
                    <button
                      className={`theme-pill paper ${readerTheme === 'paper' ? 'active' : ''}`}
                      onClick={() => setReaderTheme('paper')}
                    >
                      Paper
                    </button>
                    <button
                      className={`theme-pill sepia ${readerTheme === 'sepia' ? 'active' : ''}`}
                      onClick={() => setReaderTheme('sepia')}
                    >
                      Sepia
                    </button>
                    <button
                      className={`theme-pill night ${readerTheme === 'night' ? 'active' : ''}`}
                      onClick={() => setReaderTheme('night')}
                    >
                      Dark
                    </button>
                  </div>

                  <div className="popover-title" style={{ marginTop: '12px' }}>Font Size</div>
                  <div className="size-toggle-row">
                    <button
                      className="size-btn"
                      onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                    >
                      A-
                    </button>
                    <span style={{ fontSize: '11px', color: '#687766' }}>{fontSize}px</span>
                    <button
                      className="size-btn"
                      onClick={() => setFontSize(Math.min(26, fontSize + 1))}
                    >
                      A+
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="reader-tool-icon-btn"
              onClick={handleShare}
              title="Share link"
            >
              <Share2 size={14} />
            </button>

            {/* More Options Popover */}
            <div style={{ position: 'relative' }} ref={moreMenuRef}>
              <button
                className="reader-tool-icon-btn"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                title="More options"
                aria-expanded={showMoreMenu}
              >
                <MoreHorizontal size={14} />
              </button>

              {showMoreMenu && (
                <div
                  className="card-popover-menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '6px',
                    background: '#ffffff',
                    border: '1px solid #dfe8dc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 30,
                    minWidth: '180px',
                    padding: '6px'
                  }}
                >
                  <button
                    type="button"
                    className="menu-link-btn"
                    onClick={() => {
                      void handleShare();
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '12px',
                      padding: '6px 10px',
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center'
                    }}
                  >
                    <Share2 size={13} /> Copy link
                  </button>
                  {post.link && !post.link.startsWith('local://') && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-link-btn"
                      onClick={() => setShowMoreMenu(false)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '12px',
                        padding: '6px 10px',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <ExternalLink size={13} /> Open original site
                    </a>
                  )}
                  <button
                    type="button"
                    className="menu-link-btn"
                    onClick={() => {
                      onToggleRead(post);
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '12px',
                      padding: '6px 10px',
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center'
                    }}
                  >
                    <CheckCircle2 size={13} />
                    {post.read ? 'Mark unread' : 'Mark as read'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {copiedNotice && (
          <div className="reader-toast-notice">
            <Check size={13} /> Link copied to clipboard
          </div>
        )}

        {/* Article Header */}
        <div className="reader-article-header">
          <div className="reader-header-category">
            {post.feedTitle.toUpperCase()}
          </div>

          <h1 className="reader-article-title">{post.title}</h1>

          {/* Byline */}
          <div className="reader-article-byline">
            <span className="byline-avatar">
              {(post.author || 'A').slice(0, 1).toUpperCase()}
            </span>
            <span className="byline-name">{post.author || 'Independent writer'}</span>
            {post.authorUsername && (
              <span className="byline-handle">@{post.authorUsername}</span>
            )}
            <span className="byline-dot">·</span>
            <span className="byline-date">{dateLabel}</span>
            <span className="byline-dot">·</span>
            <span className="byline-time">
              <Clock size={11} /> {post.readingTimeMinutes || 1} min read
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="reader-header-tags">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="reader-tag-chip"
                  onClick={() => (onSelectTag ? onSelectTag(tag) : onBack())}
                  style={{ cursor: 'pointer', border: 'none' }}
                  title={`Filter articles by #${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Hero Cover Image */}
          {(post.imageUrl || post.thumbnailUrl) && (
            <div className="reader-hero-cover-wrap">
              <img
                src={post.imageUrl || post.thumbnailUrl}
                alt={post.title}
                className="reader-hero-cover-img"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Article Body */}
        {post.articleHtml || post.contentHtml ? (
          <div
            className="reader-article-body"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.articleHtml || post.contentHtml || '', {
                USE_PROFILES: { html: true }
              })
            }}
          />
        ) : (
          <div className="reader-article-body" style={{ fontSize: `${fontSize}px` }}>
            <p>
              {post.summary ||
                'Full text is not cached yet. Connect to the internet and click below to load it.'}
            </p>
            {online && (
              <button className="secondary-button" onClick={() => onLoadFullText(post)}>
                <Download size={14} /> Fetch Full Text
              </button>
            )}
          </div>
        )}

        {/* Personal Notes Section */}
        <div className="reader-personal-notes-card">
          <div className="notes-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PenLine size={13} color="#20452f" />
              <strong>Personal Notes & Highlights</strong>
            </div>
            {notesSavedNotice && (
              <span className="notes-saved-badge">
                <Check size={12} /> Saved locally
              </span>
            )}
          </div>

          {editingNotes ? (
            <div>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Write your personal notes on this piece..."
                rows={4}
                className="notes-textarea"
                autoFocus
              />
              <div className="notes-actions-row">
                <button
                  className="secondary-button"
                  style={{ fontSize: '10px', padding: '4px 8px' }}
                  onClick={() => {
                    setNotesDraft(post.notes || '');
                    setEditingNotes(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="secondary-button"
                  style={{
                    fontSize: '10px',
                    padding: '4px 12px',
                    background: '#20452f',
                    color: '#fff',
                    borderColor: '#20452f'
                  }}
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </button>
              </div>
            </div>
          ) : (
            <div>
              {post.notes ? (
                <p className="notes-content">{post.notes}</p>
              ) : (
                <p className="notes-placeholder">
                  No personal notes yet. Click below to add your thoughts.
                </p>
              )}
              <button
                className="secondary-button"
                style={{ marginTop: '8px', fontSize: '10px', padding: '4px 8px' }}
                onClick={() => setEditingNotes(true)}
              >
                {post.notes ? 'Edit Notes' : '+ Add Note'}
              </button>
            </div>
          )}
        </div>

        {/* Reader Comments & Discussion */}
        <ArticleComments postId={post.id} />

        <div className="reader-card-endnote">
          <ShieldCheck size={16} />
          <span>
            Article content is sanitized and isolated. All text, reading state, and notes remain on your device.
          </span>
        </div>
      </article>
    </section>
  );
};
