import Dexie, { type Table } from 'dexie';
import type { Feed, Post } from './types';

class ReaderDB extends Dexie {
  feeds!: Table<Feed, string>;
  posts!: Table<Post, string>;
  constructor() {
    super('small-reader-v1');
    this.version(1).stores({ feeds: 'id, feedUrl, addedAt', posts: 'id, feedId, publishedAt, read, link' });
  }
}
export const db = new ReaderDB();
