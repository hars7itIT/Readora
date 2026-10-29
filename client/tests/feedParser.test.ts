import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeedXml } from '../src/features/feeds/feedParser';

const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sample Blog</title>
    <link>https://example.com</link>
    <description>A test blog</description>
    <item>
      <title>First Post</title>
      <link>https://example.com/first-post</link>
      <description><![CDATA[<p>Summary of first post</p>]]></description>
      <pubDate>Thu, 29 Oct 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

test('feedParser: correctly parses standard RSS 2.0 channel and items', () => {
  const posts = parseFeedXml(sampleRss, {
    id: 'test-feed',
    title: 'Sample Blog',
    siteUrl: 'https://example.com',
    feedUrl: 'https://example.com/rss.xml',
    addedAt: Date.now()
  });

  assert.equal(posts.length, 1);
  assert.equal(posts[0].title, 'First Post');
  assert.equal(posts[0].link, 'https://example.com/first-post');
  assert.equal(posts[0].feedTitle, 'Sample Blog');
  assert.equal(posts[0].summary, 'Summary of first post');
});

test('feedParser: throws error on malformed XML', () => {
  assert.throws(
    () => {
      parseFeedXml('<rss><channel><title>Broken', {
        id: 'test-feed',
        title: 'Broken',
        siteUrl: 'https://example.com',
        feedUrl: 'https://example.com/rss.xml',
        addedAt: Date.now()
      });
    },
    /malformed XML/i
  );
});
