import React from 'react';
import { X } from 'lucide-react';
import type { Feed } from '../../types/index';

interface SubscriptionItemProps {
  feed: Feed;
  isActive: boolean;
  onSelect: (feedId: string) => void;
  onRemove: (feed: Feed) => void;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  feed,
  isActive,
  onSelect,
  onRemove
}) => {
  return (
    <div className={`feed-row ${isActive ? 'chosen' : ''}`}>
      <button className="feed-nav" onClick={() => onSelect(feed.id)}>
        <span className="feed-favicon">{feed.title.slice(0, 1).toUpperCase()}</span>
        <span className="feed-name">{feed.title}</span>
      </button>
      <button className="remove-feed" title={`Remove ${feed.title}`} onClick={() => onRemove(feed)}>
        <X size={13} />
      </button>
    </div>
  );
};
