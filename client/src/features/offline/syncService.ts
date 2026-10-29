import { db } from './localDatabase';
import { fetchAndPersistFeed } from '../feeds/feedService';
import type { Feed } from '../../types/index';

export async function syncAllFeeds(feeds: Feed[]): Promise<{ successful: number; failed: number; errors: string[] }> {
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const feed of feeds) {
    try {
      await fetchAndPersistFeed(feed);
      successful++;
    } catch (err) {
      failed++;
      errors.push(`${feed.title}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { successful, failed, errors };
}
