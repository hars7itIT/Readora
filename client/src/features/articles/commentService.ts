import sampleCommentsData from '../../lib/sampleComments.json' with { type: 'json' };
import { db } from '../offline/localDatabase';
import type { ArticleComment } from '../../types/index';

export const commentService = {
  async getCommentsForPost(postIdentifier: string | number): Promise<ArticleComment[]> {
    // Normalise identifier: post id could be "json-post-1", "photo-post-1", or "1"
    const numericStr = String(postIdentifier).replace(/^[a-z]+-post-/, '');
    const numId = Number(numericStr);

    try {
      const allComments = await db.comments.toArray();
      return allComments
        .filter((c) => {
          const cPostIdStr = String(c.postId).replace(/^[a-z]+-post-/, '');
          return cPostIdStr === numericStr || (!Number.isNaN(numId) && Number(c.postId) === numId);
        })
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } catch {
      return [];
    }
  },

  async addComment(params: {
    postId: string | number;
    name: string;
    email: string;
    body: string;
  }): Promise<ArticleComment> {
    const numericStr = String(params.postId).replace(/^[a-z]+-post-/, '');
    const numId = Number(numericStr);
    const resolvedPostId = Number.isNaN(numId) ? params.postId : numId;

    const newComment: ArticleComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      postId: resolvedPostId,
      name: params.name.trim(),
      email: params.email.trim(),
      body: params.body.trim(),
      createdAt: Date.now()
    };

    await db.comments.put(newComment);
    return newComment;
  },

  async importSampleComments(): Promise<{ commentsCount: number }> {
    const rawComments = sampleCommentsData as Array<{
      postId: number;
      id: number;
      name: string;
      email: string;
      body: string;
    }>;

    const now = Date.now();
    const comments: ArticleComment[] = rawComments.map((c) => ({
      id: `seed-cmt-${c.id}`,
      postId: c.postId,
      name: c.name,
      email: c.email,
      body: c.body,
      createdAt: now - (60 - c.id) * 1800000 // Staggered timestamps
    }));

    await db.transaction('rw', db.comments, async () => {
      for (const comment of comments) {
        await db.comments.put(comment);
      }
    });

    return { commentsCount: comments.length };
  }
};
