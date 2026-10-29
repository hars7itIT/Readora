import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Radio, Key, Clock } from 'lucide-react';
import { BLOGGER_SAMPLE_POSTS, BLOGGER_API_KEY } from '../../features/blogger/bloggerData';

export const LandingLiveLinksStrip: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'googleblog.com';
    }
  };

  const sampleLinks = BLOGGER_SAMPLE_POSTS.slice(0, 6);

  return (
    <section className="landing-live-links-section" style={{ padding: '64px 24px', background: '#fafbf9', borderTop: '1px solid #e5ede3', borderBottom: '1px solid #e5ede3' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e2ece1', color: '#20452f', padding: '4px 12px', borderRadius: '16px', fontSize: '11.5px', fontWeight: 600, marginBottom: '12px' }}>
            <Radio size={12} className="live-radio-pulse" />
            <span>REAL-TIME BLOGGER API WIRE</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '32px', color: '#1a2e21', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Live Post Links Stream
          </h2>

          <p style={{ fontSize: '14.5px', color: '#556758', maxWidth: '620px', margin: '0 auto 16px', lineHeight: 1.6 }}>
            Direct, distraction-free links incoming from independent Blogger blogs via Google Blogger API v3.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #d4e2d2', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', color: '#20452f' }}>
            <Key size={11} />
            <span>API Key: <code>{BLOGGER_API_KEY.slice(0, 10)}…{BLOGGER_API_KEY.slice(-4)}</code></span>
            <span style={{ color: '#28a745', fontWeight: 600 }}>● Active</span>
          </div>
        </div>

        {/* Links Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {sampleLinks.map((item) => {
            const domain = getDomainFromUrl(item.url);
            const isCopied = copiedUrl === item.url;
            const blogTitle = item.blog.id === '3213900'
              ? 'Blogger Developers'
              : item.blog.id === '4967929378133675647'
              ? "Brett's Test Blawg"
              : 'Blogger Buzz';

            return (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e1e9de',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.18s ease'
                }}
              >
                {/* Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ background: '#edf4ea', color: '#1e3827', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600, fontSize: '10.5px' }}>
                      {domain}
                    </span>
                    <span style={{ color: '#68776b', fontWeight: 500 }}>{blogTitle}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: '#88988a' }}>
                    <Clock size={11} />
                    <span>{new Date(item.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Headline */}
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1a2e21', fontFamily: 'var(--font-serif, serif)', lineHeight: 1.35 }}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {item.title}
                  </a>
                </h4>

                {/* Direct Link Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f7f9f6',
                    border: '1px solid #e1e9de',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    gap: '6px'
                  }}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#20452f',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      textDecoration: 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}
                    title={item.url}
                  >
                    <ExternalLink size={11} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.url}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => handleCopy(item.url, e)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: isCopied ? '#20452f' : '#ffffff',
                      color: isCopied ? '#ffffff' : '#20452f',
                      border: '1px solid #cedcd0',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    title="Copy direct link"
                  >
                    {isCopied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Action Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px dashed #e8efe5' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {item.labels?.slice(0, 2).map((lbl) => (
                      <span key={lbl} style={{ fontSize: '10px', color: '#68776b', background: '#f1f5ef', padding: '1px 5px', borderRadius: '3px' }}>
                        #{lbl}
                      </span>
                    ))}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#20452f',
                      fontSize: '11px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Open Post</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
