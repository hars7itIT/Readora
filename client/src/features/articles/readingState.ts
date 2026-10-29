import { db } from '../offline/localDatabase';
import type { Post } from '../../types/index';

export async function markPostRead(postId: string, read: boolean): Promise<void> {
  await db.posts.update(postId, { read });
}

export async function togglePostRead(post: Post): Promise<boolean> {
  const newRead = !post.read;
  await db.posts.update(post.id, { read: newRead });
  return newRead;
}
