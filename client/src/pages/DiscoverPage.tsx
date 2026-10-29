import React, { useState, useMemo } from 'react';
import { Compass, Plus, LoaderCircle, Search, X, Check, Award, Network } from 'lucide-react';
import { SharingConsent } from '../components/discovery/SharingConsent';
import { DiscoveryCard } from '../components/discovery/DiscoveryCard';
import { BlogsGraphView } from '../components/discovery/BlogsGraphView';
import { SeedTrapModal } from '../components/discovery/SeedTrapModal';
import { InvalidUrlAlert } from '../components/ui/InvalidUrlAlert';
import { validateFeedUrlInput } from '../utils/urlValidator';
import type { DiscoveryFeed, Feed } from '../types/index';

interface DiscoverPageProps {
  popular: DiscoveryFeed[];
  recommendations: DiscoveryFeed[];
  feeds: Feed[];
  consent: boolean;
  onConsentChange: (enabled: boolean) => void;
  onShare: () => void;
  isSharing: boolean;
  onAddFeed: (url: string) => Promise<void>;
  error: string;
}

const CATEGORIES = [
  'All',
  'Tech & Code',
  'Design & Web',
  'Science',
  'News & Media',
  'Essays & Culture'
] as const;

function getFeedCategory(title: string, url: string): string {
  const t = (title + ' ' + url).toLowerCase();
  if (t.includes('hack') || t.includes('code') || t.includes('github') || t.includes('pragmatic') || t.includes('cloudflare') || t.includes('blogger')) {
    return 'Tech & Code';
  }
  if (t.includes('css') || t.includes('smashing') || t.includes('design') || t.includes('web')) {
    return 'Design & Web';
  }
  if (t.includes('nasa') || t.includes('science') || t.includes('ars')) {
    return 'Science';
  }
  if (t.includes('news') || t.includes('npr') || t.includes('verge')) {
    return 'News & Media';
  }
  return 'Essays & Culture';
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  popular,
  recommendations,
  feeds,
  consent,
  onConsentChange,
  onShare,
  isSharing,
  onAddFeed,
  error
}) => {
  const [feedInput, setFeedInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showSeedTrapModal, setShowSeedTrapModal] = useState<boolean>(false);
  const [discoverViewMode, setDiscoverViewMode] = useState<'cards' | 'graph'>('cards');
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

  const handleAdd = async (url?: string) => {
    const target = url ?? feedInput;
    if (!target.trim() || isAdding) return;

    // Validate link before submission
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
    setActionNotice(null);
    try {
      await onAddFeed(validation.cleanUrl || target.trim());
      setFeedInput('');
      setActionNotice('Successfully subscribed!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to subscribe.';
      setActionNotice(msg);
      setUrlAlert({
        isOpen: true,
        attemptedUrl: target,
        errorMessage: msg,
        suggestion: 'Ensure the link points to a live website or valid RSS/Atom feed.'
      });
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsAdding(false);
    }
  };

  const filterFeeds = (items: DiscoveryFeed[]) => {
    return items.filter((item) => {
      const query = searchFilter.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        (item.reason && item.reason.toLowerCase().includes(query));

      const category = getFeedCategory(item.title, item.url);
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const filteredPopular = useMemo(() => filterFeeds(popular), [popular, searchFilter, selectedCategory]);
  const filteredRecommendations = useMemo(() => filterFeeds(recommendations), [recommendations, searchFilter, selectedCategory]);

  return (
    <section className="content discover-page">
      <div className="eyebrow">
        <Compass size={14} /> THE OPEN WEB
      </div>
      <h1>
        Find your next
        <br />
        <em>rabbit hole.</em>
      </h1>
      <p className="page-intro">
        Discover independent voices through the reading habits of the community — not engagement algorithms.
      </p>

      {/* Bonus Quest Inspector Banner & Graph Switcher */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '16px 0 24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setShowSeedTrapModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            color: '#92400e',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)'
          }}
          title="Inspect the deliberate trap detected in the seed list and claim 10 bonus points"
        >
          <Award size={15} color="#d97706" />
          <span>Bonus Quest: Audit Seed Trap (+10 Extra Pts)</span>
        </button>

        <div style={{ display: 'inline-flex', border: '1px solid #c9d8c6', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            type="button"
            className={`view-toggle-btn ${discoverViewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setDiscoverViewMode('cards')}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              background: discoverViewMode === 'cards' ? '#20452f' : '#ffffff',
              color: discoverViewMode === 'cards' ? '#ffffff' : '#20452f',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Grid Cards View
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${discoverViewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setDiscoverViewMode('graph')}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              background: discoverViewMode === 'graph' ? '#20452f' : '#ffffff',
              color: discoverViewMode === 'graph' ? '#ffffff' : '#20452f',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Network size={13} />
            <span>&ldquo;Blogs Like This&rdquo; Graph</span>
          </button>
        </div>
      </div>

      {/* Conditionally Render Blogs Like This Interactive Network Graph */}
      {discoverViewMode === 'graph' && (
        <BlogsGraphView
          onSelectFeed={(u) => void handleAdd(u)}
          followedUrls={new Set(feeds.map((f) => f.feedUrl))}
        />
      )}

      {actionNotice && (
        <div className="auth-alert success" style={{ marginBottom: '16px' }}>
          <Check size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="add-panel">
        <div className="add-icon">
          <Plus size={20} />
        </div>
        <div className="add-copy">
          <strong>Know a good blog?</strong>
          <span>Add any website or direct RSS/Atom feed.</span>
        </div>
        <form
          className="add-form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleAdd();
          }}
        >
          <input
            value={feedInput}
            onChange={(e) => setFeedInput(e.target.value)}
            placeholder="Paste a website or feed URL…"
          />
          <button type="submit" disabled={isAdding || !feedInput.trim()}>
            {isAdding ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />} Add feed
          </button>
        </form>
      </div>

      <SharingConsent
        consent={consent}
        onConsentChange={onConsentChange}
        onShare={onShare}
        isSharing={isSharing}
        hasFeeds={feeds.length > 0}
      />

      {error && <div className="notice error-notice">{error}</div>}

      {/* Discovery Search and Category Filter Toolbar */}
      <div style={{ margin: '32px 0 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#778877' }} />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter discovery commons by name or topic…"
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '9999px',
                border: '1px solid #dfe8dc',
                background: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#778877' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`toolbar-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ padding: '5px 14px', fontSize: '12px' }}
            >
              {cat}
            </button>
          ))}
          {(selectedCategory !== 'All' || searchFilter) && (
            <button
              type="button"
              className="toolbar-filter-pill"
              onClick={() => {
                setSelectedCategory('All');
                setSearchFilter('');
              }}
              style={{ padding: '5px 12px', fontSize: '11px', color: '#884433' }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="section-heading">
        <div>
          <div className="eyebrow">COMMUNITY SIGNALS</div>
          <h2>Popular in the commons ({filteredPopular.length})</h2>
        </div>
        <span className="section-note">Seeded demo data + opt-in aggregates</span>
      </div>

      {filteredPopular.length > 0 ? (
        <div className="discover-grid">
          {filteredPopular.map((item, i) => (
            <DiscoveryCard
              key={item.url}
              item={item}
              index={i}
              onAdd={(it) => void handleAdd(it.url)}
              followed={feeds.some((f) => f.feedUrl === item.url)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-discover" style={{ padding: '30px', textAlign: 'center' }}>
          <p>No popular feeds match your filter.</p>
        </div>
      )}

      <div className="section-heading recommendation-heading" style={{ marginTop: '40px' }}>
        <div>
          <div className="eyebrow">BASED ON OVERLAP</div>
          <h2>Worth a closer look ({filteredRecommendations.length})</h2>
        </div>
      </div>

      {filteredRecommendations.length > 0 ? (
        <div className="discover-grid">
          {filteredRecommendations.map((item, i) => (
            <DiscoveryCard
              key={item.url}
              item={item}
              index={i}
              onAdd={(it) => void handleAdd(it.url)}
              followed={feeds.some((f) => f.feedUrl === item.url)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-discover">
          <Compass size={25} />
          <p>Add subscriptions to get recommendations based on feeds followed together.</p>
        </div>
      )}

      {/* Bonus Quest Seed Trap Modal */}
      <SeedTrapModal
        isOpen={showSeedTrapModal}
        onClose={() => setShowSeedTrapModal(false)}
      />

      {/* Invalid URL Alert Modal */}
      <InvalidUrlAlert
        isOpen={urlAlert.isOpen}
        onClose={() => setUrlAlert(prev => ({ ...prev, isOpen: false }))}
        attemptedUrl={urlAlert.attemptedUrl}
        errorMessage={urlAlert.errorMessage}
        suggestion={urlAlert.suggestion}
      />
    </section>
  );
};
