import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeedUrl } from '../dist/utils/normalizeUrl.js';
test('normalizes host and removes fragment', () => {
  assert.equal(normalizeFeedUrl('https://EXAMPLE.com/feed#latest'), 'https://example.com/feed');
});
test('rejects non-http protocols', () => {
  assert.throws(() => normalizeFeedUrl('file:///etc/passwd'));
});
