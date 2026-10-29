import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';
import { fetchRaw } from './api';
import { db } from '../lib/db';
import type { Feed, Post } from '../lib/types';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text', parseTagValue: false, trimValues: true });
const asArray = <T,>(v: T | T[] | undefined): T[] => v === undefined ? [] : Array.isArray(v) ? v : [v];
const textOf = (v: any): string => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') return String(v['#text'] ?? v['@_href'] ?? v['@_url'] ?? '');
  return '';
};
function absoluteUrl(value: string, base: string) { try { return new URL(value, base).href; } catch { return ''; } }
function dateValue(v: any): number { const n = Date.parse(textOf(v)); return Number.isFinite(n) ? n : Date.now(); }
function cleanSummary(v: any): string { return textOf(v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600); }

export async function discoverFeed(input: string): Promise<{ siteUrl: string; feedUrl: string; title: string }> {
  const normalized = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const site = new URL(normalized);
  if (!['http:', 'https:'].includes(site.protocol)) throw new Error('Only HTTP and HTTPS websites are supported.');
  const html = await fetchRaw(site.href);
  if (looksLikeFeed(html.text)) {
    const parsed = parser.parse(html.text);
    const title = textOf(parsed.rss?.channel?.title || parsed.feed?.title) || site.hostname;
    return { siteUrl: site.origin, feedUrl: site.href, title };
  }
  const doc = new DOMParser().parseFromString(html.text, 'text/html');
  const link = doc.querySelector('link[rel~="alternate"][type*="rss" i], link[rel~="alternate"][type*="atom" i], link[rel~="alternate"][type*="xml" i]');
  const candidates = [link?.getAttribute('href'), '/feed', '/feed/', '/rss.xml', '/atom.xml', '/index.xml'].filter(Boolean) as string[];
  let feedUrl = '';
  let title = doc.querySelector('title')?.textContent?.trim() || site.hostname;
  for (const candidate of candidates) {
    const url = absoluteUrl(candidate, site.href);
    if (!url) continue;
    try {
      const response = await fetchRaw(url);
      if (looksLikeFeed(response.text)) { feedUrl = url; break; }
    } catch { /* try next candidate */ }
  }
  if (!feedUrl) throw new Error('No RSS/Atom feed found. Try pasting the direct feed URL.');
  return { siteUrl: site.origin, feedUrl, title };
}
function looksLikeFeed(xml: string) { return /<rss\b|<feed\b|<rdf:RDF\b/i.test(xml.slice(0, 5000)); }

export async function parseFeed(feed: Feed): Promise<Post[]> {
  const { text } = await fetchRaw(feed.feedUrl);
  if (XMLValidator.validate(text) !== true) throw new Error('This feed contains malformed XML.');
  const root = parser.parse(text);
  let items: any[] = [];
  let channelTitle = feed.title;
  if (root.rss?.channel) {
    channelTitle = textOf(root.rss.channel.title) || feed.title;
    items = asArray(root.rss.channel.item).map((i: any) => ({
      title: textOf(i.title) || 'Untitled article', link: textOf(i.link) || textOf(i.guid),
      id: textOf(i.guid) || textOf(i.link) || `${textOf(i.title)}-${textOf(i.pubDate)}`,
      summary: cleanSummary(i.description || i['content:encoded']), contentHtml: textOf(i['content:encoded'] || i.description),
      publishedAt: dateValue(i.pubDate || i['dc:date']), author: textOf(i['dc:creator'] || i.author)
    }));
  } else if (root.feed) {
    channelTitle = textOf(root.feed.title) || feed.title;
    items = asArray(root.feed.entry).map((i: any) => {
      const links = asArray(i.link);
      const chosen = links.find((l: any) => l['@_rel'] === 'alternate') || links[0];
      return { title: textOf(i.title) || 'Untitled article', link: absoluteUrl(textOf(chosen), feed.siteUrl), id: textOf(i.id) || textOf(chosen) || textOf(i.title), summary: cleanSummary(i.summary || i.content), contentHtml: textOf(i.content || i.summary), publishedAt: dateValue(i.published || i.updated), author: textOf(i.author?.name || i.author) };
    });
  } else throw new Error('Unsupported feed format. Expected RSS or Atom.');
  const posts = items.filter((i) => i.link).map((i) => ({
    id: `${feed.id}:${stableId(i.id || i.link)}`, feedId: feed.id, feedTitle: channelTitle, title: i.title,
    link: absoluteUrl(i.link, feed.siteUrl), summary: i.summary, publishedAt: i.publishedAt,
    author: i.author, read: false, contentHtml: i.contentHtml
  } as Post));
  await db.transaction('rw', db.posts, async () => {
    for (const post of posts) {
      const existing = await db.posts.get(post.id);
      await db.posts.put({ ...post, read: existing?.read ?? false, contentHtml: existing?.contentHtml || post.contentHtml, articleHtml: existing?.articleHtml });
    }
  });
  return posts;
}
function stableId(value: string) { let h = 2166136261; for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

export async function extractArticle(post: Post): Promise<string> {
  const { text } = await fetchRaw(post.link);
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const article = new Readability(doc).parse();
  const html = article?.content || post.contentHtml || `<p>${escapeHtml(post.summary || 'Full text is unavailable for this article.')}</p>`;
  const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed'] });
  await db.posts.update(post.id, { articleHtml: safe, read: true });
  return safe;
}
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }
