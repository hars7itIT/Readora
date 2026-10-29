import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Database,
  Shield,
  Palette,
  Type,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Radio
} from 'lucide-react';
import { clearAllLocalCache } from '../features/offline/cacheService';
import { bloggerService } from '../features/blogger/bloggerService';
import { useAuth } from '../context/AuthContext';
import type { PageView } from '../types/index';

interface SettingsPageProps {
  onCacheCleared: () => void;
  onNavigate?: (page: PageView) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onCacheCleared, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [cleared, setCleared] = useState(false);
  const [bloggerNotice, setBloggerNotice] = useState<string>('');
  const [showClearModal, setShowClearModal] = useState(false);

  const handleBloggerReset = async () => {
    try {
      const res = await bloggerService.clearAllPostsAndLoadBlogger();
      onCacheCleared();
      setBloggerNotice(`Deleted ${res.clearedPostsCount} old posts. Loaded ${res.loadedPostsCount} real-time Blogger links across ${res.loadedFeedsCount} blogs!`);
      setTimeout(() => setBloggerNotice(''), 5000);
    } catch {
      setBloggerNotice('Failed to reset to Blogger blogs.');
    }
  };

  // Settings state persisted to localStorage
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'night'>(() => {
    try {
      return (localStorage.getItem('small_reader_theme') as any) || 'paper';
    } catch {
      return 'paper';
    }
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('small_reader_font_size');
      return saved ? Number(saved) : 18;
    } catch {
      return 18;
    }
  });

  const [refreshInterval, setRefreshInterval] = useState<string>(() => {
    try {
      return localStorage.getItem('small_reader_refresh_interval') || 'manual';
    } catch {
      return 'manual';
    }
  });

  const [offlinePrecache, setOfflinePrecache] = useState<boolean>(() => {
    try {
      return localStorage.getItem('small_reader_precache') === 'true';
    } catch {
      return false;
    }
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const showSaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleThemeChange = (newTheme: 'paper' | 'sepia' | 'night') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('small_reader_theme', newTheme);
      showSaved(`Theme changed to ${newTheme.toUpperCase()}`);
    } catch {}
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    try {
      localStorage.setItem('small_reader_font_size', String(size));
      showSaved(`Reader text size set to ${size}px`);
    } catch {}
  };

  const handleRefreshIntervalChange = (val: string) => {
    setRefreshInterval(val);
    try {
      localStorage.setItem('small_reader_refresh_interval', val);
      showSaved(`Auto-refresh set to ${val}`);
    } catch {}
  };

  const handlePrecacheToggle = (enabled: boolean) => {
    setOfflinePrecache(enabled);
    try {
      localStorage.setItem('small_reader_precache', String(enabled));
      showSaved(enabled ? 'Offline article pre-caching enabled' : 'Offline pre-caching disabled');
    } catch {}
  };

  const handleClearCache = async () => {
    await clearAllLocalCache();
    setCleared(true);
    setShowClearModal(false);
    onCacheCleared();
    setTimeout(() => setCleared(false), 4000);
  };

  return (
    <section className="content">
      <div className="list-heading">
        <div>
          <div className="eyebrow">PREFERENCES & PRIVACY</div>
          <h1>Reader Settings</h1>
          <p>Customize your reading appearance, storage, and privacy controls.</p>
        </div>
      </div>

      {savedNotice && (
        <div className="auth-alert success" style={{ marginBottom: '20px', maxWidth: '680px' }}>
          <CheckCircle2 size={16} />
          <span>{savedNotice}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '680px' }}>
        {/* Account / Membership Quick Card */}
        <div className="account-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="card-top-icon" style={{ margin: 0, width: '36px', height: '36px' }}>
                <User size={18} color="#20452f" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px' }}>
                  {isAuthenticated ? (user?.name || user?.email) : 'Anonymous Reader'}
                </h3>
                <span style={{ fontSize: '12px', color: '#6d786c' }}>
                  {isAuthenticated ? 'Authenticated Account' : 'Zero-knowledge · Local-only'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate?.(isAuthenticated ? 'account' : 'login')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{isAuthenticated ? 'Manage Account' : 'Sign In'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Reading Appearance */}
        <div className="account-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Palette size={18} color="#20452f" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Reading Surface Theme</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: '#6d786c', lineHeight: 1.5, marginBottom: '16px' }}>
            Choose a soothing paper-like surface for your reading experience.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleThemeChange('paper')}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: theme === 'paper' ? '2px solid #20452f' : '1px solid #d9e2d6',
                background: '#f8f9f5',
                color: '#20452f',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              📄 Paper (Ivory)
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('sepia')}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: theme === 'sepia' ? '2px solid #20452f' : '1px solid #d9e2d6',
                background: '#f4ecd8',
                color: '#5b4636',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              📜 Sepia (Warm)
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('night')}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: theme === 'night' ? '2px solid #20452f' : '1px solid #d9e2d6',
                background: '#1a1f1c',
                color: '#e4ede5',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              🌙 Night (Dark)
            </button>
          </div>
        </div>

        {/* Reader Typography */}
        <div className="account-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Type size={18} color="#20452f" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Default Typography Scale</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: '#6d786c', lineHeight: 1.5, marginBottom: '16px' }}>
            Adjust the baseline reading font size for article bodies.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            {[16, 18, 21].map((size) => (
              <button
                key={size}
                type="button"
                className={`toolbar-filter-pill ${fontSize === size ? 'active' : ''}`}
                onClick={() => handleFontSizeChange(size)}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {size === 16 ? 'Compact (16px)' : size === 18 ? 'Editorial (18px)' : 'Relaxed (21px)'}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh & Offline */}
        <div className="account-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Clock size={18} color="#20452f" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Feed Synchronization</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: '#6d786c', lineHeight: 1.5, marginBottom: '16px' }}>
            Configure how frequently Readora checks for new feed articles in the background.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[
              { id: 'manual', label: 'Manual Only' },
              { id: '15m', label: 'Every 15 mins' },
              { id: '30m', label: 'Every 30 mins' },
              { id: '1h', label: 'Every hour' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`toolbar-filter-pill ${refreshInterval === opt.id ? 'active' : ''}`}
                onClick={() => handleRefreshIntervalChange(opt.id)}
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="sync-toggle-box">
            <div className="sync-info">
              <strong style={{ fontSize: '13.5px' }}>Pre-cache full articles for offline reading</strong>
              <p className="sync-desc">
                When enabled, article bodies will be downloaded and formatted immediately for zero-lag offline reading.
              </p>
            </div>
            <label className="switch-toggle" aria-label="Toggle offline article pre-cache">
              <input
                type="checkbox"
                checked={offlinePrecache}
                onChange={(e) => handlePrecacheToggle(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Zero Knowledge Privacy Declaration */}
        <div className="account-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Shield size={18} color="#20452f" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Zero-Knowledge Privacy Policy</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: '#6d786c', lineHeight: 1.7, margin: 0 }}>
            Readora never transmits your personal reading behavior or user identity to any central server. All
            subscriptions, posts, reading streaks, and notes are stored securely on this device in your browser&apos;s
            IndexedDB database.
          </p>
        </div>

        {/* Local Storage Management */}
        <div className="account-card danger-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Database size={18} color="#b33939" />
            <h3 style={{ margin: 0, fontSize: '15px', color: '#b33939' }}>Local Storage Reset</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: '#6d786c', lineHeight: 1.6, marginBottom: '16px' }}>
            Clear local IndexedDB storage to free up disk space or reset your library environment.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="delete-account-btn"
              onClick={() => setShowClearModal(true)}
            >
              <Trash2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Clear Local Cache
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleBloggerReset}
              style={{ background: '#20452f', color: '#ffffff', borderColor: '#20452f', fontSize: '12px', padding: '6px 12px' }}
              title="Delete all old posts and populate Blogger Developers Network, Brett's Test Blawg, and Blogger Buzz"
            >
              <Radio size={13} style={{ display: 'inline', marginRight: '6px' }} />
              Reset to Blogger Blogs (Purge Old Posts)
            </button>
          </div>

          {bloggerNotice && (
            <p style={{ fontSize: '12px', color: '#20452f', marginTop: '10px', fontWeight: 600, background: '#eef4ec', padding: '6px 10px', borderRadius: '6px' }}>
              ✓ {bloggerNotice}
            </p>
          )}

          {cleared && (
            <p style={{ fontSize: '12px', color: '#2e7d32', marginTop: '10px', fontWeight: 500 }}>
              ✓ Local cache successfully cleared.
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearModal && (
        <div className="modal-backdrop" onClick={() => setShowClearModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b33939', marginBottom: '10px' }}>
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                Clear all local cache?
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
              This will remove all downloaded feed articles and cached pages from this browser. Your feed subscription URLs
              will be preserved.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-account-btn"
                onClick={handleClearCache}
              >
                Yes, Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
