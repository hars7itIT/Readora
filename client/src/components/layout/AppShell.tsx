import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { Feather } from 'lucide-react';
import type { PageView, Feed } from '../../types/index';

interface AppShellProps {
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAddFeed?: () => void;
  onOpenAddArticle?: () => void;
  theme?: 'paper' | 'sepia' | 'night';
  onCycleTheme?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
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
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onOpenAddFeed,
  onOpenAddArticle,
  theme = 'paper',
  onCycleTheme,
  children
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        activeFeedId={activeFeedId}
        onSelectFeed={onSelectFeed}
        feeds={feeds}
        unreadCount={unreadCount}
        starredCount={starredCount}
        totalArticlesCount={totalArticlesCount}
        online={online}
        onRemoveFeed={onRemoveFeed}
        onOpenAddFeed={onOpenAddFeed}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
        onCycleTheme={onCycleTheme}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="main-area">
        <Header
          currentPage={currentPage}
          onSelectPage={onSelectPage}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenAddFeed={onOpenAddFeed}
          onOpenAddArticle={onOpenAddArticle}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          totalArticlesCount={totalArticlesCount}
        />

        <main className="content-container">
          {children}
        </main>

        <footer className="app-footer">
          <span>
            <Feather size={13} /> Made for readers, not metrics.
          </span>
          <span>A QUIETER INTERNET IS A RICHER MIND</span>
        </footer>
      </div>

      <MobileNavigation currentPage={currentPage} onSelectPage={onSelectPage} />
    </div>
  );
};
