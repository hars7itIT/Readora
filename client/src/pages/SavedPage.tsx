import React from 'react';
import { ArticleList } from '../components/articles/ArticleList';
import type { Post } from '../types/index';

interface SavedPageProps {
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post) => void;
  onToggleRead: (post: Post) => void;
  onToggleStar?: (post: Post) => void;
  onRefresh: () => void;
  online: boolean;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  posts,
  selectedPost,
  onSelectPost,
  onToggleRead,
  onToggleStar,
  onRefresh,
  online
}) => {
  const readPosts = posts.filter((p) => p.read);

  return (
    <section className="content reader-page">
      <div className="list-heading">
        <div>
          <div className="eyebrow">READ ARCHIVE</div>
          <h1>Read articles.</h1>
          <p>Articles you have opened and archived in your local library.</p>
        </div>
        <div className="list-meta">
          <span className="live-indicator" />
          {online ? 'SYNC READY' : 'LOCAL CACHE'}
          <strong>{readPosts.length} READ</strong>
        </div>
      </div>

      <ArticleList
        posts={readPosts}
        selectedPost={selectedPost}
        onSelectPost={onSelectPost}
        onToggleRead={onToggleRead}
        onToggleStar={onToggleStar}
        onRefresh={onRefresh}
      />
    </section>
  );
};
