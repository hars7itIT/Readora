import { getDatabase } from '../config/database.js';
import { normalizeAndValidateBatch } from './feedNormalization.service.js';
import { extractDomainTitle } from '../utils/normalizeUrl.js';
import type { FeedAggregate } from '../models/FeedAggregate.model.js';
import type { CoSubscription } from '../models/CoSubscription.model.js';
import { discoveryStore } from './recommendationEngine.js';

export async function getPopularFeeds(limit = 12) {
  const db = getDatabase();
  if (!db) {
    // Seamless fallback to in-memory PS-003 store with realistic seed clusters
    return discoveryStore.getPopularFeeds([], limit).map((f) => ({
      url: f.url,
      title: f.title,
      count: f.score,
      reason: f.reasons[0] || 'Popular with readers'
    }));
  }
  try {
    const feedCounts = db.collection<FeedAggregate>('feed_counts');
    const docs = await feedCounts.find({}).sort({ count: -1 }).limit(limit).toArray();
    return docs.map((d) => ({
      url: d._id,
      title: d.title || extractDomainTitle(d._id),
      count: d.count,
      reason: 'Popular among opted-in readers'
    }));
  } catch {
    return discoveryStore.getPopularFeeds([], limit).map((f) => ({
      url: f.url,
      title: f.title,
      count: f.score,
      reason: f.reasons[0] || 'Popular with readers'
    }));
  }
}

export async function getRecommendations(rawFeeds: string[], limit = 12) {
  const db = getDatabase();
  if (!db) {
    // Seamless fallback to PS-003 recommendation algorithm
    return discoveryStore.getRecommendations(rawFeeds, 2, limit).map((f) => ({
      url: f.url,
      title: f.title,
      count: Math.round(f.score),
      reason: f.reasons[0] || 'Recommended by reader community'
    }));
  }

  try {
    const own = await normalizeAndValidateBatch(rawFeeds);
    const ownSet = new Set(own);

    const pairCounts = db.collection<CoSubscription>('feed_pairs');
    const feedCounts = db.collection<FeedAggregate>('feed_counts');

    const pairDocs = own.length
      ? await pairCounts.find({ $or: [{ a: { $in: own } }, { b: { $in: own } }] }).toArray()
      : [];

    const scores = new Map<string, { score: number; overlap: number }>();
    for (const p of pairDocs) {
      const candidate = ownSet.has(p.a) ? p.b : p.a;
      if (ownSet.has(candidate)) continue;
      const current = scores.get(candidate) || { score: 0, overlap: 0 };
      current.score += p.count;
      current.overlap += 1;
      scores.set(candidate, current);
    }

    const popular = await feedCounts.find({}).sort({ count: -1 }).limit(40).toArray();
    for (const p of popular) {
      if (ownSet.has(p._id)) continue;
      const current = scores.get(p._id) || { score: 0, overlap: 0 };
      current.score += Math.log2(p.count + 1);
      scores.set(p._id, current);
    }

    const urls = [...scores.keys()];
    const docs = urls.length ? await feedCounts.find({ _id: { $in: urls } }).toArray() : [];
    const byUrl = new Map(docs.map((d) => [d._id, d]));

    const results = [...scores.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([url, s]) => ({
        url,
        title: byUrl.get(url)?.title || extractDomainTitle(url),
        count: byUrl.get(url)?.count || 0,
        reason: s.overlap
          ? `Frequently followed alongside ${s.overlap} of your feeds`
          : 'Popular among opted-in reader samples'
      }));

    if (results.length < limit) {
      const fallback = discoveryStore.getPopularFeeds(own, limit - results.length);
      for (const f of fallback) {
        results.push({
          url: f.url,
          title: f.title,
          count: f.score,
          reason: f.reasons[0] || 'Popular with readers'
        });
      }
    }

    return results;
  } catch {
    return discoveryStore.getRecommendations(rawFeeds, 2, limit).map((f) => ({
      url: f.url,
      title: f.title,
      count: Math.round(f.score),
      reason: f.reasons[0] || 'Recommended by reader community'
    }));
  }
}

export async function submitAnonymousBatch(rawFeeds: string[]) {
  // Always update in-memory PS-003 discovery store
  const inMemoryBatch = discoveryStore.addBatch(rawFeeds);

  const db = getDatabase();
  if (!db) {
    return { accepted: inMemoryBatch.size, message: 'Anonymous aggregate batch accepted and recorded.' };
  }

  try {
    const feeds = await normalizeAndValidateBatch(rawFeeds);
    if (feeds.length < 1) {
      throw new Error('Choose at least one feed to share.');
    }

    const feedCounts = db.collection<FeedAggregate>('feed_counts');
    const pairCounts = db.collection<CoSubscription>('feed_pairs');
    const now = new Date();

    for (const url of feeds) {
      await feedCounts.updateOne(
        { _id: url as any },
        { $inc: { count: 1 }, $set: { updatedAt: now }, $setOnInsert: { title: extractDomainTitle(url) } },
        { upsert: true }
      );
    }

    for (let i = 0; i < feeds.length; i++) {
      for (let j = i + 1; j < feeds.length; j++) {
        const [a, b] = [feeds[i], feeds[j]].sort();
        await pairCounts.updateOne(
          { _id: `${a}::${b}` as any },
          { $inc: { count: 1 }, $set: { updatedAt: now }, $setOnInsert: { a, b } },
          { upsert: true }
        );
      }
    }

    return { accepted: feeds.length, message: 'Anonymous aggregate counts updated.' };
  } catch {
    return { accepted: inMemoryBatch.size, message: 'Anonymous aggregate batch accepted locally.' };
  }
}
