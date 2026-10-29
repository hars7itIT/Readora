import { useState, useEffect, useCallback } from 'react';
import { db } from '../features/offline/localDatabase';
import { addSubscription, removeSubscription, updateFeedFolderAndTags } from '../features/feeds/feedService';
import { discoverFeed } from '../features/feeds/feedDiscovery';
import { syncAllFeeds } from '../features/offline/syncService';
import type { Feed } from '../types/index';

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  const reloadFeeds = useCallback(async () => {
    const list = await db.feeds.orderBy('addedAt').reverse().toArray();
    setFeeds(list);
    setLoading(false);
    return list;
  }, []);

  useEffect(() => {
    void reloadFeeds();
  }, [reloadFeeds]);

  const addFeedByUrl = async (inputUrl: string, folder?: string, tags?: string[]) => {
    const discovered = await discoverFeed(inputUrl);
    const feed = await addSubscription(discovered.title, discovered.siteUrl, discovered.feedUrl, folder, tags);
    await reloadFeeds();
    return feed;
  };

  const removeFeedById = async (id: string) => {
    await removeSubscription(id);
    await reloadFeeds();
  };

  const updateFeed = async (id: string, folder?: string, tags?: string[]) => {
    await updateFeedFolderAndTags(id, folder, tags);
    await reloadFeeds();
  };

  const refreshFeeds = async () => {
    setSyncing(true);
    try {
      const res = await syncAllFeeds(feeds);
      await reloadFeeds();
      return res;
    } finally {
      setSyncing(false);
    }
  };

  return {
    feeds,
    loading,
    syncing,
    reloadFeeds,
    addFeedByUrl,
    removeFeedById,
    updateFeed,
    refreshFeeds
  };
}
