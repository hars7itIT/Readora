import type { Feed } from '../../types/index';

export function exportOpml(feeds: Feed[]): void {
  const dateStr = new Date().toUTCString();

  // Group feeds by folder
  const folderMap = new Map<string, Feed[]>();
  const unorganized: Feed[] = [];

  for (const f of feeds) {
    if (f.folder && f.folder.trim()) {
      const folderName = f.folder.trim();
      if (!folderMap.has(folderName)) folderMap.set(folderName, []);
      folderMap.get(folderName)!.push(f);
    } else {
      unorganized.push(f);
    }
  }

  const renderFeedOutline = (f: Feed, indent = '      ') => {
    const categoryAttr = f.tags && f.tags.length > 0 ? ` category="${escapeXml(f.tags.join(','))}"` : '';
    return `${indent}<outline text="${escapeXml(f.title)}" title="${escapeXml(f.title)}" type="rss" xmlUrl="${escapeXml(
      f.feedUrl
    )}" htmlUrl="${escapeXml(f.siteUrl)}"${categoryAttr} />`;
  };

  const outlinesParts: string[] = [];

  // Grouped folders
  for (const [folderName, folderFeeds] of folderMap.entries()) {
    outlinesParts.push(`    <outline text="${escapeXml(folderName)}" title="${escapeXml(folderName)}">`);
    for (const f of folderFeeds) {
      outlinesParts.push(renderFeedOutline(f, '      '));
    }
    outlinesParts.push(`    </outline>`);
  }

  // Unorganized feeds
  for (const f of unorganized) {
    outlinesParts.push(renderFeedOutline(f, '    '));
  }

  const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Readora Subscriptions</title>
    <dateCreated>${dateStr}</dateCreated>
  </head>
  <body>
${outlinesParts.join('\n')}
  </body>
</opml>`;

  const blob = new Blob([opmlContent], { type: 'text/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `readora-subscriptions-${new Date().toISOString().slice(0, 10)}.opml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface ParsedOpmlFeed {
  title: string;
  siteUrl: string;
  feedUrl: string;
  folder?: string;
  tags?: string[];
}

export function parseOpml(xmlText: string): ParsedOpmlFeed[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const outlines = doc.querySelectorAll('outline[xmlUrl], outline[xmlurl]');
  const results: ParsedOpmlFeed[] = [];

  outlines.forEach((node) => {
    const feedUrl = node.getAttribute('xmlUrl') || node.getAttribute('xmlurl');
    if (!feedUrl) return;
    const title =
      node.getAttribute('title') ||
      node.getAttribute('text') ||
      (() => {
        try {
          return new URL(feedUrl).hostname;
        } catch {
          return 'Subscription';
        }
      })();
    const siteUrl = node.getAttribute('htmlUrl') || node.getAttribute('htmlurl') || feedUrl;

    // Detect parent folder outline if exists
    let folder: string | undefined;
    const parentNode = node.parentElement;
    if (parentNode && parentNode.tagName.toLowerCase() === 'outline') {
      const parentXmlUrl = parentNode.getAttribute('xmlUrl') || parentNode.getAttribute('xmlurl');
      if (!parentXmlUrl) {
        folder = parentNode.getAttribute('title') || parentNode.getAttribute('text') || undefined;
      }
    }

    // Detect tags/category
    const categoryAttr = node.getAttribute('category');
    const tags = categoryAttr
      ? categoryAttr.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    results.push({ title, siteUrl, feedUrl, folder, tags });
  });

  return results;
}
