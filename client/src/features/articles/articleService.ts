import { Readability } from '@mozilla/readability';
import { db } from '../offline/localDatabase';
import { extractAndCacheArticle } from './articleExtractor';
import { markPostRead, togglePostRead } from './readingState';
import { sanitizeArticleHtml } from './articleSanitizer';
import { calculateReadingTimeMinutes } from './readingTime';
import { fetchRaw } from '../../lib/apiClient';
import type { Post } from '../../types/index';

export interface CreatePostParams {
  title: string;
  author?: string;
  content: string;
  link?: string;
  tags?: string[];
  feedTitle?: string;
}

export const articleService = {
  getArticles: (feedId?: string) => {
    if (!feedId || feedId === 'all') {
      return db.posts.orderBy('publishedAt').reverse().toArray();
    }
    return db.posts.where('feedId').equals(feedId).reverse().sortBy('publishedAt');
  },

  extract: extractAndCacheArticle,
  markRead: markPostRead,
  toggleRead: togglePostRead,

  toggleStar: async (post: Post): Promise<boolean> => {
    const newStarred = !post.starred;
    await db.posts.update(post.id, { starred: newStarred });
    return newStarred;
  },

  updateNotes: async (postId: string, notes: string): Promise<void> => {
    await db.posts.update(postId, { notes });
  },

  updateTags: async (postId: string, tags: string[]): Promise<void> => {
    await db.posts.update(postId, { tags });
  },

  createPost: async (params: CreatePostParams): Promise<Post> => {
    const id = `manual:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const sanitizedHtml = sanitizeArticleHtml(params.content);
    const readingTime = calculateReadingTimeMinutes(params.content);

    const post: Post = {
      id,
      feedId: 'manual',
      feedTitle: params.feedTitle || 'Saved Notes',
      title: params.title.trim(),
      link: params.link?.trim() || `local://${id}`,
      summary: params.content.replace(/<[^>]*>/g, ' ').slice(0, 200).trim(),
      contentHtml: sanitizedHtml,
      articleHtml: sanitizedHtml,
      publishedAt: Date.now(),
      author: params.author?.trim() || 'You',
      read: false,
      starred: false,
      readingTimeMinutes: readingTime,
      tags: params.tags || []
    };

    await db.posts.put(post);
    return post;
  },

  saveArticleFromUrl: async (url: string, tags: string[] = []): Promise<Post> => {
    const cleanUrl = url.trim();
    const { text } = await fetchRaw(cleanUrl);
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const parsed = new Readability(doc).parse();

    const title = parsed?.title || doc.querySelector('title')?.textContent?.trim() || cleanUrl;
    const author = parsed?.byline || new URL(cleanUrl).hostname.replace(/^www\./, '');
    const rawContent = parsed?.content || `<p>${parsed?.excerpt || 'Full text extracted.'}</p>`;
    const safeContent = sanitizeArticleHtml(rawContent);
    const readingTime = calculateReadingTimeMinutes(safeContent);

    const id = `web:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const post: Post = {
      id,
      feedId: 'web-clips',
      feedTitle: new URL(cleanUrl).hostname.replace(/^www\./, ''),
      title,
      link: cleanUrl,
      summary: (parsed?.excerpt || '').slice(0, 250),
      contentHtml: safeContent,
      articleHtml: safeContent,
      publishedAt: Date.now(),
      author,
      read: false,
      starred: false,
      readingTimeMinutes: readingTime,
      tags
    };

    await db.posts.put(post);
    return post;
  }
};
