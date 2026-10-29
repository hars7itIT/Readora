import type { Feed } from './types';
export const sampleFeedSuggestions: Omit<Feed, 'id' | 'addedAt'>[] = [
  { title: 'Blogger Developers Network', siteUrl: 'http://code.blogger.com', feedUrl: 'http://code.blogger.com/feeds/posts/default' },
  { title: "Brett's Test Blawg", siteUrl: 'http://brettmorgan-test-blawg.blogspot.com', feedUrl: 'http://brettmorgan-test-blawg.blogspot.com/feeds/posts/default' },
  { title: 'Blogger Buzz', siteUrl: 'https://buzz.blogger.com', feedUrl: 'https://buzz.blogger.com/feeds/posts/default' },
  { title: 'Hacker News', siteUrl: 'https://news.ycombinator.com', feedUrl: 'https://news.ycombinator.com/rss' },
  { title: 'The Pragmatic Engineer', siteUrl: 'https://newsletter.pragmaticengineer.com', feedUrl: 'https://newsletter.pragmaticengineer.com/feed' },
  { title: 'Julia Evans', siteUrl: 'https://jvns.ca', feedUrl: 'https://jvns.ca/atom.xml' },
  { title: 'CSS-Tricks', siteUrl: 'https://css-tricks.com', feedUrl: 'https://css-tricks.com/feed/' },
  { title: 'Smashing Magazine', siteUrl: 'https://www.smashingmagazine.com', feedUrl: 'https://www.smashingmagazine.com/feed/' },
  { title: 'The Verge', siteUrl: 'https://www.theverge.com', feedUrl: 'https://www.theverge.com/rss/index.xml' },
  { title: 'Ars Technica', siteUrl: 'https://arstechnica.com', feedUrl: 'https://feeds.arstechnica.com/arstechnica/index' },
  { title: 'NPR News', siteUrl: 'https://www.npr.org', feedUrl: 'https://feeds.npr.org/1001/rss.xml' },
  { title: 'NASA', siteUrl: 'https://www.nasa.gov', feedUrl: 'https://www.nasa.gov/feed/' },
  { title: 'Mozilla Hacks', siteUrl: 'https://hacks.mozilla.org', feedUrl: 'https://hacks.mozilla.org/feed/' },
  { title: 'GitHub Blog', siteUrl: 'https://github.blog', feedUrl: 'https://github.blog/feed/' },
  { title: 'Cloudflare Blog', siteUrl: 'https://blog.cloudflare.com', feedUrl: 'https://blog.cloudflare.com/rss/' }
];

export const edgeCaseTestFeeds = [
  { label: 'Site with No Feed', url: 'https://example.com', expectedResult: 'Triggers autodiscovery probe and reports no feed found.' },
  { label: 'Dead Feed (404/Offline)', url: 'https://example.com/dead-feed-404.xml', expectedResult: 'Isolated error notification without breaking other feeds.' },
  { label: 'Extraction-Failure Page', url: 'https://example.com/empty-content', expectedResult: 'Falls back gracefully to RSS summary text.' },
  { label: 'Duplicate URL Variant A (HTTP)', url: 'http://jvns.ca/atom.xml', expectedResult: 'Normalizes to https://jvns.ca/atom.xml.' },
  { label: 'Duplicate URL Variant B (WWW)', url: 'https://www.jvns.ca/atom.xml', expectedResult: 'Normalizes to https://jvns.ca/atom.xml.' },
  { label: 'Duplicate URL Variant C (Trailing Slash)', url: 'https://jvns.ca/atom.xml/', expectedResult: 'Normalizes to https://jvns.ca/atom.xml.' }
];
