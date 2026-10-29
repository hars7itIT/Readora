import React, { useState, useMemo } from 'react';
import {
  Rss,
  Plus,
  LoaderCircle,
  X,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronDown,
  List,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Tag,
  PenLine,
  Check,
  Database,
  Image as ImageIcon,
  Type,
  ExternalLink,
  Radio,
  Sparkles
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { ArticleCard } from '../components/articles/ArticleCard';
import { ArticleComments } from '../components/articles/ArticleComments';
import { LiveLinksStream } from '../components/articles/LiveLinksStream';
import { InvalidUrlAlert } from '../components/ui/InvalidUrlAlert';
import { validateFeedUrlInput } from '../utils/urlValidator';
import { sampleFeedSuggestions } from '../lib/sampleFeeds';
import { RECOMMENDATION_TOPICS } from '../features/discovery/recommendationTopics';
import type { Feed, Post } from '../types/index';

interface HomePageProps {
  feeds: Feed[];
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post | null) => void;
  onToggleRead: (post: Post) => void;
  onToggleStar?: (post: Post) => void;
  onSaveNotes?: (post: Post, notes: string) => void;
  onImportSamplePosts?: () => void;
  onImportSamplePhotos?: (limit?: number) => void;
  onRefresh: () => void;
  onAddFeed: (url: string) => Promise<void>;
  notice: string;
  onClearNotice: () => void;
  online: boolean;
  isRefreshing?: boolean;
  onResetToBlogger?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  feeds,
  posts,
  selectedPost,
  onSelectPost,
  onToggleRead,
  onToggleStar,
  onSaveNotes,
  onImportSamplePosts,
  onImportSamplePhotos,
  onRefresh,
  onAddFeed,
  notice,
  onClearNotice,
  online,
  isRefreshing = false,
  onResetToBlogger
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [urlAlert, setUrlAlert] = useState<{
    isOpen: boolean;
    attemptedUrl: string;
    errorMessage: string;
    suggestion?: string;
  }>({
    isOpen: false,
    attemptedUrl: '',
    errorMessage: ''
  });

  // Timeline Filtering & Sorting State
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'unread' | 'saved'>('all');
  const [recommendationTopic, setRecommendationTopic] = useState<string>('all');
  const [recommendationNotice, setRecommendationNotice] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'links'>('links');
  const [isFeedDropdownOpen, setIsFeedDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const handleFollowRecommendedBlog = async (feedUrl: string) => {
    try {
      setRecommendationNotice('Subscribing to blog…');
      await onAddFeed(feedUrl);
      setRecommendationNotice('Subscribed! Feed added to your library.');
      setTimeout(() => setRecommendationNotice(null), 3500);
    } catch (err: any) {
      setRecommendationNotice(err instanceof Error ? err.message : 'Could not add feed.');
      setTimeout(() => setRecommendationNotice(null), 3500);
    }
  };

  const handleRecommendFromActiveArticle = () => {
    if (!selectedPost) return;
    const text = `${selectedPost.title} ${selectedPost.summary} ${selectedPost.feedTitle} ${(selectedPost.tags || []).join(' ')}`.toLowerCase();
    for (const topic of RECOMMENDATION_TOPICS) {
      if (topic.id === 'all') continue;
      if (topic.keywords.some((kw) => text.includes(kw))) {
        setRecommendationTopic(topic.id);
        setFilterType('all');
        setRecommendationNotice(`Auto-detected topic: "${topic.label}" from "${selectedPost.title.slice(0, 28)}…"`);
        setTimeout(() => setRecommendationNotice(null), 4000);
        return;
      }
    }
  };

  const currentTopicObj = useMemo(() => {
    return RECOMMENDATION_TOPICS.find((t) => t.id === recommendationTopic) || RECOMMENDATION_TOPICS[0];
  }, [recommendationTopic]);
  const activeTopicBlogs = currentTopicObj.recommendedBlogs;

  // Reader Customization State (persisted to localStorage)
  const [readerTheme, setReaderTheme] = useState<'paper' | 'sepia' | 'night'>(() => {
    try {
      return (localStorage.getItem('small_reader_theme') as any) || 'paper';
    } catch {
      return 'paper';
    }
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('small_reader_font_size');
      return saved ? Number(saved) : 17;
    } catch {
      return 17;
    }
  });
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [showReaderMoreMenu, setShowReaderMoreMenu] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<boolean>(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState<boolean>(false);
  const [copiedShareNotice, setCopiedShareNotice] = useState<boolean>(false);

  const handleSetTheme = (t: 'paper' | 'sepia' | 'night') => {
    setReaderTheme(t);
    try {
      localStorage.setItem('small_reader_theme', t);
    } catch {}
  };

  const handleSetFontSize = (size: number) => {
    const clamped = Math.max(14, Math.min(26, size));
    setFontSize(clamped);
    try {
      localStorage.setItem('small_reader_font_size', String(clamped));
    } catch {}
  };

  // Sync draft notes whenever selected post changes
  React.useEffect(() => {
    if (selectedPost) {
      setNotesDraft(selectedPost.notes || '');
      setEditingNotes(false);
      setNotesSavedNotice(false);
      setShowReaderMoreMenu(false);
      setShowTypographyMenu(false);
    }
  }, [selectedPost?.id]);

  // Filter & sort articles
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (filterType === 'all') {
      if (recommendationTopic !== 'all') {
        const topicObj = RECOMMENDATION_TOPICS.find((t) => t.id === recommendationTopic);
        if (topicObj && topicObj.keywords.length > 0) {
          result = result.filter((p) => {
            const text = `${p.title} ${p.summary} ${p.feedTitle} ${(p.tags || []).join(' ')}`.toLowerCase();
            return topicObj.keywords.some((kw) => text.includes(kw));
          });
        }
      }
      // Smart recommendation ranking: starred articles, comments engagement, and recency
      result.sort((a, b) => {
        const scoreA = (a.starred ? 100 : 0) + (a.commentCount || 0) * 5;
        const scoreB = (b.starred ? 100 : 0) + (b.commentCount || 0) * 5;
        if (scoreB !== scoreA) return scoreB - scoreA;
        if (sortOrder === 'oldest') return a.publishedAt - b.publishedAt;
        return b.publishedAt - a.publishedAt;
      });
    } else if (filterType === 'popular') {
      result = result.filter(
        (p) =>
          p.starred ||
          (p.tags && p.tags.length >= 2) ||
          p.feedTitle.includes('Buzz') ||
          p.feedTitle.includes('Developers')
      );
    } else if (filterType === 'unread') {
      result = result.filter((p) => !p.read);
    } else if (filterType === 'saved') {
      result = result.filter((p) => p.starred);
    }

    if (feedFilter !== 'all') {
      result = result.filter((p) => p.feedId === feedFilter);
    }

    if (tagFilter) {
      result = result.filter((p) => p.tags && p.tags.includes(tagFilter));
    }

    if (filterType !== 'all') {
      result.sort((a, b) => {
        if (sortOrder === 'newest') return b.publishedAt - a.publishedAt;
        return a.publishedAt - b.publishedAt;
      });
    }

    return result;
  }, [posts, filterType, recommendationTopic, feedFilter, tagFilter, sortOrder]);

  // Set default selected post to first article if none selected on desktop
  React.useEffect(() => {
    if (!selectedPost && filteredPosts.length > 0 && window.innerWidth > 960) {
      onSelectPost(filteredPosts[0]);
    }
  }, [filteredPosts.length]);

  const handleAdd = async (urlToAdd?: string) => {
    const target = urlToAdd ?? inputUrl;
    if (!target.trim() || isAdding) return;

    // Validate URL and detect invalid link attempt
    const validation = validateFeedUrlInput(target);
    if (!validation.valid) {
      setUrlAlert({
        isOpen: true,
        attemptedUrl: target,
        errorMessage: validation.error || 'Invalid URL format.',
        suggestion: validation.suggestion
      });
      return;
    }

    setIsAdding(true);
    try {
      await onAddFeed(validation.cleanUrl || target.trim());
      setInputUrl('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add feed.';
      setUrlAlert({
        isOpen: true,
        attemptedUrl: target,
        errorMessage: msg,
        suggestion: 'Make sure the website address is reachable and has an RSS or Atom feed.'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedPost || !onSaveNotes) return;
    onSaveNotes(selectedPost, notesDraft);
    setEditingNotes(false);
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 3000);
  };

  const handleShareArticle = async () => {
    if (!selectedPost) return;
    const url = selectedPost.link && !selectedPost.link.startsWith('local://') ? selectedPost.link : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedPost.title,
          text: selectedPost.summary,
          url
        });
        return;
      } catch {
        // Fallback to clipboard if share was cancelled or failed
      }
    }
    navigator.clipboard?.writeText(url);
    setCopiedShareNotice(true);
    setTimeout(() => setCopiedShareNotice(false), 2500);
  };

  const activeFeedLabel =
    feedFilter === 'all'
      ? 'All feeds'
      : feeds.find((f) => f.id === feedFilter)?.title || 'Selected Feed';

  const dateLabel = (stamp: number) =>
    new Date(stamp).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  const activePost = selectedPost || filteredPosts[0];

  return (
    <div className="editorial-workspace">
      {/* Notice Banner */}
      {notice && (
        <div className="editorial-notice-banner">
          <span>{notice}</span>
          <button onClick={onClearNotice} aria-label="Close notice">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editorial Workspace Header */}
      <section className="workspace-editorial-header">
        <div className="header-text-block">
          <div className="editorial-eyebrow">YOUR READING SPACE</div>
          <h1 className="editorial-headline">A little more signal.</h1>
          <p className="editorial-subtitle">
            Good writing, in chronological order. You decide what matters.
          </p>
          {onResetToBlogger && (
            <button
              type="button"
              onClick={onResetToBlogger}
              style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eef3eb',
                border: '1px solid #c9d8c6',
                color: '#20452f',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Delete all old posts and sync live Blogger blogs"
            >
              <Radio size={12} className="live-radio-pulse" />
              <span>Sync Blogger API Blogs (Purge Old Posts)</span>
            </button>
          )}
        </div>

        {/* Delicate Botanical Leaf SVG */}
        <div className="editorial-botanical-art" aria-hidden="true">
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
            <path
              d="M10 80C30 55 55 45 105 10C80 40 70 70 40 85C25 83 15 82 10 80Z"
              fill="rgba(56, 106, 75, 0.08)"
            />
            <path
              d="M10 80C40 50 70 30 105 10"
              stroke="#8ba58f"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M45 48C58 40 72 38 80 32"
              stroke="#a2baa5"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M30 62C40 58 55 58 65 52"
              stroke="#a2baa5"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M65 32C78 26 90 24 96 18"
              stroke="#a2baa5"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Panoramic Editorial Landscape Banner */}
        <div className="editorial-landscape-banner">
          <div className="landscape-visual">
            <svg
              className="landscape-svg"
              viewBox="0 0 460 110"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ede5d8" />
                  <stop offset="50%" stopColor="#ebdcd0" />
                  <stop offset="100%" stopColor="#e4d2c2" />
                </linearGradient>
                <radialGradient id="sunGlow" cx="72%" cy="42%" r="35%">
                  <stop offset="0%" stopColor="#fdf6ee" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#f8e5c8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f8e5c8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="460" height="110" fill="url(#skyGrad)" />
              <circle cx="340" cy="45" r="28" fill="url(#sunGlow)" />
              <circle cx="340" cy="45" r="14" fill="#fff" opacity="0.85" />
              {/* Back Mountain Silhouette */}
              <path
                d="M120 110L210 55L270 75L350 48L420 80L460 65V110H120Z"
                fill="#b8a89a"
                opacity="0.45"
              />
              {/* Mid Layer Coast & Lake */}
              <path
                d="M0 110L60 70L150 92L230 78L320 95L460 88V110H0Z"
                fill="#8f8073"
                opacity="0.65"
              />
              {/* Foreground Headland */}
              <path
                d="M0 110L40 75L90 85L130 110H0Z"
                fill="#61564d"
                opacity="0.8"
              />
            </svg>
          </div>
          <div className="landscape-quote">
            <span className="quote-text">&ldquo;A quieter internet is a richer mind.&rdquo;</span>
            <span className="quote-dash">———</span>
          </div>
        </div>
      </section>

      {/* Feeds Empty Onboarding Screen */}
      {feeds.length === 0 && posts.length === 0 ? (
        <div className="editorial-empty-card">
          <div className="empty-badge">
            <Rss size={28} />
          </div>
          <div className="empty-eyebrow">A QUIETER INTERNET</div>
          <h2>Your reading life, on your own terms.</h2>
          <p>
            Add an independent blog or photo album. Your library lives entirely on this device and
            works offline.
          </p>

          <form
            className="empty-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleAdd();
            }}
          >
            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. https://jvns.ca or https://hildegard.org"
            />
            <button type="submit" disabled={isAdding}>
              {isAdding ? <LoaderCircle className="spin" size={15} /> : <Plus size={15} />}
              Subscribe
            </button>
          </form>

          <div className="empty-quick-pills">
            {onResetToBlogger && (
              <button
                type="button"
                className="quick-pill-btn blogger"
                onClick={onResetToBlogger}
                style={{ background: '#20452f', color: '#ffffff', borderColor: '#20452f' }}
                title="Delete all old posts and load Blogger Developers Network, Brett's Test Blawg, and Blogger Buzz"
              >
                <Radio size={13} /> Load Blogger API Blogs (Purge Old Posts)
              </button>
            )}
            {onImportSamplePosts && (
              <button className="quick-pill-btn" onClick={onImportSamplePosts}>
                <Database size={13} /> Load 100 Posts Dataset
              </button>
            )}
            {onImportSamplePhotos && (
              <button className="quick-pill-btn photo" onClick={() => onImportSamplePhotos(50)}>
                <ImageIcon size={13} /> Load Photo Gallery & Albums
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Main Two-Column Reading Workspace */
        <div className="editorial-main-grid">
          {/* Column A: Timeline & Cards (approx 45–48%) */}
          <section className="timeline-column">
            {/* Timeline Filter Toolbar */}
            <div className="timeline-toolbar-panel">
              <div className="toolbar-left-filters">
                <button
                  className={`toolbar-filter-pill ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                  title="Recommended articles"
                >
                  Recommendation
                </button>
                <button
                  className={`toolbar-filter-pill ${filterType === 'popular' ? 'active' : ''}`}
                  onClick={() => setFilterType('popular')}
                  title="Popular & trending posts"
                >
                  Popular Post
                </button>
                <button
                  className={`toolbar-filter-pill ${filterType === 'unread' ? 'active' : ''}`}
                  onClick={() => setFilterType('unread')}
                >
                  Unread
                </button>
                <button
                  className={`toolbar-filter-pill ${filterType === 'saved' ? 'active' : ''}`}
                  onClick={() => setFilterType('saved')}
                >
                  Saved
                </button>
                {tagFilter && (
                  <span className="active-tag-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e2ece1', color: '#20452f', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                    #{tagFilter}
                    <button
                      type="button"
                      onClick={() => setTagFilter(null)}
                      title="Clear tag filter"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#20452f' }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>

              <div className="toolbar-right-controls">
                {/* Feeds Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="toolbar-dropdown-btn"
                    onClick={() => {
                      setIsFeedDropdownOpen(!isFeedDropdownOpen);
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    <span>{activeFeedLabel}</span>
                    <ChevronDown size={13} />
                  </button>

                  {isFeedDropdownOpen && (
                    <div className="toolbar-popover-menu">
                      <button
                        className={`popover-item ${feedFilter === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setFeedFilter('all');
                          setIsFeedDropdownOpen(false);
                        }}
                      >
                        All feeds
                      </button>
                      {feeds.map((feed) => (
                        <button
                          key={feed.id}
                          className={`popover-item ${feedFilter === feed.id ? 'active' : ''}`}
                          onClick={() => {
                            setFeedFilter(feed.id);
                            setIsFeedDropdownOpen(false);
                          }}
                        >
                          {feed.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Order Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="toolbar-dropdown-btn"
                    onClick={() => {
                      setIsSortDropdownOpen(!isSortDropdownOpen);
                      setIsFeedDropdownOpen(false);
                    }}
                  >
                    <span>{sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}</span>
                    <ChevronDown size={13} />
                  </button>

                  {isSortDropdownOpen && (
                    <div className="toolbar-popover-menu">
                      <button
                        className={`popover-item ${sortOrder === 'newest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOrder('newest');
                          setIsSortDropdownOpen(false);
                        }}
                      >
                        Newest first
                      </button>
                      <button
                        className={`popover-item ${sortOrder === 'oldest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOrder('oldest');
                          setIsSortDropdownOpen(false);
                        }}
                      >
                        Oldest first
                      </button>
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="toolbar-view-toggle">
                  <button
                    className={`view-toggle-btn live-links-toggle-btn ${viewMode === 'links' ? 'active' : ''}`}
                    onClick={() => setViewMode('links')}
                    title="Real-time incoming links stream"
                  >
                    <Radio size={12} className={viewMode === 'links' ? 'live-radio-pulse' : ''} />
                    <span className="live-btn-text">Live Links</span>
                  </button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <List size={14} />
                  </button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time recommendation action notice */}
            {recommendationNotice && (
              <div
                style={{
                  background: '#eaf4e8',
                  border: '1px solid #c9dec6',
                  color: '#214e2d',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 0 12px'
                }}
              >
                <Sparkles size={14} />
                <span>{recommendationNotice}</span>
              </div>
            )}

            {/* Smart Topic Recommendation Panel (Active when Recommendation filter is chosen) */}
            {filterType === 'all' && (
              <div
                className="recommendation-topic-panel"
                style={{
                  background: '#f8faf7',
                  border: '1px solid #dee7dc',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  margin: '0 0 16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} color="#2b5f3d" />
                    <strong style={{ fontSize: '13.5px', color: '#1a3c26' }}>
                      Topic Recommendations & Independent Blogs
                    </strong>
                  </div>
                  <span style={{ fontSize: '11px', color: '#68826d', fontWeight: 500 }}>
                    Auto-filtered by reading overlap & tags
                  </span>
                </div>

                {/* Topic selector pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {RECOMMENDATION_TOPICS.map((topic) => {
                    const isActive = recommendationTopic === topic.id;
                    const count = topic.id === 'all'
                      ? posts.length
                      : posts.filter((p) => {
                          const text = `${p.title} ${p.summary} ${p.feedTitle} ${(p.tags || []).join(' ')}`.toLowerCase();
                          return topic.keywords.some((kw) => text.includes(kw));
                        }).length;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        className={`toolbar-filter-pill ${isActive ? 'active' : ''}`}
                        onClick={() => setRecommendationTopic(topic.id)}
                        style={{
                          fontSize: '11.5px',
                          padding: '4px 10px',
                          background: isActive ? '#20452f' : '#ffffff',
                          color: isActive ? '#ffffff' : '#334c38',
                          border: '1px solid #d4ded1',
                          borderRadius: '14px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>{topic.icon}</span>
                        <span>{topic.label}</span>
                        <span style={{ fontSize: '10px', opacity: 0.8 }}>({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Recommended Blogs for this Topic */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#3f5a45', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recommended Blogs for &ldquo;{currentTopicObj.label}&rdquo;
                    </span>
                    {activePost && (
                      <button
                        type="button"
                        onClick={handleRecommendFromActiveArticle}
                        style={{
                          background: '#e9f1e7',
                          border: '1px solid #c9d8c6',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          color: '#245233',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Analyze open article to match recommended blogs"
                      >
                        🎯 Auto-match open article topic
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                      gap: '8px'
                    }}
                  >
                    {activeTopicBlogs.map((b) => {
                      const isFollowed = feeds.some(
                        (f) =>
                          f.feedUrl === b.url ||
                          f.feedUrl.toLowerCase().includes(b.domain) ||
                          f.siteUrl.toLowerCase().includes(b.domain)
                      );

                      return (
                        <div
                          key={b.url}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e1e9df',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '12px', color: '#1e3827' }}>{b.title}</strong>
                              <span style={{ fontSize: '9.5px', background: '#eaf2e8', color: '#275237', padding: '1px 5px', borderRadius: '4px' }}>
                                {b.category}
                              </span>
                            </div>
                            <p style={{ fontSize: '11px', color: '#5f7362', margin: '0 0 8px', lineHeight: 1.35 }}>
                              {b.description}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
                            <span style={{ fontSize: '10.5px', color: '#889886' }}>{b.domain}</span>
                            {isFollowed ? (
                              <span style={{ fontSize: '11px', color: '#285838', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Check size={12} /> Following
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleFollowRecommendedBlog(b.url)}
                                style={{
                                  background: '#20452f',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Plus size={11} /> Follow
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Articles List or Real-Time Links Stream */}
            {viewMode === 'links' ? (
              <LiveLinksStream
                posts={filteredPosts}
                selectedPost={activePost}
                onSelectPost={(p) => onSelectPost(p)}
                onToggleRead={onToggleRead}
                onToggleStar={onToggleStar}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
              />
            ) : (
              <div className={`timeline-articles-container ${viewMode}`}>
                {filteredPosts.length === 0 ? (
                  <div className="timeline-empty-message">
                    <p>No articles found for the selected filter.</p>
                    <button
                      className="secondary-button"
                      style={{ fontSize: '11px', marginTop: '6px' }}
                      onClick={() => {
                        setFilterType('all');
                        setFeedFilter('all');
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      isSelected={activePost?.id === post.id}
                      onSelect={(p) => onSelectPost(p)}
                      onToggleRead={onToggleRead}
                      onToggleStar={onToggleStar}
                      onSelectTag={(t) => setTagFilter(t)}
                    />
                  ))
                )}
              </div>
            )}
          </section>

          {/* Column B: Selected Article Reader (approx 52–55%) */}
          <section className="reader-column">
            {activePost ? (
              <article className={`editorial-reader-card theme-${readerTheme}`}>
                {/* Reader Toolbar */}
                <div className="reader-card-toolbar">
                  <button
                    className="reader-back-btn"
                    onClick={() => onSelectPost(null)}
                    title="Return to full timeline view"
                  >
                    ← Back to all articles
                  </button>

                  <div className="reader-toolbar-actions">
                    {onToggleStar && (
                      <button
                        className={`reader-tool-action-btn ${activePost.starred ? 'active' : ''}`}
                        onClick={() => onToggleStar(activePost)}
                        title={activePost.starred ? 'Saved' : 'Save article'}
                      >
                        <Bookmark
                          size={14}
                          fill={activePost.starred ? '#20452f' : 'none'}
                          color={activePost.starred ? '#20452f' : 'currentColor'}
                        />
                        <span>{activePost.starred ? 'Saved' : 'Save'}</span>
                      </button>
                    )}

                    <button
                      className="reader-tool-action-btn"
                      onClick={() => onToggleRead(activePost)}
                      title={activePost.read ? 'Mark unread' : 'Mark read'}
                    >
                      <CheckCircle2 size={14} color={activePost.read ? '#20452f' : 'currentColor'} />
                      <span>{activePost.read ? 'Mark unread' : 'Mark read'}</span>
                    </button>

                    {/* Typography & Theme Popover */}
                    <div style={{ position: 'relative' }}>
                      <button
                        className="reader-tool-action-btn"
                        onClick={() => setShowTypographyMenu(!showTypographyMenu)}
                        title="Reading themes & typography"
                      >
                        <Type size={14} />
                        <span>Aa</span>
                      </button>

                      {showTypographyMenu && (
                        <div className="reader-typography-popover">
                          <div className="popover-title">Reading Theme</div>
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

                          <div className="popover-title" style={{ marginTop: '12px' }}>Text Size</div>
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
                              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                            >
                              A+
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      className="reader-tool-icon-btn"
                      onClick={handleShareArticle}
                      title="Share / copy link"
                    >
                      <Share2 size={14} />
                    </button>

                    <div style={{ position: 'relative' }}>
                      <button
                        className="reader-tool-icon-btn"
                        title="More options"
                        onClick={() => setShowReaderMoreMenu(!showReaderMoreMenu)}
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {showReaderMoreMenu && (
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
                              void handleShareArticle();
                              setShowReaderMoreMenu(false);
                            }}
                            style={{ width: '100%', textAlign: 'left', fontSize: '12px', padding: '6px 10px', display: 'flex', gap: '6px', alignItems: 'center' }}
                          >
                            <Share2 size={13} /> Copy link
                          </button>
                          {activePost.link && !activePost.link.startsWith('local://') && (
                            <a
                              href={activePost.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="menu-link-btn"
                              onClick={() => setShowReaderMoreMenu(false)}
                              style={{ width: '100%', textAlign: 'left', fontSize: '12px', padding: '6px 10px', display: 'flex', gap: '6px', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                            >
                              <ExternalLink size={13} /> Open original site
                            </a>
                          )}
                          <button
                            type="button"
                            className="menu-link-btn"
                            onClick={() => {
                              onToggleRead(activePost);
                              setShowReaderMoreMenu(false);
                            }}
                            style={{ width: '100%', textAlign: 'left', fontSize: '12px', padding: '6px 10px', display: 'flex', gap: '6px', alignItems: 'center' }}
                          >
                            <CheckCircle2 size={13} /> {activePost.read ? 'Mark unread' : 'Mark read'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {copiedShareNotice && (
                  <div className="reader-toast-notice">
                    <Check size={13} /> Link copied to clipboard
                  </div>
                )}

                {/* Article Header */}
                <div className="reader-article-header">
                  <div className="reader-header-category">
                    {activePost.feedTitle.toUpperCase()}
                  </div>

                  <h1 className="reader-article-title">{activePost.title}</h1>

                  {/* Byline */}
                  <div className="reader-article-byline">
                    <span className="byline-avatar">
                      {(activePost.author || 'A').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="byline-name">{activePost.author || 'Independent writer'}</span>
                    {activePost.authorUsername && (
                      <span className="byline-handle">@{activePost.authorUsername}</span>
                    )}
                    <span className="byline-dot">·</span>
                    <span className="byline-date">{dateLabel(activePost.publishedAt)}</span>
                    <span className="byline-dot">·</span>
                    <span className="byline-time">
                      <Clock size={11} /> {activePost.readingTimeMinutes || 1} min read
                    </span>
                  </div>

                  {/* Tags */}
                  {activePost.tags && activePost.tags.length > 0 && (
                    <div className="reader-header-tags">
                      {activePost.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="reader-tag-chip clickable"
                          title={`Filter timeline by #${tag}`}
                          onClick={() => setTagFilter(tag)}
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cover / Hero Image */}
                  {(activePost.imageUrl || activePost.thumbnailUrl) && (
                    <div className="reader-hero-cover-wrap">
                      <img
                        src={activePost.imageUrl || activePost.thumbnailUrl}
                        alt={activePost.title}
                        className="reader-hero-cover-img"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {/* Article Body Content */}
                <div
                  className="reader-article-body"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      activePost.articleHtml || activePost.contentHtml || `<p>${activePost.summary}</p>`,
                      { USE_PROFILES: { html: true } }
                    )
                  }}
                />

                {/* Personal Notes Card */}
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
                        placeholder="Write your notes, highlights, or quotes from this piece..."
                        rows={4}
                        className="notes-textarea"
                        autoFocus
                      />
                      <div className="notes-actions-row">
                        <button
                          className="secondary-button"
                          style={{ fontSize: '10px', padding: '4px 8px' }}
                          onClick={() => {
                            setNotesDraft(activePost.notes || '');
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
                      {activePost.notes ? (
                        <p className="notes-content">{activePost.notes}</p>
                      ) : (
                        <p className="notes-placeholder">
                          No notes on this article yet. Click below to jot down your thoughts.
                        </p>
                      )}
                      <button
                        className="secondary-button"
                        style={{ marginTop: '8px', fontSize: '10px', padding: '4px 8px' }}
                        onClick={() => setEditingNotes(true)}
                      >
                        {activePost.notes ? 'Edit Notes' : '+ Add Note'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Reader Comments & Discussion */}
                <ArticleComments postId={activePost.id} />
              </article>
            ) : (
              <div className="reader-empty-select-card">
                <h3>Select an article</h3>
                <p>Choose any article or photo from your timeline to read it here.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Invalid URL Alert Modal Dialog */}
      <InvalidUrlAlert
        isOpen={urlAlert.isOpen}
        onClose={() => setUrlAlert((prev) => ({ ...prev, isOpen: false }))}
        attemptedUrl={urlAlert.attemptedUrl}
        errorMessage={urlAlert.errorMessage}
        suggestion={urlAlert.suggestion}
      />
    </div>
  );
};
