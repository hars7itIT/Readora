import { db } from '../offline/localDatabase';
import { BLOGGER_API_KEY, BLOGGER_BLOGS, BLOGGER_SAMPLE_POSTS, BLOGGER_USER_BLOG_LIST } from './bloggerData';
import { calculateReadingTimeMinutes } from '../articles/readingTime';
import type { Feed, Post } from '../../types/index';
import type { BloggerBlog, BloggerBlogList, BloggerPostItem } from './bloggerTypes';

export class BloggerService {
  public readonly apiKey = BLOGGER_API_KEY;

  /**
   * Clears ALL existing posts from the database (sare post delete karde)
   * and populates the official Blogger blogs & authentic real-time post links (isko daal).
   */
  async clearAllPostsAndLoadBlogger(): Promise<{
    clearedPostsCount: number;
    loadedPostsCount: number;
    loadedFeedsCount: number;
  }> {
    const existingPostCount = await db.posts.count();

    // 1. Wipe all existing posts completely
    await db.posts.clear();

    // 2. Remove old placeholder sample feeds (authors and photo albums)
    try {
      await db.feeds.where('id').startsWith('author-').delete();
      await db.feeds.where('id').startsWith('album-').delete();
    } catch {
      // ignore
    }

    // 3. Map Blogger Blogs into Feeds
    const now = Date.now();
    const blogIdToFeedMap = new Map<string, Feed>();

    const feeds: Feed[] = BLOGGER_BLOGS.map((blog, idx) => {
      const feedId = `blogger-${blog.id}`;
      const feed: Feed = {
        id: feedId,
        title: blog.name,
        siteUrl: blog.url,
        feedUrl: `${blog.url.replace(/\/$/, '')}/feeds/posts/default`,
        addedAt: now - (idx * 3600000),
        authorInfo: {
          username: blog.id === '4967929378133675647' ? 'brettmorgan' : 'bloggerteam',
          email: blog.id === '4967929378133675647' ? 'brett@google.com' : 'buzz@blogger.com',
          city: blog.locale?.country || 'Mountain View',
          website: blog.url,
          companyName: 'Blogger / Google',
          catchPhrase: blog.description || 'Independent blogging on the open web.'
        }
      };
      blogIdToFeedMap.set(blog.id, feed);
      return feed;
    });

    // 4. Map Blogger Posts into typed Post items with authentic live links
    const posts: Post[] = BLOGGER_SAMPLE_POSTS.map((item, idx) => {
      const parentFeed = blogIdToFeedMap.get(item.blog.id) || feeds[0];
      const publishedAt = new Date(item.published).getTime() || (now - idx * 3600000);
      const textOnly = (item.content || item.title).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const readingTime = calculateReadingTimeMinutes(textOnly);

      return {
        id: `blogger-post-${item.id}`,
        feedId: parentFeed.id,
        feedTitle: parentFeed.title,
        title: item.title,
        link: item.url,
        summary: textOnly.slice(0, 190) + (textOnly.length > 190 ? '…' : ''),
        contentHtml: item.content || `<p>${item.title}</p>`,
        articleHtml: item.content || `<p>${item.title}</p>`,
        publishedAt,
        author: item.author?.displayName || 'Google Blogger',
        authorUsername: item.author?.displayName?.toLowerCase().replace(/\s+/g, '') || 'blogger',
        authorWebsite: item.url,
        read: idx === 0,
        starred: idx === 1 || idx === 3,
        readingTimeMinutes: readingTime,
        tags: item.labels || ['blogger', 'api', 'independent']
      };
    });

    // 5. Atomic persist to Dexie
    await db.transaction('rw', db.feeds, db.posts, async () => {
      for (const feed of feeds) {
        await db.feeds.put(feed);
      }
      for (const post of posts) {
        await db.posts.put(post);
      }
    });

    // 6. Clean seed comments
    try {
      await db.comments.clear();
      await db.comments.bulkAdd([
        {
          id: 'comment-bdev-1',
          postId: 'blogger-post-738097307410258659',
          name: 'Chris Dev',
          email: 'chris@example.com',
          body: 'Blogger API v3 with clean JSON endpoints makes building reader apps so much easier than legacy GData.',
          createdAt: now - 3600000
        },
        {
          id: 'comment-buzz-1',
          postId: 'blogger-post-7531385161213212970',
          name: 'Sarah Lin',
          email: 'sarah@lin.net',
          body: 'The web experience on mobile is super fast. Loving the direct links presentation.',
          createdAt: now - 1800000
        }
      ]);
    } catch {}

    try {
      localStorage.setItem('blogger_migrated_v4', 'true');
    } catch {}

    // Try fetching fresh live links from Google Blogger API v3 in the background if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      void this.fetchAllLiveBloggerLinks().catch(() => {});
    }

