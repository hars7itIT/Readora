import type { Post } from '../../types/index';

export interface BlogrollEdge {
  sourceDomain: string;
  targetDomain: string;
  sourceFeedTitle: string;
  targetUrl: string;
  contextText: string;
}

export class BlogrollService {
  private edges: BlogrollEdge[] = [
    {
      sourceDomain: 'jvns.ca',
      targetDomain: 'css-tricks.com',
      sourceFeedTitle: 'Julia Evans',
      targetUrl: 'https://css-tricks.com',
      contextText: 'Julia Evans frequently links to CSS-Tricks in browser debugging guides.'
    },
    {
      sourceDomain: 'github.blog',
      targetDomain: 'blog.cloudflare.com',
      sourceFeedTitle: 'GitHub Blog',
      targetUrl: 'https://blog.cloudflare.com',
      contextText: 'GitHub Blog references Cloudflare Blog on infrastructure scaling and edge networks.'
    },
    {
      sourceDomain: 'buzz.blogger.com',
      targetDomain: 'code.blogger.com',
      sourceFeedTitle: 'Blogger Buzz',
      targetUrl: 'http://code.blogger.com',
      contextText: 'Blogger Buzz links to Blogger Developers Network for API v3 documentation.'
    },
    {
      sourceDomain: 'smashingmagazine.com',
      targetDomain: 'hacks.mozilla.org',
      sourceFeedTitle: 'Smashing Magazine',
      targetUrl: 'https://hacks.mozilla.org',
      contextText: 'Smashing Magazine cites Mozilla Hacks for web standards and Firefox engine updates.'
    }
  ];

  /**
   * Scans a post for outbound links to discover blogroll "A links to B" edges
   */
  extractEdgesFromPost(post: Post): BlogrollEdge[] {
    const html = post.contentHtml || post.articleHtml || '';
    if (!html) return [];

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a[href^="http"]');
    const newEdges: BlogrollEdge[] = [];

    const sourceDomain = (() => {
      try {
        return new URL(post.link).hostname.replace(/^www\./, '');
      } catch {
        return post.feedTitle.toLowerCase().replace(/\s+/g, '');
      }
    })();

    links.forEach((linkEl) => {
      const href = linkEl.getAttribute('href') || '';
      try {
        const targetDomain = new URL(href).hostname.replace(/^www\./, '');
        if (targetDomain && targetDomain !== sourceDomain && !targetDomain.includes('google.com') && !targetDomain.includes('twitter.com')) {
          const edge: BlogrollEdge = {
            sourceDomain,
            targetDomain,
            sourceFeedTitle: post.feedTitle,
            targetUrl: href,
            contextText: `Mentioned in "${post.title}"`
          };
          newEdges.push(edge);
        }
      } catch {}
    });

    this.edges.push(...newEdges);
    return newEdges;
  }

  getEdges(): BlogrollEdge[] {
    return this.edges;
  }

  getLinksForBlog(domain: string): BlogrollEdge[] {
    const clean = domain.replace(/^www\./, '').toLowerCase();
    return this.edges.filter(
      (e) => e.sourceDomain.toLowerCase() === clean || e.targetDomain.toLowerCase() === clean
    );
  }
}

export const blogrollService = new BlogrollService();
