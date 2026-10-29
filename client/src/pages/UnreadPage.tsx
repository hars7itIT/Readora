import React from 'react';
import { ArticleList } from '../components/articles/ArticleList';
import type { Post } from '../types/index';

interface UnreadPageProps {
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post) => void;
  onToggleRead: (post: Post) => void;
  onToggleStar?: (post: Post) => void;
  onRefresh: () => void;
  online: boolean;
}

export const UnreadPage: React.FC<UnreadPageProps> = ({
  posts,
  selectedPost,
  onSelectPost,
  onToggleRead,
  onToggleStar,
  onRefresh,
  online
}) => {
  const unreadPosts = posts.filter((p) => !p.read);

  return (
    <section className="content reader-page">
      <div className="list-heading">
        <div>
          <div className="eyebrow">UNREAD ARTICLES</div>
          <h1>Focus on what’s fresh.</h1>
          <p>Only articles you have not yet opened or marked as read.</p>
        </div>
        <div className="list-meta">
          <span className="live-indicator" />
          {online ? 'SYNC READY' : 'LOCAL CACHE'}
          <strong>{unreadPosts.length} UNREAD</strong>
        </div>
      </div>

      <ArticleList
        posts={unreadPosts}
        selectedPost={selectedPost}
        onSelectPost={onSelectPost}
        onToggleRead={onToggleRead}
        onToggleStar={onToggleStar}
        onRefresh={onRefresh}
      />
    </section>
  );
};