    return {
      clearedPostsCount: existingPostCount,
      loadedPostsCount: posts.length,
      loadedFeedsCount: feeds.length
    };
  }

  /**
   * Fetch live posts dynamically from Google Blogger API v3 using the provided API Key
   */
  async fetchLivePostsForBlog(blogId: string): Promise<Post[]> {
    const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${this.apiKey}&maxResults=15`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Blogger API returned status ${response.status}`);
    }
    const data = (await response.json()) as { items?: BloggerPostItem[] };
    if (!data.items || data.items.length === 0) return [];

    const parentFeed = await db.feeds.get(`blogger-${blogId}`);
    const feedTitle = parentFeed?.title || 'Blogger Feed';

    const livePosts: Post[] = data.items.map((item) => {
      const publishedAt = new Date(item.published).getTime() || Date.now();
      const textOnly = (item.content || item.title).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        id: `blogger-post-${item.id}`,
        feedId: `blogger-${blogId}`,
        feedTitle,
        title: item.title,
        link: item.url,
        summary: textOnly.slice(0, 190) + (textOnly.length > 190 ? '…' : ''),
        contentHtml: item.content || `<p>${item.title}</p>`,
        articleHtml: item.content || `<p>${item.title}</p>`,
        publishedAt,
        author: item.author?.displayName || 'Google Blogger',
        authorUsername: item.author?.displayName?.toLowerCase().replace(/\s+/g, '') || 'blogger',
        authorWebsite: item.url,
        read: false,
        starred: false,
        readingTimeMinutes: calculateReadingTimeMinutes(textOnly),
        tags: item.labels || ['blogger', 'api']
      };
    });

    // Save live posts into Dexie
    await db.transaction('rw', db.posts, async () => {
      for (const p of livePosts) {
        const existing = await db.posts.get(p.id);
        await db.posts.put({
          ...p,
          read: existing?.read ?? p.read,
          starred: existing?.starred ?? p.starred
        });
      }
    });

    return livePosts;
  }

  /**
   * Fetch fresh live posts for all 3 Blogger blogs in parallel using the user API key
   */
  async fetchAllLiveBloggerLinks(): Promise<{ totalFetched: number }> {
    const blogIds = ['3213900', '2399953', '4967929378133675647'];
    let count = 0;
    await Promise.allSettled(
      blogIds.map(async (id) => {
        const posts = await this.fetchLivePostsForBlog(id);
        count += posts.length;
      })
    );
    return { totalFetched: count };
  }

  /**
   * Retrieve Blogger Blog metadata by URL (Blogger API v3 simulation/handler)
   * GET https://www.googleapis.com/blogger/v3/blogs/byurl?url=blog-url
   */
  getBlogByUrl(url: string): BloggerBlog | null {
    const cleanUrl = url.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();

    for (const blog of BLOGGER_BLOGS) {
      const blogClean = blog.url.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
      if (cleanUrl === blogClean || cleanUrl.includes(blog.id)) {
        return blog;
      }
    }

    if (cleanUrl.includes('blogger') || cleanUrl.includes('blogspot')) {
      const name = cleanUrl.split('.')[0];
      return {
        kind: 'blogger#blog',
        id: String(Math.abs(cleanUrl.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))),
        name: `${name.charAt(0).toUpperCase() + name.slice(1)} Blog`,
        description: `Blogger blog for ${cleanUrl}`,
        published: new Date().toISOString(),
        updated: new Date().toISOString(),
        url: `http://${cleanUrl}/`,
        selfLink: `https://www.googleapis.com/blogger/v3/blogs/byurl?url=http://${cleanUrl}/`,
        posts: { totalItems: 10, selfLink: `https://www.googleapis.com/blogger/v3/blogs/byurl?url=http://${cleanUrl}/posts` }
      };
    }

    return null;
  }

  /**
   * Retrieve a user's blogs (Blogger API v3 simulation/handler)
   */
  getUserBlogs(userId = 'self'): BloggerBlogList {
    if (userId === 'self' || userId.includes('brett')) {
      return BLOGGER_USER_BLOG_LIST;
    }
    return {
      kind: 'blogger#blogList',
      items: BLOGGER_BLOGS
    };
  }

  /**
   * Run migration on startup if not already applied
   */
  async autoMigrateIfFirstRun(): Promise<boolean> {
    try {
      const alreadyDone = localStorage.getItem('blogger_migrated_v4') === 'true';
      if (alreadyDone) return false;

      await this.clearAllPostsAndLoadBlogger();
      return true;
    } catch {
      return false;
    }
  }
}

export const bloggerService = new BloggerService();
