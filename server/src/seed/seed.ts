import type { Db } from 'mongodb';
import blogs from './blogs.json' with { type: 'json' };
import discoverySeed from './discoverySeed.json' with { type: 'json' };
import { normalizeFeedUrl } from '../utils/normalizeUrl.js';

export async function seedDiscoveryDatabase(db: Db) {
  const feedCounts = db.collection('feed_counts');
  const pairCounts = db.collection('feed_pairs');

  await Promise.all([
    feedCounts.createIndex({ count: -1 }),
    pairCounts.createIndex({ a: 1, b: 1 }, { unique: true })
  ]);

  for (const item of blogs) {
    const normalized = normalizeFeedUrl(item.url);
    await feedCounts.updateOne(
      { _id: normalized as any },
      { $setOnInsert: { title: item.title, count: item.count, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  for (const pair of discoverySeed) {
    const first = normalizeFeedUrl(pair.a);
    const second = normalizeFeedUrl(pair.b);
    const [left, right] = [first, second].sort();
    await pairCounts.updateOne(
      { _id: `${left}::${right}` as any },
      { $setOnInsert: { a: left, b: right, count: pair.count, updatedAt: new Date() } },
      { upsert: true }
    );
  }
}
