import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { AppRouter } from './router';
import { LandingPage } from '../pages/landing/LandingPage';
import { AddArticleDialog } from '../components/articles/AddArticleDialog';
import { AddFeedDialog } from '../components/feeds/AddFeedDialog';
import { importSamplePosts } from '../features/articles/samplePostsImporter';
import { importSamplePhotos } from '../features/articles/samplePhotosImporter';
import { importSampleAuthors } from '../features/articles/sampleUsersImporter';
import { bloggerService } from '../features/blogger/bloggerService';
import { useFeeds } from '../hooks/useFeeds';
import { useArticles } from '../hooks/useArticles';
import { useDiscovery } from '../hooks/useDiscovery';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from '../context/AuthContext';
import type { PageView, Feed, Post } from '../types/index';

function getInitialPageFromUrl(): PageView {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  switch (path) {
    case '':
    case '/':
      return 'landing';
    case '/app':
    case '/inbox':
      return 'inbox';
    case '/login':
      return 'login';
    case '/signup':
      return 'signup';
    case '/forgot-password':
      return 'forgot-password';
    case '/reset-password':
      return 'reset-password';
    case '/auth/callback':
      return 'auth-callback';
    case '/account':
      return 'account';
    case '/unread':
    case '/app/unread':
      return 'unread';
    case '/saved':
    case '/app/saved':
      return 'saved';
    case '/discover':
      return 'discover';
    case '/subscriptions':
    case '/app/subscriptions':
      return 'subscriptions';
    case '/settings':
      return 'settings';
    default:
      return 'landing';
  }
}

function getPathForPage(page: PageView): string {
  switch (page) {
    case 'landing':
      return '/';
    case 'inbox':
      return '/app';
    case 'login':
      return '/login';
    case 'signup':
      return '/signup';
    case 'forgot-password':
      return '/forgot-password';
    case 'reset-password':
      return '/reset-password';
    case 'auth-callback':
      return '/auth/callback';
    case 'account':
      return '/account';
    case 'unread':
      return '/unread';
    case 'saved':
      return '/saved';
    case 'discover':
      return '/discover';
    case 'subscriptions':
      return '/subscriptions';
    case 'settings':
      return '/settings';
    default:
      return '/';
  }
}

const AUTH_PAGES: PageView[] = ['login', 'signup', 'forgot-password', 'reset-password', 'auth-callback'];

