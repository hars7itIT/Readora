export interface AuthorProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface Feed {
  id: string;
  title: string;
  siteUrl: string;
  feedUrl: string;
  addedAt: number;
  folder?: string;
  tags?: string[];
  etag?: string;
  lastModified?: string;
  authorInfo?: {
    username?: string;
    email?: string;
    city?: string;
    website?: string;
    companyName?: string;
    catchPhrase?: string;
  };
}

export interface Post {
  id: string;
  feedId: string;
  feedTitle: string;
  title: string;
  link: string;
  summary: string;
  publishedAt: number;
  author: string;
  authorUsername?: string;
  authorBio?: string;
  authorWebsite?: string;
  authorEmail?: string;
  authorCompany?: string;
  read: boolean;
  starred?: boolean;
  readingTimeMinutes?: number;
  tags?: string[];
  notes?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  commentCount?: number;
  contentHtml?: string;
  articleHtml?: string;
}

export interface ArticleComment {
  id: string | number;
  postId: string | number;
  name: string;
  email: string;
  body: string;
  createdAt?: number;
}

export interface DiscoveryFeed {
  url: string;
  title: string;
  count: number;
  reason?: string;
}

export type PageView =
  | 'landing'
  | 'inbox'
  | 'unread'
  | 'saved'
  | 'starred'
  | 'reader'
  | 'discover'
  | 'subscriptions'
  | 'settings'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'auth-callback'
  | 'account';
