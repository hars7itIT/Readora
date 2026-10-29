export interface RecommendedBlog {
  title: string;
  url: string;
  siteUrl: string;
  description: string;
  category: string;
  domain: string;
}

export interface RecommendationTopicItem {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  recommendedBlogs: RecommendedBlog[];
}

export const RECOMMENDATION_TOPICS: RecommendationTopicItem[] = [
  {
    id: 'all',
    label: 'All Topics',
    icon: '✨',
    keywords: [],
    recommendedBlogs: [
      {
        title: 'Julia Evans',
        url: 'https://jvns.ca/atom.xml',
        siteUrl: 'https://jvns.ca',
        description: 'Deep-dive systems, Linux, debugging & programming zines.',
        category: 'Tech & Code',
        domain: 'jvns.ca'
      },
      {
        title: 'CSS-Tricks',
        url: 'https://css-tricks.com/feed/',
        siteUrl: 'https://css-tricks.com',
        description: 'Modern frontend engineering, CSS layouts & web aesthetics.',
        category: 'Design & Web',
        domain: 'css-tricks.com'
      },
      {
        title: 'Blogger Developers Network',
        url: 'https://code.blogger.com/feeds/posts/default',
        siteUrl: 'https://code.blogger.com',
        description: 'Official Blogger API v3 technical releases & web developer updates.',
        category: 'Tech & Code',
        domain: 'code.blogger.com'
      },
      {
        title: 'Smashing Magazine',
        url: 'https://www.smashingmagazine.com/feed/',
        siteUrl: 'https://www.smashingmagazine.com',
        description: 'Reliable design patterns, typography, UX & web standards.',
        category: 'Design & Web',
        domain: 'smashingmagazine.com'
      },
      {
        title: 'Blogger Buzz',
        url: 'https://buzz.blogger.com/feeds/posts/default',
        siteUrl: 'https://buzz.blogger.com',
        description: 'Official news and community highlights from the independent blogging world.',
        category: 'Indie Web',
        domain: 'buzz.blogger.com'
      },
      {
        title: 'Ars Technica',
        url: 'https://feeds.arstechnica.com/arstechnica/index',
        siteUrl: 'https://arstechnica.com',
        description: 'Science discoveries, tech policy, astrophysics & hardware analysis.',
        category: 'Science',
        domain: 'arstechnica.com'
      }
    ]
  },
  {
    id: 'tech',
    label: 'Tech & Code',
    icon: '💻',
    keywords: [
      'code',
      'javascript',
      'api',
      'linux',
      'git',
      'python',
      'rust',
      'database',
      'architecture',
      'dev',
      'web',
      'system',
      'compute',
      'server',
      'hacker',
      'engineering',
      'software',
      'performance'
    ],
    recommendedBlogs: [
      {
        title: 'Julia Evans',
        url: 'https://jvns.ca/atom.xml',
        siteUrl: 'https://jvns.ca',
        description: 'Deep-dive systems, Linux, debugging & programming zines.',
        category: 'Tech & Code',
        domain: 'jvns.ca'
      },
      {
        title: 'Blogger Developers Network',
        url: 'https://code.blogger.com/feeds/posts/default',
        siteUrl: 'https://code.blogger.com',
        description: 'Official Blogger API v3 technical releases & web developer updates.',
        category: 'Tech & Code',
        domain: 'code.blogger.com'
      },
      {
        title: 'Cloudflare Blog',
        url: 'https://blog.cloudflare.com/rss/',
        siteUrl: 'https://blog.cloudflare.com',
        description: 'Distributed networks, edge compute, DNS & security architecture.',
        category: 'Tech & Code',
        domain: 'blog.cloudflare.com'
      },
      {
        title: 'Hacker News Frontpage',
        url: 'https://news.ycombinator.com/rss',
        siteUrl: 'https://news.ycombinator.com',
        description: 'Top technology discussions, engineering essays & computer science.',
        category: 'Tech & Code',
        domain: 'news.ycombinator.com'
      }
    ]
  },
  {
    id: 'design',
    label: 'Web & Design',
    icon: '🎨',
    keywords: [
      'css',
      'design',
      'typography',
      'layout',
      'ui',
      'frontend',
      'responsive',
      'web',
      'styling',
      'accessibility',
      'colors',
      'svg',
      'animation'
    ],
    recommendedBlogs: [
      {
        title: 'CSS-Tricks',
        url: 'https://css-tricks.com/feed/',
        siteUrl: 'https://css-tricks.com',
        description: 'Modern frontend engineering, CSS layouts & web aesthetics.',
        category: 'Design & Web',
        domain: 'css-tricks.com'
      },
      {
        title: 'Smashing Magazine',
        url: 'https://www.smashingmagazine.com/feed/',
        siteUrl: 'https://www.smashingmagazine.com',
        description: 'Reliable design patterns, typography, UX & web standards.',
        category: 'Design & Web',
        domain: 'smashingmagazine.com'
      },
      {
        title: 'Mozilla Hacks',
        url: 'https://hacks.mozilla.org/feed/',
        siteUrl: 'https://hacks.mozilla.org',
        description: 'Open web standards, CSS engines, JavaScript evolution & browser tech.',
        category: 'Design & Web',
        domain: 'hacks.mozilla.org'
      }
    ]
  },
  {
    id: 'indie',
    label: 'Indie Web & Essays',
    icon: '✍️',
    keywords: [
      'blog',
      'writing',
      'personal',
      'reading',
      'independent',
      'deliberate',
      'reflection',
      'essay',
      'journal',
      'book',
      'minimalism',
      'attention'
    ],
    recommendedBlogs: [
      {
        title: 'Blogger Buzz',
        url: 'https://buzz.blogger.com/feeds/posts/default',
        siteUrl: 'https://buzz.blogger.com',
        description: 'Official news and community highlights from the independent blogging world.',
        category: 'Indie Web',
        domain: 'buzz.blogger.com'
      },
      {
        title: 'Clementina DuBuque’s Blog',
        url: 'https://jsonplaceholder.typicode.com/posts',
        siteUrl: 'https://clementina.blog',
        description: 'Quiet reflections on deliberate reading, independent writing & attention.',
        category: 'Indie Web',
        domain: 'clementina.blog'
      },
      {
        title: 'Glenna Reichert’s Journal',
        url: 'https://jsonplaceholder.typicode.com/posts',
        siteUrl: 'https://glenna.blog',
        description: 'Personal essays on digital minimalism, calm computing & literature.',
        category: 'Indie Web',
        domain: 'glenna.blog'
      }
    ]
  },
  {
    id: 'science',
    label: 'Science & Future',
    icon: '🚀',
    keywords: [
      'science',
      'space',
      'nasa',
      'astronomy',
      'research',
      'physics',
      'planet',
      'discovery',
      'earth',
      'telescope',
      'cosmos'
    ],
    recommendedBlogs: [
      {
        title: 'Ars Technica',
        url: 'https://feeds.arstechnica.com/arstechnica/index',
        siteUrl: 'https://arstechnica.com',
        description: 'Science discoveries, tech policy, astrophysics & hardware analysis.',
        category: 'Science',
        domain: 'arstechnica.com'
      },
      {
        title: 'NASA News',
        url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
        siteUrl: 'https://www.nasa.gov',
        description: 'Space missions, aeronautics, solar discoveries & planetary exploration.',
        category: 'Science',
        domain: 'nasa.gov'
      }
    ]
  },
  {
    id: 'media',
    label: 'News & Culture',
    icon: '📰',
    keywords: [
      'news',
      'verge',
      'media',
      'policy',
      'culture',
      'journalism',
      'report',
      'investigation',
      'digital',
      'society',
      'internet'
    ],
    recommendedBlogs: [
      {
        title: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        siteUrl: 'https://www.theverge.com',
        description: 'Where technology intersects with science, art, entertainment & culture.',
        category: 'News & Media',
        domain: 'theverge.com'
      },
      {
        title: 'NPR News',
        url: 'https://feeds.npr.org/1001/rss.xml',
        siteUrl: 'https://npr.org',
        description: 'Independent reporting on domestic & international stories and culture.',
        category: 'News & Media',
        domain: 'npr.org'
      }
    ]
  }
];
