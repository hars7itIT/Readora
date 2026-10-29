import React from 'react';
import { Plus } from 'lucide-react';
import type { Feed } from '../../types/index';

interface FeedPreviewProps {
  feed: Feed;
  onSubscribe?: (feed: Feed) => void;
  isSubscribed?: boolean;
}

export const FeedPreview: React.FC<FeedPreviewProps> = ({ feed, onSubscribe, isSubscribed }) => {
  return (
    <div
      style={{
        border: '1px solid #e1e6dc',
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff'
      }}
    >
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: '13px' }}>{feed.title}</h4>
        <span style={{ fontSize: '11px', color: '#889286' }}>{feed.siteUrl}</span>
      </div>

      {onSubscribe && (
        <button
          className="secondary-button"
          disabled={isSubscribed}
          onClick={() => onSubscribe(feed)}
        >
          {isSubscribed ? 'Subscribed' : <><Plus size={13} /> Follow</>}
        </button>
      )}
    </div>
  );
};
