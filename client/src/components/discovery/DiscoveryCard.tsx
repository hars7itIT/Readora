import React from 'react';
import { Plus, Sparkles, Check, ExternalLink } from 'lucide-react';
import type { DiscoveryFeed } from '../../types/index';

interface DiscoveryCardProps {
  item: DiscoveryFeed;
  index: number;
  onAdd: (item: DiscoveryFeed) => void;
  followed: boolean;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ item, index, onAdd, followed }) => {
  const domain = (() => {
    try {
      return new URL(item.url).hostname.replace(/^www\./, '');
    } catch {
      return item.url;
    }
  })();
  const initials = domain.slice(0, 1).toUpperCase();

  const recommendationReason =
    item.reason ||
    (item.count > 20
      ? `Followed by ${item.count} community readers with high overlap across Hacker News and Julia Evans.`
      : `Recommended based on reader overlap and independent blogroll links.`);

  return (
    <article className="discovery-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className={`discovery-icon icon-${index % 5}`}>{initials}</div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#68776b', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', textDecoration: 'none' }}
            title={`Visit ${domain}`}
          >
            <span>{domain}</span>
            <ExternalLink size={10} />
          </a>
        </div>

        <h3 style={{ margin: '4px 0 8px', fontSize: '17px', color: '#1a2e21' }}>{item.title}</h3>

        {/* Transparent Recommendation Box */}
        <div
          style={{
            background: '#f4f8f3',
            border: '1px solid #dbe7d8',
            borderRadius: '8px',
            padding: '8px 10px',
            margin: '8px 0 12px',
            fontSize: '11.5px',
            color: '#24452e'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase', color: '#1c3d27', marginBottom: '3px' }}>
            <Sparkles size={11} color="#d97706" />
            <span>Why this was suggested:</span>
          </div>
          <p style={{ margin: 0, lineHeight: 1.45 }}>{recommendationReason}</p>
        </div>
      </div>

      <div className="discovery-card-footer" style={{ borderTop: '1px dashed #e2ebd0', paddingTop: '10px' }}>
        <span style={{ fontSize: '11px', color: '#657a69', fontWeight: 600 }}>
          {item.count} co-readers
        </span>

        <button
          disabled={followed}
          onClick={() => onAdd(item)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: followed ? '#eef4ec' : '#20452f',
            color: followed ? '#20452f' : '#ffffff',
            border: followed ? '1px solid #c9d8c6' : 'none',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: followed ? 'default' : 'pointer'
          }}
        >
          {followed ? (
            <>
              <Check size={13} /> Following
            </>
          ) : (
            <>
              <Plus size={13} /> Follow
            </>
          )}
        </button>
      </div>
    </article>
  );
};
