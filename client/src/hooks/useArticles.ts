import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../features/offline/localDatabase';
import { extractAndCacheArticle } from '../features/articles/articleExtractor';
import { togglePostRead, markPostRead } from '../features/articles/readingState';
import { articleService } from '../features/articles/articleService';
import type { Post } from '../types/index';

export function useArticles(activeFeedId = 'all', searchQuery = '') {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadPosts = useCallback(async () => {
    const list = await db.posts.orderBy('publishedAt').reverse().toArray();
    setPosts(list);
    setLoading(false);
    return list;
  }, []);

  useEffect(() => {
    void reloadPosts();
  }, [reloadPosts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const feedMatches = activeFeedId === 'all' || p.feedId === activeFeedId;
      if (!feedMatches) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const tagsMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return (
        `${p.title} ${p.summary} ${p.feedTitle} ${p.author}`.toLowerCase().includes(q) || tagsMatch
      );
    });
  }, [posts, activeFeedId, searchQuery]);

  const unreadCount = useMemo(() => posts.filter((p) => !p.read).length, [posts]);
  const starredCount = useMemo(() => posts.filter((p) => p.starred).length, [posts]);

  const openArticle = async (post: Post, isOnline: boolean) => {
    setSelectedPost(post);
    if (!post.read) {
      await markPostRead(post.id, true);
      await reloadPosts();
    }
    if (!post.articleHtml && isOnline) {
      try {
        await extractAndCacheArticle(post);
        await reloadPosts();
        const updated = await db.posts.get(post.id);
        if (updated) setSelectedPost(updated);
      } catch {
        // Fall back to summary
      }
    }
  };

  const toggleReadStatus = async (post: Post) => {
    const newStatus = await togglePostRead(post);
    await reloadPosts();
    if (selectedPost?.id === post.id) {
      setSelectedPost({ ...selectedPost, read: newStatus });
    }
  };

  const toggleStarStatus = async (post: Post) => {
    const newStarred = await articleService.toggleStar(post);
    await reloadPosts();
    if (selectedPost?.id === post.id) {
      setSelectedPost({ ...selectedPost, starred: newStarred });
    }
  };

  const saveNotes = async (post: Post, notes: string) => {
    await articleService.updateNotes(post.id, notes);
    await reloadPosts();
    if (selectedPost?.id === post.id) {
      setSelectedPost({ ...selectedPost, notes });
    }
  };

  return {
    posts: filteredPosts,
    allPosts: posts,
    unreadCount,
    starredCount,
    selectedPost,
    setSelectedPost,
    loading,
    reloadPosts,
    openArticle,
    toggleReadStatus,
    toggleStarStatus,
    saveNotes
  };
}
