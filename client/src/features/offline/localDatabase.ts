import Dexie, { type Table } from 'dexie';
import type { Feed, Post, ArticleComment } from '../../types/index';

export class ReaderDB extends Dexie {
  feeds!: Table<Feed, string>;
  posts!: Table<Post, string>;
  comments!: Table<ArticleComment, string | number>;

  constructor() {
    super('small-reader-v1');
    this.version(1).stores({
      feeds: 'id, feedUrl, addedAt',
      posts: 'id, feedId, publishedAt, read, link'
    });
    this.version(2).stores({
      feeds: 'id, feedUrl, addedAt',
      posts: 'id, feedId, publishedAt, read, starred, link'
    });
    this.version(3).stores({
      feeds: 'id, feedUrl, addedAt',
      posts: 'id, feedId, publishedAt, read, starred, link',
      comments: 'id, postId, createdAt'
    });
  }
}

export const db = new ReaderDB();
