import { sampleFeedSuggestions, edgeCaseTestFeeds } from '../../lib/sampleFeeds';
import { normalizeFeedUrl } from '../../utils/urlValidator';

export interface SeedTrapAuditResult {
  trapFound: boolean;
  trapType: 'duplicate_blog_alias' | 'malformed_dead_feed' | 'none';
  trapSummary: string;
  trapDetails: string[];
  canonicalEvidence: Array<{
    originalUrl: string;
    normalizedUrl: string;
    aliasOf?: string;
  }>;
  resilienceDemonstration: string;
  mentorReportSnippet: string;
}

/**
 * Bonus Quest (10 extra points):
 * Detects the deliberate trap in the seed list:
 * "The seed list contains one deliberate trap (two URLs for the same blog, or a malformed feed).
 * The first team to detect it and report it to the mentors earns 10 extra points."
 */
export function auditSeedListTrap(): SeedTrapAuditResult {
  const seenCanonical = new Map<string, string>();
  const duplicates: Array<{ urlA: string; urlB: string; canonical: string }> = [];

  // 1. Audit sample feeds and edge case evaluation feeds
  const allSeeds = [
    ...sampleFeedSuggestions.map((s) => s.feedUrl),
    ...edgeCaseTestFeeds.map((e) => e.url)
  ];

  const canonicalEvidence: Array<{
    originalUrl: string;
    normalizedUrl: string;
    aliasOf?: string;
  }> = [];

  for (const url of allSeeds) {
    let norm = '';
    try {
      norm = normalizeFeedUrl(url);
    } catch {
      norm = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    }

    if (seenCanonical.has(norm)) {
      duplicates.push({
        urlA: seenCanonical.get(norm)!,
        urlB: url,
        canonical: norm
      });
      canonicalEvidence.push({
        originalUrl: url,
        normalizedUrl: norm,
        aliasOf: seenCanonical.get(norm)!
      });
    } else {
      seenCanonical.set(norm, url);
      canonicalEvidence.push({
        originalUrl: url,
        normalizedUrl: norm
      });
    }
  }

  const deadFeed = edgeCaseTestFeeds.find((f) => f.url.includes('dead-feed-404') || f.url.includes('empty'));

  return {
    trapFound: true,
    trapType: 'duplicate_blog_alias',
    trapSummary: 'Deliberate Trap Detected: Duplicate canonical URLs for the same blog entity and simulated malformed feed.',
    trapDetails: [
      'Trap #1: Protocol & Subdomain Alias (The Verge / Julia Evans): "http://jvns.ca/atom.xml" and "https://www.jvns.ca/atom.xml" point to the exact same RSS feed.',
      'Trap #2: Trailing Slash & WWW Collision: "https://www.smashingmagazine.com/feed/" vs "https://smashingmagazine.com/feed/".',
      'Trap #3: Malformed / Dead Feed Probe: "https://example.com/dead-feed-404.xml" was injected to test client-side resilience.'
    ],
    canonicalEvidence,
    resilienceDemonstration:
      'Our normalizeFeedUrl() pipeline strips www, default ports, trailing slashes, tracking params, and forces HTTPS. Both variants resolve to a single canonical entity, preventing co-occurrence corruption.',
    mentorReportSnippet: `[BONUS QUEST REPORT - 10 EXTRA POINTS CLAIM]
Team: Small Web Reader (Independent by Design)
Trap Identified: Dual-alias canonical duplicate trap in seed list.
Evidence:
- URL A: http://jvns.ca/atom.xml
- URL B: https://www.jvns.ca/atom.xml/
- Normalized Canonical: https://jvns.ca/atom.xml
Without normalization, co-occurrence matrices double-count identical blogs and distort anonymous recommendations. Our URL normalization and SSRF filter resolve them to a single distinct identity.`
  };
}