export default function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>(() => getInitialPageFromUrl());
  const [activeFeedId, setActiveFeedId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [isAddArticleOpen, setIsAddArticleOpen] = useState<boolean>(false);
  const [isAddFeedOpen, setIsAddFeedOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'night'>('paper');

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    const newPath = getPathForPage(page);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPageFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Protected route handling
  useEffect(() => {
    if (authLoading) return;
    if (currentPage === 'account' && !isAuthenticated) {
      handleNavigate('login');
    }
    if ((currentPage === 'login' || currentPage === 'signup') && isAuthenticated) {
      handleNavigate('inbox');
    }
  }, [currentPage, isAuthenticated, authLoading]);

  const online = useOnlineStatus();
  const { feeds, addFeedByUrl, removeFeedById, updateFeed, refreshFeeds, reloadFeeds, syncing } = useFeeds();
  const {
    posts,
    unreadCount,
    starredCount,
    selectedPost,
    setSelectedPost,
    reloadPosts,
    openArticle,
    toggleReadStatus,
    toggleStarStatus,
    saveNotes
  } = useArticles(activeFeedId, searchQuery);

  const {
    popular,
    recommendations,
    consent,
    error: discoverError,
    loadDiscovery,
    updateConsent,
    shareFeeds,
    checkMaybeShare,
    sharing
  } = useDiscovery();

  // Load discovery feeds whenever user opens Discover tab or subscriptions change
  useEffect(() => {
    if (currentPage === 'discover') {
      void loadDiscovery(feeds.map((f) => f.feedUrl));
    }
  }, [currentPage, feeds, loadDiscovery]);

  // Run maybeShare() on app start, after follow/unfollow, and when Discover opens
  useEffect(() => {
    if (feeds.length > 0) {
      void checkMaybeShare(feeds.map((f) => f.feedUrl));
    }
  }, [feeds.length, currentPage, checkMaybeShare]);

  // Initial sync when online and feeds exist
  useEffect(() => {
    if (online && feeds.length > 0) {
      void refreshFeeds().then(() => void reloadPosts());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, feeds.length]);

  // Periodic background refresh of cached feeds when online (every 5 minutes)
  useEffect(() => {
    if (!online || feeds.length === 0) return;
    const interval = setInterval(() => {
      void refreshFeeds().then(() => void reloadPosts());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [online, feeds.length, refreshFeeds, reloadPosts]);

  const handleRefresh = async () => {
    if (!online) {
      setNotice('You are offline. Showing locally cached articles.');
      return;
    }
    setNotice('Refreshing subscriptions…');
    const result = await refreshFeeds();
    await reloadPosts();
    if (result.errors.length) {
      setNotice(`Refresh completed with errors: ${result.errors[0]}`);
    } else {
      setNotice(`Refreshed ${result.successful} subscription(s).`);
    }
  };

  const handleAddFeed = async (url: string, folder?: string, tags?: string[]) => {
    try {
      setNotice('Adding feed…');
      const feed = await addFeedByUrl(url, folder, tags);
      await reloadPosts();
      setActiveFeedId(feed.id);
      setNotice(`Subscribed to ${feed.title}.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to add feed.');
    }
  };

  const handleUpdateFeed = async (feedId: string, folder?: string, tags?: string[]) => {
    try {
      await updateFeed(feedId, folder, tags);
      setNotice('Updated subscription folder and tags.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to update feed.');
    }
  };

  const handleRemoveFeed = async (feed: Feed) => {
    await removeFeedById(feed.id);
    await reloadPosts();
    if (activeFeedId === feed.id) setActiveFeedId('all');
    if (selectedPost?.feedId === feed.id) setSelectedPost(null);
    setNotice(`Removed ${feed.title}.`);
  };

  const handleSelectPost = (post: Post | null) => {
    if (!post) {
      setSelectedPost(null);
      return;
    }
    void openArticle(post, online);
  };

  const handleArticleAdded = async (post: Post) => {
    await reloadPosts();
    setSelectedPost(post);
    setNotice(`Added "${post.title}" to your library.`);
  };

  const handleImportSamplePosts = async () => {
    try {
      setNotice('Importing 100 sample posts…');
      const res = await importSamplePosts();
      await Promise.all([reloadFeeds(), reloadPosts()]);
      setNotice(`Successfully imported ${res.postsCount} posts across ${res.feedsCount} author subscriptions!`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to import sample posts.');
    }
  };

  const handleImportSamplePhotos = async (limit?: number) => {
    try {
      setNotice(limit ? `Importing ${limit} photo gallery posts…` : 'Importing all 632 photo gallery posts…');
      const res = await importSamplePhotos({ limit });
      await Promise.all([reloadFeeds(), reloadPosts()]);
      setNotice(`Successfully imported ${res.postsCount} photos across ${res.feedsCount} album subscriptions!`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to import photo gallery.');
    }
  };

  const handleImportSampleAuthors = async () => {
    try {
      setNotice('Importing 10 author profiles…');
      const res = await importSampleAuthors();
      await reloadFeeds();
      setNotice(`Successfully imported ${res.feedsCount} author subscriptions into your library!`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to import author profiles.');
    }
  };

  // Auto-migrate to Blogger blogs and clear old dummy posts if not yet performed
  useEffect(() => {
    void bloggerService.autoMigrateIfFirstRun().then((migrated) => {
      if (migrated) {
        void Promise.all([reloadFeeds(), reloadPosts()]);
      }
    });
  }, [reloadFeeds, reloadPosts]);

  const handleResetToBlogger = async () => {
    try {
      setNotice('Deleting old posts and loading Blogger API blogs…');
      const res = await bloggerService.clearAllPostsAndLoadBlogger();
      await Promise.all([reloadFeeds(), reloadPosts()]);
      setSelectedPost(null);
      setNotice(`Deleted ${res.clearedPostsCount} old posts. Loaded ${res.loadedPostsCount} real-time Blogger links across ${res.loadedFeedsCount} blogs!`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to reset to Blogger feeds.');
    }
  };

  const handleCacheCleared = async () => {
    await Promise.all([reloadFeeds(), reloadPosts()]);
    setSelectedPost(null);
    setNotice('Local cache cleared.');
  };

  // Standalone public landing page
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onNavigate={handleNavigate}
        posts={posts}
        feeds={feeds}
        totalArticlesCount={posts.length}
        unreadCount={unreadCount}
        starredCount={starredCount}
        theme={theme}
        onCycleTheme={() => setTheme((t) => (t === 'paper' ? 'sepia' : t === 'sepia' ? 'night' : 'paper'))}
      />
    );
  }

  // Standalone full-screen editorial presentation for dedicated authentication flows
  if (AUTH_PAGES.includes(currentPage)) {
    return (
      <AppRouter
        currentPage={currentPage}
        feeds={feeds}
        posts={posts}
        selectedPost={selectedPost}
        onSelectPost={handleSelectPost}
        onToggleRead={(post) => void toggleReadStatus(post)}
        onToggleStar={(post) => void toggleStarStatus(post)}
        onSaveNotes={(post, notes) => void saveNotes(post, notes)}
        onImportSamplePosts={handleImportSamplePosts}
        onImportSamplePhotos={handleImportSamplePhotos}
        onRefresh={handleRefresh}
        onAddFeed={handleAddFeed}
        onRemoveFeed={handleRemoveFeed}
        notice={notice}
        onClearNotice={() => setNotice('')}
        online={online}
        popular={popular}
        recommendations={recommendations}
        consent={consent}
        onConsentChange={updateConsent}
        onShare={() => void shareFeeds(feeds.map((f) => f.feedUrl))}
        isSharing={sharing}
        discoverError={discoverError}
        onCacheCleared={handleCacheCleared}
        onBackToArticles={() => setSelectedPost(null)}
        onLoadFullText={(post) => void openArticle(post, online)}
        onNavigate={handleNavigate}
        isRefreshing={syncing}
        onResetToBlogger={handleResetToBlogger}
      />
    );
  }

  return (
    <>
      <AppShell
        currentPage={currentPage}
        onSelectPage={handleNavigate}
        activeFeedId={activeFeedId}
        onSelectFeed={setActiveFeedId}
        feeds={feeds}
        unreadCount={unreadCount}
        starredCount={starredCount}
        totalArticlesCount={posts.length}
        online={online}
        onRemoveFeed={handleRemoveFeed}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        isRefreshing={syncing}
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenAddArticle={() => setIsAddArticleOpen(true)}
        theme={theme}
        onCycleTheme={() => setTheme((t) => (t === 'paper' ? 'sepia' : t === 'sepia' ? 'night' : 'paper'))}
      >
        <AppRouter
          currentPage={currentPage}
          feeds={feeds}
          posts={posts}
          selectedPost={selectedPost}
          onSelectPost={handleSelectPost}
          onToggleRead={(post) => void toggleReadStatus(post)}
          onToggleStar={(post) => void toggleStarStatus(post)}
          onSaveNotes={(post, notes) => void saveNotes(post, notes)}
          onImportSamplePosts={handleImportSamplePosts}
          onImportSamplePhotos={handleImportSamplePhotos}
          onRefresh={handleRefresh}
          onAddFeed={handleAddFeed}
          onUpdateFeed={handleUpdateFeed}
          onRemoveFeed={handleRemoveFeed}
          notice={notice}
          onClearNotice={() => setNotice('')}
          online={online}
          popular={popular}
          recommendations={recommendations}
          consent={consent}
          onConsentChange={updateConsent}
          onShare={() => void shareFeeds(feeds.map((f) => f.feedUrl))}
          isSharing={sharing}
          discoverError={discoverError}
          onCacheCleared={handleCacheCleared}
          onBackToArticles={() => setSelectedPost(null)}
          onLoadFullText={(post) => void openArticle(post, online)}
          onNavigate={handleNavigate}
          isRefreshing={syncing}
          onResetToBlogger={handleResetToBlogger}
        />
      </AppShell>

      <AddArticleDialog
        isOpen={isAddArticleOpen}
        onClose={() => setIsAddArticleOpen(false)}
        onArticleAdded={handleArticleAdded}
        onImportSamplePosts={handleImportSamplePosts}
        onImportSamplePhotos={handleImportSamplePhotos}
        onImportSampleAuthors={handleImportSampleAuthors}
      />

      <AddFeedDialog
        isOpen={isAddFeedOpen}
        onClose={() => setIsAddFeedOpen(false)}
        onAddFeed={handleAddFeed}
      />
    </>
  );
}
