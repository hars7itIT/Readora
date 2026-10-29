import React, { useRef, useEffect, useState } from 'react';
import {
  Search,
  Home,
  Compass,
  Layers,
  Settings,
  Plus,
  Bell,
  ChevronDown,
  Menu,
  Check,
  User,
  LogOut,
  LogIn,
  X,
  Feather,
  Globe
} from 'lucide-react';
import type { PageView } from '../../types/index';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentPage: PageView;
  onSelectPage: (page: PageView) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddFeed?: () => void;
  onOpenAddArticle?: () => void;
  onToggleSidebar?: () => void;
  totalArticlesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  searchQuery,
  onSearchChange,
  onOpenAddFeed,
  onOpenAddArticle,
  onToggleSidebar,
  totalArticlesCount = 0
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const avatarLetter = (user?.name || user?.email || 'A').slice(0, 1).toUpperCase();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="editorial-navbar">
      {/* Left Search Area */}
      <div className="navbar-left">
        {onToggleSidebar && (
          <button
            className="navbar-sidebar-toggle"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectPage('inbox')}
          className="navbar-mobile-brand"
          style={{ background: 'none', border: 'none', padding: '0 8px 0 2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Readora"
        >
          <img
            src="/readora-logo.png"
            alt="Readora"
            style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
          />
        </button>

        <div className="navbar-search-box">
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search articles, topics, or tags…"
            aria-label="Search articles"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                onSearchChange('');
                searchInputRef.current?.focus();
              }}
              title="Clear search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#798b7d' }}
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="search-shortcut">⌘ K</kbd>
          )}
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="navbar-center-links" aria-label="Header Navigation">
        <button
          className={`navbar-tab-link ${
            currentPage === 'inbox' || currentPage === 'unread' || currentPage === 'starred' || currentPage === 'saved' || currentPage === 'reader'
              ? 'active'
              : ''
          }`}
          onClick={() => onSelectPage('inbox')}
        >
          <Home size={15} />
          <span>Home</span>
        </button>

        <button
          className={`navbar-tab-link ${currentPage === 'discover' ? 'active' : ''}`}
          onClick={() => onSelectPage('discover')}
        >
          <Compass size={15} />
          <span>Discover</span>
        </button>

        <button
          className={`navbar-tab-link ${currentPage === 'subscriptions' ? 'active' : ''}`}
          onClick={() => onSelectPage('subscriptions')}
        >
          <Layers size={15} />
          <span>Subscriptions</span>
        </button>

        <button
          className={`navbar-tab-link ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectPage('settings')}
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="navbar-right">
        {onOpenAddFeed && (
          <button
            className="navbar-add-feed-btn"
            onClick={onOpenAddFeed}
            title="Subscribe to new feed"
          >
            <Plus size={15} />
            <span>Add Feed</span>
          </button>
        )}

        {/* Notifications Button with dropdown */}
        <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button
            className="navbar-icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {!notificationDismissed && <span className="notification-unread-dot" />}
          </button>

          {showNotifications && (
            <div className="navbar-dropdown-card">
              <div className="dropdown-header">
                <strong>Notifications</strong>
                <span style={{ fontSize: '11px', color: '#68826c' }}>
                  {notificationDismissed ? 'All caught up' : '1 new update'}
                </span>
              </div>
              {!notificationDismissed ? (
                <div className="dropdown-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="dot" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>Library is fully synced</div>
                      <div style={{ fontSize: '11px', color: '#778576' }}>
                        {totalArticlesCount > 0 ? `${totalArticlesCount} items` : 'All articles'} stored locally in IndexedDB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#889887', cursor: 'pointer', padding: '4px' }}
                    onClick={() => setNotificationDismissed(true)}
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#778576', fontSize: '12px' }}>
                  No unread notifications.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Sign In button if unauthenticated */}
        {!isAuthenticated && (
          <button
            type="button"
            className="navbar-signin-pill"
            onClick={() => onSelectPage('login')}
            title="Sign in or create an account"
          >
            <LogIn size={14} />
            <span>Sign in</span>
          </button>
        )}

        {/* User / Profile Avatar Button */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            className={`navbar-user-btn ${isAuthenticated ? 'authenticated' : ''}`}
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User profile menu"
            title={isAuthenticated ? (user?.name || user?.email) : 'Anonymous Reader'}
          >
            <span className="user-avatar-circle">{avatarLetter}</span>
            {isAuthenticated && <span className="user-auth-indicator" />}
            <ChevronDown size={13} color="#607162" />
          </button>

          {showUserMenu && (
            <div className="navbar-dropdown-card user-menu">
              {isAuthenticated && user ? (
                <>
                  <div className="user-info">
                    <strong>{user.name || user.email.split('@')[0]}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="menu-divider" />
                  <button
                    className="menu-link-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectPage('account');
                    }}
                  >
                    <User size={14} /> Account & Privacy
                  </button>
                  <button
                    className="menu-link-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectPage('settings');
                    }}
                  >
                    <Settings size={14} /> Reader Settings
                  </button>
                  {onOpenAddArticle && (
                    <button
                      className="menu-link-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAddArticle();
                      }}
                    >
                      <Plus size={14} /> Write Post / URL
                    </button>
                  )}
                  <button
                    className="menu-link-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectPage('landing');
                    }}
                  >
                    <Globe size={14} /> View Landing Page
                  </button>
                  <a
                    href="/presentation.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="menu-link-btn"
                    style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span>📊</span> View PS-003 Deck
                  </a>
                  <div className="menu-divider" />
                  <button
                    className="menu-link-btn danger-link"
                    onClick={() => {
                      setShowUserMenu(false);
                      void logout();
                    }}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="user-info">
                    <strong>Anonymous Reader</strong>
                    <span>Zero tracking · Local only</span>
                  </div>
                  <div className="menu-divider" />
                  <button
                    className="menu-link-btn primary-menu-action"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectPage('login');
                    }}
                  >
                    <LogIn size={14} /> Sign in
                  </button>
                  <button
                    className="menu-link-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectPage('signup');
                    }}
                  >
                    <User size={14} /> Create account
                  </button>
                  <div className="menu-divider" />
                  <button
                    className="menu-link-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectPage('settings');
                    }}
                  >
                    <Settings size={14} /> Reader Settings
                  </button>
                  {onOpenAddArticle && (
                    <button
                      className="menu-link-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAddArticle();
                      }}
                    >
                      <Plus size={14} /> Write Post / URL
                    </button>
                  )}
                  <button
                    className="menu-link-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectPage('landing');
                    }}
                  >
                    <Globe size={14} /> View Landing Page
                  </button>
                  <a
                    href="/presentation.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="menu-link-btn"
                    style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span>📊</span> View PS-003 Deck
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
