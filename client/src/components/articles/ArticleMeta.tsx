import React from 'react';
import { Star, Clock } from 'lucide-react';

interface ArticleMetaProps {
  feedTitle: string;
  publishedAt: number;
  read: boolean;
  starred?: boolean;
  readingTimeMinutes?: number;
  tags?: string[];
}

export const ArticleMeta: React.FC<ArticleMetaProps> = ({
  feedTitle,
  publishedAt,
  read,
  starred,
  readingTimeMinutes,
  tags
}) => {
  const dateStr = new Date(publishedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="article-meta" style={{ flexWrap: 'wrap', gap: '6px' }}>
      <span className="article-source">{feedTitle}</span>
      <span className="meta-separator">·</span>
      <span>{dateStr}</span>
      {readingTimeMinutes && (
        <>
          <span className="meta-separator">·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} /> {readingTimeMinutes} min
          </span>
        </>
      )}
      {tags && tags.length > 0 && (
        <>
          <span className="meta-separator">·</span>
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                background: '#edf3e9',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '9px',
                color: '#47684c'
              }}
            >
              #{tag}
            </span>
          ))}
        </>
      )}
      {starred && <Star size={12} fill="#d9992b" color="#d9992b" style={{ marginLeft: 'auto' }} />}
      {!read && <span className="unread-dot" />}
    </div>
  );
};
