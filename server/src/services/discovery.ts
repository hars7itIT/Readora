import { MongoClient, type Collection, type Db } from 'mongodb';
import { normalizeFeedUrl } from '../utils/normalizeUrl.js';
import { resolvePublicAddress } from '../utils/publicAddress.js';

export interface FeedCount { _id: string; count: number; title: string; updatedAt: Date; }
export interface PairCount { _id: string; a: string; b: string; count: number; updatedAt: Date; }
let client: MongoClient | undefined;
let db: Db | undefined;
let feedCounts: Collection<FeedCount>;
let pairCounts: Collection<PairCount>;

const SEED = [
  ['https://news.ycombinator.com/rss', 'Hacker News', 24],
  ['https://jvns.ca/atom.xml', 'Julia Evans', 18],
  ['https://css-tricks.com/feed/', 'CSS-Tricks', 16],
  ['https://www.smashingmagazine.com/feed/', 'Smashing Magazine', 15],
  ['https://www.theverge.com/rss/index.xml', 'The Verge', 22],
  ['https://feeds.arstechnica.com/arstechnica/index', 'Ars Technica', 20],
  ['https://feeds.npr.org/1001/rss.xml', 'NPR News', 19],
  ['https://www.nasa.gov/feed/', 'NASA', 14],
  ['https://hacks.mozilla.org/feed/', 'Mozilla Hacks', 12],
  ['https://github.blog/feed/', 'GitHub Blog', 21],
  ['https://blog.cloudflare.com/rss/', 'Cloudflare Blog', 13],
  ['https://newsletter.pragmaticengineer.com/feed', 'The Pragmatic Engineer', 17]
] as const;

export async function connectDiscovery(uri: string, dbName: string) {
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  db = client.db(dbName);
  feedCounts = db.collection<FeedCount>('feed_counts');
  pairCounts = db.collection<PairCount>('feed_pairs');
  await Promise.all([feedCounts.createIndex({ count: -1 }), pairCounts.createIndex({ a: 1, b: 1 }, { unique: true })]);
  for (const [url, title, count] of SEED) {
    const normalized = normalizeFeedUrl(url);
    await feedCounts.updateOne({ _id: normalized }, { $setOnInsert: { title, count, updatedAt: new Date() } }, { upsert: true });
  }
  // Seed a few aggregate co-subscription relationships for a non-empty demo Discover page.
  const pairs: [number, number, number][] = [[0, 1, 8], [0, 2, 6], [1, 2, 7], [3, 8, 5], [4, 5, 9], [9, 10, 6], [0, 9, 4], [5, 6, 5]];
  for (const [a, b, count] of pairs) {
    const first = normalizeFeedUrl(SEED[a][0]); const second = normalizeFeedUrl(SEED[b][0]);
    const [left, right] = [first, second].sort();
    await pairCounts.updateOne({ _id: `${left}::${right}` }, { $setOnInsert: { a: left, b: right, count, updatedAt: new Date() } }, { upsert: true });
  }
}
export function discoveryReady() { return Boolean(db); }
export async function normalizeBatch(feeds: unknown): Promise<string[]> {
  if (!Array.isArray(feeds)) throw new Error('feeds must be an array.');
  if (feeds.length > 50) throw new Error('A batch can contain at most 50 feeds.');
  const normalized: string[] = [];
  for (const f of feeds) {
    if (typeof f !== 'string' || f.length > 2048) throw new Error('Each feed URL must be a string up to 2048 characters.');
    const url = normalizeFeedUrl(f);
    const host = new URL(url).hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('Private/local feed URLs are not allowed.');
    await resolvePublicAddress(host);
    normalized.push(url);
  }
  return [...new Set(normalized)];
}
export async function submitBatch(rawFeeds: unknown) {
  ensureReady();
  const feeds = await normalizeBatch(rawFeeds);
  if (feeds.length < 1) throw new Error('Choose at least one feed to share.');
  const now = new Date();
  // Aggregates only: no per-client record or persistent client identifier is written.
  for (const url of feeds) await feedCounts.updateOne({ _id: url }, { $inc: { count: 1 }, $set: { updatedAt: now }, $setOnInsert: { title: titleFromUrl(url) } }, { upsert: true });
  for (let i = 0; i < feeds.length; i++) for (let j = i + 1; j < feeds.length; j++) {
    const [a, b] = [feeds[i], feeds[j]].sort();
    await pairCounts.updateOne({ _id: `${a}::${b}` }, { $inc: { count: 1 }, $set: { updatedAt: now }, $setOnInsert: { a, b } }, { upsert: true });
  }
  return { accepted: feeds.length, message: 'Anonymous aggregate counts updated.' };
}
export async function popularFeeds(limit = 12) {
  ensureReady();
  const docs = await feedCounts.find({}).sort({ count: -1 }).limit(limit).toArray();
  return docs.map((d) => ({ url: d._id, title: d.title || titleFromUrl(d._id), count: d.count, reason: 'Popular among opted-in reader samples' }));
}
export async function recommendFeeds(rawFeeds: unknown, limit = 12) {
  ensureReady();
  const own = await normalizeBatch(rawFeeds);
  const ownSet = new Set(own);
  const pairDocs = own.length ? await pairCounts.find({ $or: [{ a: { $in: own } }, { b: { $in: own } }] }).toArray() : [];
  const scores = new Map<string, { score: number; overlap: number }>();
  for (const p of pairDocs) {
    const candidate = ownSet.has(p.a) ? p.b : p.a;
    if (ownSet.has(candidate)) continue;
    const current = scores.get(candidate) || { score: 0, overlap: 0 };
    current.score += p.count; current.overlap += 1; scores.set(candidate, current);
  }
  const popular = await feedCounts.find({}).sort({ count: -1 }).limit(40).toArray();
  for (const p of popular) {
    if (ownSet.has(p._id)) continue;
    const current = scores.get(p._id) || { score: 0, overlap: 0 };
    current.score += Math.log2(p.count + 1); scores.set(p._id, current);
  }
  const urls = [...scores.keys()];
  const docs = urls.length ? await feedCounts.find({ _id: { $in: urls } }).toArray() : [];
  const byUrl = new Map(docs.map(d => [d._id, d]));
  return [...scores.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, limit).map(([url, s]) => ({
    url, title: byUrl.get(url)?.title || titleFromUrl(url), count: byUrl.get(url)?.count || 0,
    reason: s.overlap ? `Frequently followed alongside ${s.overlap} of your feeds` : 'Popular among opted-in reader samples'
  }));
}
function ensureReady() { if (!db) throw new Error('Discovery database is not connected. Configure MONGODB_URI.'); }
function titleFromUrl(url: string) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } }
