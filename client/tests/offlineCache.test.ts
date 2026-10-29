import test from 'node:test';
import assert from 'node:assert/strict';

test('offlineCache: mock local database schema verification', () => {
  const schema = {
    feeds: 'id, feedUrl, addedAt',
    posts: 'id, feedId, publishedAt, read, link'
  };

  assert.ok(schema.feeds.includes('feedUrl'));
  assert.ok(schema.posts.includes('publishedAt'));
  assert.ok(schema.posts.includes('read'));
});
