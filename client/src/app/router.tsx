import React from 'react';
import { HomePage } from '../pages/HomePage';
import { UnreadPage } from '../pages/UnreadPage';
import { SavedPage } from '../pages/SavedPage';
import { ReaderPage } from '../pages/ReaderPage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { SubscriptionsPage } from '../pages/SubscriptionsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage';
import { AccountPage } from '../pages/AccountPage';
import { LandingPage } from '../pages/landing/LandingPage';
import { ArticleList } from '../components/articles/ArticleList';
import type { PageView, Feed, Post, DiscoveryFeed } from '../types/index';

interface RouterProps {
  currentPage: PageView;
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
  onAddFeed: (url: string, folder?: string, tags?: string[]) => Promise<void>;
  onUpdateFeed?: (feedId: string, folder?: string, tags?: string[]) => Promise<void>;
  onRemoveFeed: (feed: Feed) => void;
  notice: string;
  onClearNotice: () => void;
  online: boolean;
  popular: DiscoveryFeed[];
  recommendations: DiscoveryFeed[];
  consent: boolean;
  onConsentChange: (enabled: boolean) => void;
  onShare: () => void;
  isSharing: boolean;
  discoverError: string;
  onCacheCleared: () => void;
  onBackToArticles: () => void;
  onLoadFullText: (post: Post) => void;
  onNavigate?: (page: PageView) => void;
  isRefreshing?: boolean;
  onResetToBlogger?: () => void;
}

export const AppRouter: React.FC<RouterProps> = ({
  currentPage,
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
  onUpdateFeed,
  onRemoveFeed,
  notice,
  onClearNotice,
  online,
  popular,
  recommendations,
  consent,
  onConsentChange,
  onShare,
  isSharing,
  discoverError,
  onCacheCleared,
  onBackToArticles,
  onLoadFullText,
  onNavigate,
  isRefreshing = false,
  onResetToBlogger
}) => {
  switch (currentPage) {
    case 'inbox':
      return (
        <HomePage
          feeds={feeds}
          posts={posts}
          selectedPost={selectedPost}
          onSelectPost={onSelectPost}
          onToggleRead={onToggleRead}
          onToggleStar={onToggleStar}
          onSaveNotes={onSaveNotes}
          onImportSamplePosts={onImportSamplePosts}
          onImportSamplePhotos={onImportSamplePhotos}
          onRefresh={onRefresh}
          onAddFeed={onAddFeed}
          notice={notice}
          onClearNotice={onClearNotice}
          online={online}
          isRefreshing={isRefreshing}
          onResetToBlogger={onResetToBlogger}
        />
      );

    case 'unread':
      return (
        <UnreadPage
          posts={posts}
          selectedPost={selectedPost}
          onSelectPost={onSelectPost}
          onToggleRead={onToggleRead}
          onRefresh={onRefresh}
          online={online}
        />
      );

    case 'starred': {
      const starredPosts = posts.filter((p) => p.starred);
      return (
        <section className="content reader-page">
          <div className="list-heading">
            <div>
              <div className="eyebrow">STARRED COLLECTION</div>
              <h1>Your favorite pieces.</h1>
              <p>Articles and posts you have flagged for easy reference.</p>
            </div>
            <div className="list-meta">
              <strong>{starredPosts.length} STARRED</strong>
            </div>
          </div>

          <ArticleList
            posts={starredPosts}
            selectedPost={selectedPost}
            onSelectPost={onSelectPost}
            onToggleRead={onToggleRead}
            onToggleStar={onToggleStar}
            onRefresh={onRefresh}
          />
        </section>
      );
    }

    case 'saved':
      return (
        <SavedPage
          posts={posts}
          selectedPost={selectedPost}
          onSelectPost={onSelectPost}
          onToggleRead={onToggleRead}
          onRefresh={onRefresh}
          online={online}
        />
      );

    case 'reader':
      return (
        <ReaderPage
          post={selectedPost}
          onBack={onBackToArticles}
          onToggleRead={onToggleRead}
          onToggleStar={onToggleStar}
          onSaveNotes={onSaveNotes}
          onLoadFullText={onLoadFullText}
          online={online}
        />
      );

    case 'discover':
      return (
        <DiscoverPage
          popular={popular}
          recommendations={recommendations}
          feeds={feeds}
          consent={consent}
          onConsentChange={onConsentChange}
          onShare={onShare}
          isSharing={isSharing}
          onAddFeed={onAddFeed}
          error={discoverError}
        />
      );

    case 'subscriptions':
      return (
        <SubscriptionsPage
          feeds={feeds}
          onAddFeed={onAddFeed}
          onUpdateFeed={onUpdateFeed}
          onRemoveFeed={onRemoveFeed}
          onRefresh={onRefresh}
        />
      );

    case 'settings':
      return <SettingsPage onCacheCleared={onCacheCleared} onNavigate={onNavigate} />;

    case 'login':
      return <LoginPage onNavigate={(p) => onNavigate?.(p as PageView)} />;

    case 'signup':
      return <SignupPage onNavigate={(p) => onNavigate?.(p as PageView)} />;

    case 'forgot-password':
      return <ForgotPasswordPage onNavigate={(p) => onNavigate?.(p as PageView)} />;

    case 'reset-password':
      return <ResetPasswordPage onNavigate={(p) => onNavigate?.(p as PageView)} />;

    case 'auth-callback':
      return <AuthCallbackPage onNavigate={(p) => onNavigate?.(p as PageView)} />;

    case 'landing':
      return (
        <LandingPage
          onNavigate={(p) => onNavigate?.(p)}
          posts={posts}
          feeds={feeds}
          totalArticlesCount={posts.length}
          unreadCount={posts.filter((p) => !p.read).length}
          starredCount={posts.filter((p) => p.starred).length}
        />
      );

    case 'account':
      return <AccountPage onNavigate={(p) => onNavigate?.(p as PageView)} feeds={feeds} />;

    default:
      return null;
  }
};
