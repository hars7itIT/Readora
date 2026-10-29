import { XMLParser } from 'fast-xml-parser';
import { fetchRaw } from '../../lib/apiClient';
import { bloggerService } from '../blogger/bloggerService';
import type { DiscoveredFeedResult } from './feedTypes';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true
});

const textOf = (v: any): string => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') return String(v['#text'] ?? v['@_href'] ?? v['@_url'] ?? '');
  return '';
};

function absoluteUrl(value: string, base: string) {
  try {
    return new URL(value, base).href;
  } catch {
    return '';
  }
}

function looksLikeFeed(xml: string) {
  return /<rss\b|<feed\b|<rdf:RDF\b/i.test(xml.slice(0, 5000));
}

export async function discoverFeed(input: string): Promise<DiscoveredFeedResult> {
  const normalized = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const site = new URL(normalized);
  if (!['http:', 'https:'].includes(site.protocol)) {
    throw new Error('Only HTTP and HTTPS websites are supported.');
  }

  // Handle Google Blogger API v3 URI: https://www.googleapis.com/blogger/v3/blogs/byurl?url=...
  if (normalized.includes('googleapis.com/blogger/v3/blogs/byurl')) {
    const targetUrl = site.searchParams.get('url');
    if (targetUrl) {
      return discoverFeed(targetUrl);
    }
  }

  // Check known Blogger blogs
  const bloggerBlog = bloggerService.getBlogByUrl(site.href);
  if (bloggerBlog) {
    return {
      siteUrl: bloggerBlog.url,
      feedUrl: `${bloggerBlog.url.replace(/\/$/, '')}/feeds/posts/default`,
      title: bloggerBlog.name
    };
  }

  const html = await fetchRaw(site.href);
  if (looksLikeFeed(html.text)) {
    const parsed = parser.parse(html.text);
    const title = textOf(parsed.rss?.channel?.title || parsed.feed?.title) || site.hostname;
    return { siteUrl: site.origin, feedUrl: site.href, title };
  }

  const doc = new DOMParser().parseFromString(html.text, 'text/html');
  const link = doc.querySelector(
    'link[rel~="alternate"][type*="rss" i], link[rel~="alternate"][type*="atom" i], link[rel~="alternate"][type*="xml" i]'
  );

  const candidates = [
    link?.getAttribute('href'),
    '/feed',
    '/feed/',
    '/rss.xml',
    '/atom.xml',
    '/index.xml',
    '/feeds/posts/default',
    '/feeds/posts/default?alt=rss'
  ].filter(Boolean) as string[];

  let feedUrl = '';
  const title = doc.querySelector('title')?.textContent?.trim() || site.hostname;

  for (const candidate of candidates) {
    const url = absoluteUrl(candidate, site.href);
    if (!url) continue;
    try {
      const response = await fetchRaw(url);
      if (looksLikeFeed(response.text)) {
        feedUrl = url;
        break;
      }
    } catch {
      // try next candidate
    }
  }

  if (!feedUrl) {
    throw new Error('No RSS/Atom feed found. Try pasting the direct feed URL.');
  }

  return { siteUrl: site.origin, feedUrl, title };
}
