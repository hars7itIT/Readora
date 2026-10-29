import { normalizeFeedUrl, extractDomainTitle } from '../utils/normalizeUrl.js';

export interface BatchItem {
  id: string;
  createdAt: number;
  expiresAt: number;
  size: number;
  weight: number;
  feeds: string[];
  isSeed?: boolean;
}

export interface RecommendationResult {
  url: string;
  title: string;
  score: number;
  type: 'recommended' | 'popular';
  reasons: string[];
}

export interface StoredFeed {
  id: string;
  urlNormalized: string;
  title: string;
}

// In-memory discovery store conforming to PS-003 schema & operations
class DiscoveryStore {
  private batches: Map<string, BatchItem> = new Map();
  private feeds: Map<string, StoredFeed> = new Map();
  private rateLimits: Map<string, { count: number; windowStart: number; expiresAt: number }> = new Map();

  constructor() {
    this.seedInitialDataset();
  }

  // Pre-populated discovery dataset with 35 synthetic batches in realistic clusters (tech, design, writing, science)
  private seedInitialDataset() {
    const techCluster = [
      'https://news.ycombinator.com/rss',
      'https://jvns.ca/atom.xml',
      'https://github.blog/feed',
      'https://blog.cloudflare.com/rss',
      'https://newsletter.pragmaticengineer.com/feed',
      'https://hacks.mozilla.org/feed'
    ];

    const designCluster = [
      'https://css-tricks.com/feed',
      'https://smashingmagazine.com/feed',
      'https://alistapart.com/main/feed',
      'https://sidebar.io/feed.xml',
      'https://codrops.com/feed'
    ];

    const writingCultureCluster = [
      'https://buzz.blogger.com/feeds/posts/default',
      'https://theverge.com/rss/index.xml',
      'https://feeds.arstechnica.com/arstechnica/index',
      'https://feeds.npr.org/1001/rss.xml',
      'https://danluu.com/atom.xml',
      'https://ribbonfarm.com/feed'
    ];

    const scienceCluster = [
      'https://nasa.gov/feed',
      'https://quantamagazine.org/feed',
      'https://nature.com/nature.rss',
      'https://scientificamerican.com/rss'
    ];

    const allClusters = [techCluster, designCluster, writingCultureCluster, scienceCluster];
    const now = Date.now();
    const farFuture = now + 365 * 24 * 60 * 60 * 1000; // Seed batches do not expire during demo period

    let batchCount = 0;

    // Generate ~35 realistic overlapping clusters
    for (let i = 0; i < 35; i++) {
      const primaryCluster = allClusters[i % allClusters.length];
      const secondaryCluster = allClusters[(i + 1) % allClusters.length];

      // Pick 3-5 feeds from primary cluster and 1-2 from secondary
      const chosen = new Set<string>();
      for (const f of primaryCluster) {
        if (Math.random() > 0.3) chosen.add(f);
      }
      for (const f of secondaryCluster) {
        if (Math.random() > 0.6) chosen.add(f);
      }

      if (chosen.size < 3) {
        primaryCluster.slice(0, 3).forEach((f) => chosen.add(f));
      }

      const feedList = Array.from(chosen);
      const size = feedList.length;
      const weight = 1 / Math.sqrt(size); // App-level weight calculation

      const batchId = `seed-batch-${++batchCount}`;
      this.batches.set(batchId, {
        id: batchId,
        createdAt: now,
        expiresAt: farFuture,
        size,
        weight,
        feeds: feedList,
        isSeed: true
      });

      for (const url of feedList) {
        if (!this.feeds.has(url)) {
          this.feeds.set(url, {
            id: url,
            urlNormalized: url,
            title: extractDomainTitle(url)
          });
        }
      }
    }
  }

