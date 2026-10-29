import { getPopular, getRecommendations, shareSubscriptions } from '../../lib/apiClient';
import { getSharingConsent } from './sharingConsent';
import type { DiscoveryFeed } from '../../types/index';

export async function fetchDiscoveryFeeds(userFeedUrls: string[]): Promise<{ popular: DiscoveryFeed[]; recommendations: DiscoveryFeed[] }> {
  const [popular, recommendations] = await Promise.all([
    getPopular().catch(() => []),
    getRecommendations(userFeedUrls).catch(() => [])
  ]);
  return { popular, recommendations };
}

export async function submitOptInBatch(feedUrls: string[]): Promise<{ accepted: number; message: string }> {
  if (!getSharingConsent()) {
    throw new Error('Opt-in consent must be enabled prior to sharing.');
  }
  return shareSubscriptions(feedUrls);
}
