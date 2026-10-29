import sampleUsersData from '../../lib/sampleUsers.json' with { type: 'json' };
import { db } from '../offline/localDatabase';
import type { AuthorProfile, Feed } from '../../types/index';

export const sampleAuthors: AuthorProfile[] = sampleUsersData as AuthorProfile[];

export function getAuthorById(id: number): AuthorProfile | undefined {
  return sampleAuthors.find((a) => a.id === id);
}

export function getAuthorByName(name: string): AuthorProfile | undefined {
  return sampleAuthors.find((a) => a.name.toLowerCase() === name.toLowerCase());
}

export async function importSampleAuthors(): Promise<{ feedsCount: number }> {
  const now = Date.now();
  const feeds: Feed[] = sampleAuthors.map((user, idx) => ({
    id: `author-${user.id}`,
    title: `${user.name}'s Blog`,
    siteUrl: `https://${user.website}`,
    feedUrl: `https://${user.website}/feed.xml`,
    addedAt: now - (sampleAuthors.length - idx) * 86400000,
    authorInfo: {
      username: user.username,
      email: user.email,
      city: user.address.city,
      website: user.website,
      companyName: user.company.name,
      catchPhrase: user.company.catchPhrase
    }
  }));

  await db.transaction('rw', db.feeds, async () => {
    for (const feed of feeds) {
      await db.feeds.put(feed);
    }
  });

  return { feedsCount: feeds.length };
}
