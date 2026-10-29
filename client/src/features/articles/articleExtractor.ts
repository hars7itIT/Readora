import { Readability } from '@mozilla/readability';
import { fetchRaw } from '../../lib/apiClient';
import { sanitizeArticleHtml } from './articleSanitizer';
import { db } from '../offline/localDatabase';
import type { Post } from '../../types/index';

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export async function extractAndCacheArticle(post: Post): Promise<string> {
  const { text } = await fetchRaw(post.link);
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const parsed = new Readability(doc).parse();

  const rawHtml = parsed?.content || post.contentHtml || `<p>${escapeHtml(post.summary || 'Full text is unavailable for this article.')}</p>`;
  const sanitized = sanitizeArticleHtml(rawHtml);

  await db.posts.update(post.id, { articleHtml: sanitized, read: true });
  return sanitized;
}
