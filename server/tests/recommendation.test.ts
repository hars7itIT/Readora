import test from 'node:test';
import assert from 'node:assert/strict';

test('Overlap scoring algorithm unit test', () => {
  const ownFeeds = new Set(['https://a.com/feed', 'https://b.com/feed']);
  const pairs = [
    { a: 'https://a.com/feed', b: 'https://c.com/feed', count: 5 },
    { a: 'https://b.com/feed', b: 'https://c.com/feed', count: 3 },
    { a: 'https://a.com/feed', b: 'https://d.com/feed', count: 2 }
  ];

  const scores = new Map<string, { score: number; overlap: number }>();
  for (const p of pairs) {
    const candidate = ownFeeds.has(p.a) ? p.b : p.a;
    if (ownFeeds.has(candidate)) continue;
    const current = scores.get(candidate) || { score: 0, overlap: 0 };
    current.score += p.count;
    current.overlap += 1;
    scores.set(candidate, current);
  }

  const cScore = scores.get('https://c.com/feed');
  assert.ok(cScore);
  assert.equal(cScore.score, 8);
  assert.equal(cScore.overlap, 2);

  const dScore = scores.get('https://d.com/feed');
  assert.ok(dScore);
  assert.equal(dScore.score, 2);
  assert.equal(dScore.overlap, 1);
});
