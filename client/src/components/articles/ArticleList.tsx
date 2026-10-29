import React from 'react';
import { ArticleCard } from './ArticleCard';
import { EmptyState } from '../common/EmptyState';
import type { Post } from '../../types/index';

interface ArticleListProps {
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post) => void;
  onToggleRead: (post: Post) => void;
  onToggleStar?: (post: Post) => void;
  onRefresh: () => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  posts,
  selectedPost,
  onSelectPost,
  onToggleRead,
  onToggleStar,
  onRefresh
}) => {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="No articles found."
        description="Try refreshing your feeds or adding an article URL."
        actionText="Refresh now"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div className="article-list">
      {posts.map((post) => (
        <ArticleCard
          key={post.id}
          post={post}
          isSelected={selectedPost?.id === post.id}
          onSelect={onSelectPost}
          onToggleRead={onToggleRead}
          onToggleStar={onToggleStar}
        />
      ))}
    </div>
  );
};
