import samplePhotosData from '../../lib/samplePhotos.json' with { type: 'json' };
import { db } from '../offline/localDatabase';
import type { Feed, Post } from '../../types/index';

export interface PhotoImportOptions {
  limit?: number; // e.g. 50 or 100 or undefined for all
}

export async function importSamplePhotos(options: PhotoImportOptions = {}): Promise<{ postsCount: number; feedsCount: number }> {
  const albumMap = new Map<number, Feed>();
  const now = Date.now();

  const allPhotos = samplePhotosData as Array<{
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
  }>;

  const targetPhotos = options.limit ? allPhotos.slice(0, options.limit) : allPhotos;

  // Create album feeds
  for (const item of targetPhotos) {
    if (!albumMap.has(item.albumId)) {
      albumMap.set(item.albumId, {
        id: `album-${item.albumId}`,
        title: `Photo Album #${item.albumId}`,
        siteUrl: `https://jsonplaceholder.typicode.com/albums/${item.albumId}`,
        feedUrl: `https://jsonplaceholder.typicode.com/albums/${item.albumId}/photos`,
        addedAt: now - (15 - item.albumId) * 86400000
      });
    }
  }

  // Map to Post items
  const posts: Post[] = targetPhotos.map((item, index) => {
    const publishedAt = now - (targetPhotos.length - index) * 1800000; // 30 min spacing
    const contentHtml = `
      <figure style="margin: 0 0 16px 0; text-align: center;">
        <img src="${item.url}" alt="${item.title}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" loading="lazy" />
        <figcaption style="margin-top: 8px; color: #64748b; font-size: 13px;">${item.title} (Photo #${item.id})</figcaption>
      </figure>
      <p>A visual gallery feature from <strong>Album #${item.albumId}</strong>. Full resolution image available above.</p>
    `.trim();

    return {
      id: `photo-post-${item.id}`,
      feedId: `album-${item.albumId}`,
      feedTitle: `Photo Album #${item.albumId}`,
      title: item.title,
      link: item.url,
      summary: `Photograph #${item.id} from Album #${item.albumId}`,
      thumbnailUrl: item.thumbnailUrl,
      imageUrl: item.url,
      contentHtml,
      articleHtml: contentHtml,
      publishedAt,
      author: `Photographer #${item.albumId}`,
      read: item.id <= 8,
      starred: item.id % 9 === 0,
      readingTimeMinutes: 1,
      tags: ['photo', `album${item.albumId}`, 'visual']
    };
  });

  // Save feeds and posts into Dexie
  await db.transaction('rw', db.feeds, db.posts, async () => {
    for (const feed of albumMap.values()) {
      await db.feeds.put(feed);
    }
    for (const post of posts) {
      await db.posts.put(post);
    }
  });

  return { postsCount: posts.length, feedsCount: albumMap.size };
}
