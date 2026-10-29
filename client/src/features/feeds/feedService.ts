import { fetchRaw } from '../../lib/apiClient';
import { parseFeedXml } from './feedParser';
import { db } from '../offline/localDatabase';
import { blogrollService } from '../discovery/blogrollService';
import type { Feed, Post } from '../../types/index';

export async function fetchAndPersistFeed(feed: Feed): Promise<Post[]> {
  const result = await fetchRaw(feed.feedUrl, {
    etag: feed.etag,
    lastModified: feed.lastModified
  });

  // If 304 Not Modified, cached articles are completely up to date!
  if (result.status === 304) {
    return await db.posts.where('feedId').equals(feed.id).toArray();
  }

  // Persist updated etag and lastModified for conditional fetching
  if (result.etag || result.lastModified) {
    await db.feeds.update(feed.id, {
      etag: result.etag || feed.etag,
      lastModified: result.lastModified || feed.lastModified
    });
  }

  const posts = parseFeedXml(result.text, feed);

  await db.transaction('rw', db.posts, async () => {
    for (const post of posts) {
      const existing = await db.posts.get(post.id);
      await db.posts.put({
        ...post,
        read: existing?.read ?? false,
        contentHtml: existing?.contentHtml || post.contentHtml,
        articleHtml: existing?.articleHtml
      });

      // Blogroll detection: Extract "A links to B" edges
      try {
        blogrollService.extractEdgesFromPost(post);
      } catch {}
    }
  });

  return posts;
}

export async function updateFeedFolderAndTags(
  feedId: string,
  folder?: string,
  tags?: string[]
): Promise<void> {
  await db.feeds.update(feedId, { folder, tags });
}

export async function addSubscription(
  title: string,
  siteUrl: string,
  feedUrl: string,
  folder?: string,
  tags?: string[]
): Promise<Feed> {
  const existing = await db.feeds.where('feedUrl').equals(feedUrl).first();
  if (existing) {
    throw new Error('You already follow this feed.');
  }

  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const feed: Feed = {
    id,
    title,
    siteUrl,
    feedUrl,
    addedAt: Date.now(),
    folder: folder || undefined,
    tags: tags || []
  };

  await db.feeds.put(feed);
  try {
    await fetchAndPersistFeed(feed);
  } catch {
    // Feed is saved, articles can be refreshed later
  }

  return feed;
}

export async function removeSubscription(feedId: string): Promise<void> {
  await db.transaction('rw', db.feeds, db.posts, async () => {
    await db.feeds.delete(feedId);
    // Keep saved/starred articles in the library even when unsubscribing
    const unstarredPosts = await db.posts
      .where('feedId')
      .equals(feedId)
      .filter((p) => !p.starred)
      .toArray();
    await db.posts.bulkDelete(unstarredPosts.map((p) => p.id));
  });
}
