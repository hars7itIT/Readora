import { useState, useCallback } from 'react';
import { fetchDiscoveryFeeds, submitOptInBatch } from '../features/discovery/discoveryService';
import { getSharingConsent, setSharingConsent } from '../features/discovery/sharingConsent';
import { maybeShare } from '../features/discovery/sharingSync';
import type { DiscoveryFeed } from '../types/index';

export function useDiscovery() {
  const [popular, setPopular] = useState<DiscoveryFeed[]>([]);
  const [recommendations, setRecommendations] = useState<DiscoveryFeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [consent, setConsentState] = useState<boolean>(getSharingConsent());
  const [error, setError] = useState<string>('');

  const loadDiscovery = useCallback(async (feedUrls: string[]) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDiscoveryFeeds(feedUrls);
      setPopular(data.popular);
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConsent = (enabled: boolean) => {
    setSharingConsent(enabled);
    setConsentState(enabled);
  };

  const shareFeeds = async (feedUrls: string[]) => {
    if (!consent) {
      setError('Please enable opt-in sharing before submitting.');
      return;
    }
    setSharing(true);
    setError('');
    try {
      const res = await submitOptInBatch(feedUrls);
      await loadDiscovery(feedUrls);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share feeds.');
    } finally {
      setSharing(false);
    }
  };

  const checkMaybeShare = useCallback(async (feedUrls: string[]) => {
    if (!consent) return;
    try {
      await maybeShare(feedUrls, submitOptInBatch);
    } catch {
      // Background check never disrupts user flow
    }
  }, [consent]);

  return {
    popular,
    recommendations,
    loading,
    sharing,
    consent,
    error,
    setError,
    loadDiscovery,
    updateConsent,
    shareFeeds,
    checkMaybeShare
  };
}