  public addBatch(feedUrls: string[], ttlDays = 90): BatchItem {
    const normalized = Array.from(new Set(feedUrls.map(normalizeFeedUrl)));
    if (normalized.length === 0) {
      throw new Error('Batch cannot be empty.');
    }
    if (normalized.length > 100) {
      throw new Error('Batch exceeds maximum allowed size of 100 feeds.');
    }

    const now = Date.now();
    const expiresAt = now + ttlDays * 24 * 60 * 60 * 1000;
    const size = normalized.length;
    const weight = 1 / Math.sqrt(size);
    const id = `batch-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;

    const batch: BatchItem = {
      id,
      createdAt: now,
      expiresAt,
      size,
      weight,
      feeds: normalized,
      isSeed: false
    };

    this.batches.set(id, batch);

    for (const url of normalized) {
      if (!this.feeds.has(url)) {
        this.feeds.set(url, {
          id: url,
          urlNormalized: url,
          title: extractDomainTitle(url)
        });
      }
    }

    return batch;
  }

  public getActiveBatches(now = Date.now()): BatchItem[] {
    const active: BatchItem[] = [];
    for (const b of this.batches.values()) {
      if (b.expiresAt >= now) {
        active.push(b);
      }
    }
    return active;
  }

  public cleanupExpired(now = Date.now()): { deletedBatches: number; deletedRateLimits: number } {
    let deletedBatches = 0;
    for (const [id, b] of this.batches.entries()) {
      if (!b.isSeed && b.expiresAt < now) {
        this.batches.delete(id);
        deletedBatches++;
      }
    }

    let deletedRateLimits = 0;
    for (const [key, rl] of this.rateLimits.entries()) {
      if (rl.expiresAt < now) {
        this.rateLimits.delete(key);
        deletedRateLimits++;
      }
    }

    return { deletedBatches, deletedRateLimits };
  }

  public getPopularFeeds(excludeFeeds: string[] = [], limit = 10, now = Date.now()): RecommendationResult[] {
    const active = this.getActiveBatches(now);
    const excludeSet = new Set(excludeFeeds.map(normalizeFeedUrl));
    const counts = new Map<string, number>();

    for (const b of active) {
      for (const f of b.feeds) {
        if (!excludeSet.has(f)) {
          counts.set(f, (counts.get(f) || 0) + 1);
        }
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([url, count]) => ({
        url,
        title: this.feeds.get(url)?.title || extractDomainTitle(url),
        score: count,
        type: 'popular',
        reasons: ['Popular with readers']
      }));
  }

  // Exact PECathon PS-003 algorithm
  public getRecommendations(
    userFeeds: string[],
    k = 2,
    limit = 10,
    now = Date.now()
  ): RecommendationResult[] {
    // 1. Normalize and validate input, dedupe, cap length. This is U.
    const uList = Array.from(
      new Set(
        userFeeds
          .filter(Boolean)
          .slice(0, 100)
          .map((f) => {
            try {
              return normalizeFeedUrl(f);
            } catch {
              return '';
            }
          })
          .filter(Boolean)
      )
    );
    const uSet = new Set(uList);

    // 2. If U is empty -> return popular feeds labeled "popular"
    if (uSet.size === 0) {
      return this.getPopularFeeds([], limit, now);
    }

    const active = this.getActiveBatches(now);

    // Calculate total non-expired batches containing each candidate (for damping)
    const totalBatchesContaining = new Map<string, number>();
    for (const b of active) {
      for (const f of b.feeds) {
        totalBatchesContaining.set(f, (totalBatchesContaining.get(f) || 0) + 1);
      }
    }

    // 3. Fetch all non-expired batches that contain at least one feed in U.
    const scoreMap = new Map<string, number>();
    const batchCountMap = new Map<string, number>();
    const reasonsMap = new Map<string, Map<string, number>>();

    for (const b of active) {
      const overlappingFeedsInU: string[] = [];
      for (const f of b.feeds) {
        if (uSet.has(f)) {
          overlappingFeedsInU.push(f);
        }
      }

      if (overlappingFeedsInU.length === 0) continue;

      const overlap = overlappingFeedsInU.length;

      // 4. For each candidate c not in U:
      for (const c of b.feeds) {
        if (uSet.has(c)) continue; // Step 7: Exclude every feed in U (hard rule)

        const currentScore = scoreMap.get(c) || 0;
        scoreMap.set(c, currentScore + b.weight * overlap);

        const currentBatchCount = batchCountMap.get(c) || 0;
        batchCountMap.set(c, currentBatchCount + 1);

        if (!reasonsMap.has(c)) {
          reasonsMap.set(c, new Map());
        }
        const feedReasons = reasonsMap.get(c)!;
        for (const uFeed of overlappingFeedsInU) {
          feedReasons.set(uFeed, (feedReasons.get(uFeed) || 0) + 1);
        }
      }
    }

    // 5. Popularity damping: divide score[c] by sqrt(totalBatchesContaining(c))
    // 6. Drop candidates with batchCount[c] < k
    const candidates: RecommendationResult[] = [];

    for (const [c, rawScore] of scoreMap.entries()) {
      const batchCount = batchCountMap.get(c) || 0;
      if (batchCount < k) continue; // Drop below threshold

      const totalCount = totalBatchesContaining.get(c) || 1;
      const dampedScore = rawScore / Math.sqrt(totalCount);

      // Top 2-3 co-occurring reasons
      const reasonEntries = Array.from(reasonsMap.get(c)?.entries() || [])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([uFeed]) => extractDomainTitle(uFeed));

      const reasonText = reasonEntries.length > 0
        ? `Suggested because readers of ${reasonEntries.join(' and ')} also follow it`
        : 'Suggested by reader community';

      candidates.push({
        url: c,
        title: this.feeds.get(c)?.title || extractDomainTitle(c),
        score: Number(dampedScore.toFixed(3)),
        type: 'recommended',
        reasons: [reasonText]
      });
    }

    // 8. Sort by score descending; break ties by popularity
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const popA = totalBatchesContaining.get(a.url) || 0;
      const popB = totalBatchesContaining.get(b.url) || 0;
      return popB - popA;
    });

    const results = candidates.slice(0, limit);

    // 9. If fewer than 10 results, fill with popular feeds labeled "popular"
    if (results.length < limit) {
      const excludeAlready = new Set([...uList, ...results.map((r) => r.url)]);
      const popular = this.getPopularFeeds(Array.from(excludeAlready), limit - results.length, now);
      for (const p of popular) {
        results.push(p);
      }
    }

    return results;
  }
}

export const discoveryStore = new DiscoveryStore();
