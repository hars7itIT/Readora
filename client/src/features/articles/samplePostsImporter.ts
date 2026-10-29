import samplePostsData from '../../lib/samplePosts.json' with { type: 'json' };
import sampleUsersData from '../../lib/sampleUsers.json' with { type: 'json' };
import { db } from '../offline/localDatabase';
import { calculateReadingTimeMinutes } from './readingTime';
import { commentService } from './commentService';
import type { AuthorProfile, Feed, Post } from '../../types/index';

export async function importSamplePosts(): Promise<{ postsCount: number; feedsCount: number }> {
  const users = sampleUsersData as AuthorProfile[];
  const userMap = new Map<number, AuthorProfile>(users.map((u) => [u.id, u]));
  const authorFeedsMap = new Map<number, Feed>();
  const now = Date.now();

  // Create author feeds for users 1 to 10 with their real names and websites
  for (const user of users) {
    const feedId = `author-${user.id}`;
    const feed: Feed = {
      id: feedId,
      title: `${user.name}'s Blog`,
      siteUrl: `https://${user.website}`,
      feedUrl: `https://${user.website}/feed.xml`,
      addedAt: now - (11 - user.id) * 86400000,
      authorInfo: {
        username: user.username,
        email: user.email,
        city: user.address.city,
        website: user.website,
        companyName: user.company.name,
        catchPhrase: user.company.catchPhrase
      }
    };
    authorFeedsMap.set(user.id, feed);
  }

  // Map the 100 JSON items into typed Post objects with real author info
  const posts: Post[] = (samplePostsData as Array<{ userId: number; id: number; title: string; body: string }>).map(
    (item) => {
      const user = userMap.get(item.userId);
      const authorName = user ? user.name : `Author ${item.userId}`;
      const authorUsername = user?.username;
      const authorBio = user?.company.catchPhrase;
      const authorWebsite = user?.website;
      const authorEmail = user?.email;
      const authorCompany = user?.company.name;

      const paragraphs = item.body.split('\n').filter(Boolean);
      let contentHtml = paragraphs.map((p) => `<p>${p}</p>`).join('');

      if (user) {
        contentHtml += `
          <div class="author-card-signature" style="margin-top: 28px; padding: 14px 16px; background: #f6f8f5; border-radius: 8px; border-left: 3px solid #386a4b;">
            <div style="font-weight: 600; font-size: 13px; color: #1e3827;">${user.name} <span style="font-weight: 400; color: #627163;">(@${user.username})</span></div>
            <div style="font-size: 12px; color: #4e5d4f; margin-top: 2px;">${user.company.catchPhrase}</div>
            <div style="font-size: 11px; color: #728173; margin-top: 4px;">📍 ${user.address.city} &bull; 🌐 <a href="https://${user.website}" target="_blank" rel="noreferrer" style="color: #2e593d;">${user.website}</a></div>
          </div>
        `.trim();
      }

      const readingTime = calculateReadingTimeMinutes(item.body);
      const publishedAt = now - (100 - item.id) * 3600000;

      return {
        id: `json-post-${item.id}`,
        feedId: `author-${item.userId}`,
        feedTitle: user ? `${user.name}'s Blog` : `Author #${item.userId} Feed`,
        title: item.title,
        link: user ? `https://${user.website}/posts/${item.id}` : `https://jsonplaceholder.typicode.com/posts/${item.id}`,
        summary: item.body.replace(/\n/g, ' ').slice(0, 180),
        contentHtml,
        articleHtml: contentHtml,
        publishedAt,
        author: authorName,
        authorUsername,
        authorBio,
        authorWebsite,
        authorEmail,
        authorCompany,
        read: item.id <= 12,
        starred: item.id % 7 === 0,
        readingTimeMinutes: readingTime,
        tags: [
          user ? user.username.toLowerCase() : `author${item.userId}`,
          item.id % 2 === 0 ? 'discussion' : 'essay'
        ]
      };
    }
  );

  // Save feeds and posts into IndexedDB
  await db.transaction('rw', db.feeds, db.posts, async () => {
    for (const feed of authorFeedsMap.values()) {
      await db.feeds.put(feed);
    }
    for (const post of posts) {
      await db.posts.put(post);
    }
  });

  // Seed article comments & discussions
  await commentService.importSampleComments();

  return { postsCount: posts.length, feedsCount: authorFeedsMap.size };
}
