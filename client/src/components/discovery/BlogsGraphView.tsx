import React, { useState } from 'react';
import { Network, Sparkles, Plus, ExternalLink, Info } from 'lucide-react';
import type { DiscoveryFeed } from '../../types/index';

interface GraphNode {
  id: string;
  label: string;
  domain: string;
  x: number;
  y: number;
  category: string;
  connections: string[];
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
  reason: string;
}

interface BlogsGraphViewProps {
  onSelectFeed?: (url: string) => void;
  followedUrls?: Set<string>;
}

export const BlogsGraphView: React.FC<BlogsGraphViewProps> = ({ onSelectFeed, followedUrls = new Set() }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('jvns');

  const nodes: GraphNode[] = [
    { id: 'hn', label: 'Hacker News', domain: 'news.ycombinator.com', x: 260, y: 140, category: 'Tech', connections: ['jvns', 'csstricks', 'github'] },
    { id: 'jvns', label: 'Julia Evans', domain: 'jvns.ca', x: 160, y: 220, category: 'Tech', connections: ['hn', 'csstricks', 'hacks'] },
    { id: 'csstricks', label: 'CSS-Tricks', domain: 'css-tricks.com', x: 280, y: 260, category: 'Design', connections: ['jvns', 'smashing', 'hn'] },
    { id: 'smashing', label: 'Smashing Mag', domain: 'smashingmagazine.com', x: 380, y: 310, category: 'Design', connections: ['csstricks', 'hacks'] },
    { id: 'hacks', label: 'Mozilla Hacks', domain: 'hacks.mozilla.org', x: 210, y: 340, category: 'Tech', connections: ['smashing', 'jvns'] },
    { id: 'github', label: 'GitHub Blog', domain: 'github.blog', x: 390, y: 150, category: 'Tech', connections: ['hn', 'cloudflare', 'blogger'] },
    { id: 'cloudflare', label: 'Cloudflare', domain: 'blog.cloudflare.com', x: 490, y: 210, category: 'Tech', connections: ['github'] },
    { id: 'blogger', label: 'Blogger Buzz', domain: 'buzz.blogger.com', x: 340, y: 80, category: 'Blogger', connections: ['github', 'bdev'] },
    { id: 'bdev', label: 'Blogger Devs', domain: 'code.blogger.com', x: 200, y: 70, category: 'Blogger', connections: ['blogger'] },
    { id: 'verge', label: 'The Verge', domain: 'theverge.com', x: 480, y: 100, category: 'Media', connections: ['arstechnica'] },
    { id: 'arstechnica', label: 'Ars Technica', domain: 'arstechnica.com', x: 530, y: 160, category: 'Media', connections: ['verge'] }
  ];

  const links: GraphLink[] = [
    { source: 'hn', target: 'jvns', weight: 12, reason: '12 readers follow both Hacker News and Julia Evans' },
    { source: 'hn', target: 'csstricks', weight: 9, reason: '9 readers share these web development feeds' },
    { source: 'jvns', target: 'csstricks', weight: 10, reason: 'High overlap in frontend debugging and CSS topics' },
    { source: 'csstricks', target: 'smashing', weight: 8, reason: 'Design & typography co-subscription cluster' },
    { source: 'smashing', target: 'hacks', weight: 8, reason: 'Blogroll: Smashing links to Mozilla web engine updates' },
    { source: 'hn', target: 'github', weight: 15, reason: 'Strongest tech engineering overlap cluster' },
    { source: 'github', target: 'cloudflare', weight: 11, reason: 'Distributed systems and cloud architecture co-readers' },
    { source: 'blogger', target: 'github', weight: 10, reason: 'Independent open web platform builders' },
    { source: 'blogger', target: 'bdev', weight: 14, reason: 'Blogroll: Official Blogger API v3 and Buzz pairing' },
    { source: 'verge', target: 'arstechnica', weight: 14, reason: 'Top journalism & science co-subscription' }
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const activeNode = nodeMap.get(selectedNodeId) || nodes[1];

  // Connected nodes ("Blogs like this")
  const relatedNodes = nodes.filter(
    (n) => n.id !== activeNode.id && (activeNode.connections.includes(n.id) || n.connections.includes(activeNode.id))
  );

  return (
    <div style={{ background: '#ffffff', border: '1px solid #dfe7dc', borderRadius: '14px', padding: '24px', margin: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e2ede0', color: '#20452f', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
            <Network size={12} />
            <span>INTERACTIVE NETWORK GRAPH</span>
          </div>
          <h3 style={{ margin: '6px 0 2px', fontFamily: 'var(--font-serif, serif)', fontSize: '20px', color: '#1a2e21' }}>
            &ldquo;Blogs Like This&rdquo; Discovery Graph
          </h3>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#5a6d5d' }}>
            Click any blog node to explore anonymous reader overlap connections and blogroll links.
          </p>
        </div>

        <div style={{ fontSize: '11px', color: '#68776b', display: 'flex', gap: '12px' }}>
          <span>● Tech: Green</span>
          <span>● Design: Orange</span>
          <span>● Media: Blue</span>
          <span>● Blogger: Purple</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* SVG Network Graph Canvas */}
        <div style={{ background: '#f8faf7', border: '1px solid #e2ebd0', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
          <svg viewBox="100 40 480 340" style={{ width: '100%', height: '360px', display: 'block' }}>
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8ba58f" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4f7a59" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Links between blogs */}
            {links.map((link, idx) => {
              const src = nodeMap.get(link.source);
              const tgt = nodeMap.get(link.target);
              if (!src || !tgt) return null;
              const isHighlighted = link.source === selectedNodeId || link.target === selectedNodeId;

              return (
                <line
                  key={idx}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isHighlighted ? '#20452f' : '#cbd9c7'}
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={isHighlighted ? 'none' : '3 2'}
                  opacity={isHighlighted ? 1 : 0.6}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const isSelected = n.id === selectedNodeId;
              const isConnected = activeNode.connections.includes(n.id);
              const color =
                n.category === 'Tech'
                  ? '#2d6a4f'
                  : n.category === 'Design'
                  ? '#d97706'
                  : n.category === 'Blogger'
                  ? '#7c3aed'
                  : '#2563eb';

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => setSelectedNodeId(n.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={isSelected ? 20 : isConnected ? 16 : 13}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 1.5}
                    style={{
                      transition: 'all 0.2s ease',
                      filter: isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' : 'none'
                    }}
                  />
                  <text
                    y={isSelected ? 28 : 24}
                    textAnchor="middle"
                    fontSize={isSelected ? '11px' : '9.5px'}
                    fontWeight={isSelected ? 700 : 500}
                    fill="#1e293b"
                    fontFamily="sans-serif"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Blog Details Sidebar ("Blogs Like This") */}
        <div style={{ background: '#fbfcf9', border: '1px solid #e1e9de', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#20452f', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
            <Sparkles size={12} />
            <span>Selected Blog</span>
          </div>

          <h4 style={{ margin: '4px 0', fontSize: '17px', color: '#1a2e21', fontFamily: 'var(--font-serif, serif)' }}>
            {activeNode.label}
          </h4>
          <span style={{ fontSize: '11.5px', color: '#68776b', fontFamily: 'monospace' }}>
            {activeNode.domain}
          </span>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2ebd0' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#20452f', marginBottom: '8px' }}>
              Blogs like {activeNode.label}:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {relatedNodes.map((rel) => {
                const matchLink = links.find(
                  (l) =>
                    (l.source === activeNode.id && l.target === rel.id) ||
                    (l.source === rel.id && l.target === activeNode.id)
                );

                return (
                  <div
                    key={rel.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dce6da',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '11.5px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#1e3827' }}>{rel.label}</strong>
                      <span style={{ fontSize: '10px', background: '#eef4ec', color: '#20452f', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                        {matchLink ? `${matchLink.weight} shared` : 'Related'}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '10.5px', color: '#68776b', lineHeight: 1.4 }}>
                      {matchLink?.reason || 'Strong reader co-occurrence overlap.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
