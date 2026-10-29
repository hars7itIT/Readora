import { db } from './localDatabase';

export async function clearAllLocalCache(): Promise<void> {
  await Promise.all([db.feeds.clear(), db.posts.clear()]);
}

export async function getCacheStatistics() {
  const [feedCount, postCount] = await Promise.all([db.feeds.count(), db.posts.count()]);
  return { feedCount, postCount };
}
