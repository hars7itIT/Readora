import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Feed, Post } from '../../types/index';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true
});

const asArray = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

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

function dateValue(v: any): number {
  const n = Date.parse(textOf(v));
  return Number.isFinite(n) ? n : Date.now();
}

function cleanSummary(v: any): string {
  return textOf(v)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600);
}

function stableId(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function parseFeedXml(text: string, feed: Feed): Post[] {
  if (XMLValidator.validate(text) !== true) {
    throw new Error('This feed contains malformed XML.');
  }

  const root = parser.parse(text);
  let items: any[] = [];
  let channelTitle = feed.title;

  if (root.rss?.channel) {
    channelTitle = textOf(root.rss.channel.title) || feed.title;
    items = asArray(root.rss.channel.item).map((i: any) => ({
      title: textOf(i.title) || 'Untitled article',
      link: textOf(i.link) || textOf(i.guid),
      id: textOf(i.guid) || textOf(i.link) || `${textOf(i.title)}-${textOf(i.pubDate)}`,
      summary: cleanSummary(i.description || i['content:encoded']),
      contentHtml: textOf(i['content:encoded'] || i.description),
      publishedAt: dateValue(i.pubDate || i['dc:date']),
      author: textOf(i['dc:creator'] || i.author)
    }));
  } else if (root.feed) {
    channelTitle = textOf(root.feed.title) || feed.title;
    items = asArray(root.feed.entry).map((i: any) => {
      const links = asArray(i.link);
      const chosen = links.find((l: any) => l['@_rel'] === 'alternate') || links[0];
      return {
        title: textOf(i.title) || 'Untitled article',
        link: absoluteUrl(textOf(chosen), feed.siteUrl),
        id: textOf(i.id) || textOf(chosen) || textOf(i.title),
        summary: cleanSummary(i.summary || i.content),
        contentHtml: textOf(i.content || i.summary),
        publishedAt: dateValue(i.published || i.updated),
        author: textOf(i.author?.name || i.author)
      };
    });
  } else {
    throw new Error('Unsupported feed format. Expected RSS or Atom.');
  }

  return items
    .filter((i) => i.link)
    .map(
      (i) =>
        ({
          id: `${feed.id}:${stableId(i.id || i.link)}`,
          feedId: feed.id,
          feedTitle: channelTitle,
          title: i.title,
          link: absoluteUrl(i.link, feed.siteUrl),
          summary: i.summary,
          publishedAt: i.publishedAt,
          author: i.author,
          read: false,
          contentHtml: i.contentHtml
        } as Post)
    );
}
