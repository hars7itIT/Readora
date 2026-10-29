import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeedUrl, extractDomainTitle } from '../src/utils/normalizeUrl.js';
import { validateBatchSubmission } from '../src/validators/discovery.schema.js';

test('URL normalization: strips hash and standard ports', () => {
  const normalized = normalizeFeedUrl('https://example.com:443/feed.xml#top');
  assert.equal(normalized, 'https://example.com/feed.xml');
});

test('Domain title extraction', () => {
  assert.equal(extractDomainTitle('https://www.jvns.ca/atom.xml'), 'jvns.ca');
  assert.equal(extractDomainTitle('https://news.ycombinator.com/rss'), 'news.ycombinator.com');
});

test('Discovery Batch Validator: rejects non-array or empty array', () => {
  const result1 = validateBatchSubmission({});
  assert.equal(result1.valid, false);

  const result2 = validateBatchSubmission({ feeds: [] });
  assert.equal(result2.valid, false);
});

test('Discovery Batch Validator: accepts valid feeds array', () => {
  const result = validateBatchSubmission({ feeds: ['https://example.com/feed.xml'] });
  assert.equal(result.valid, true);
  assert.equal(result.feeds.length, 1);
});
