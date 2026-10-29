export interface BloggerBlog {
  kind: 'blogger#blog';
  id: string;
  name: string;
  description: string;
  published: string;
  updated: string;
  url: string;
  selfLink: string;
  posts: {
    totalItems: number;
    selfLink: string;
  };
  pages?: {
    totalItems: number;
    selfLink: string;
  };
  locale?: {
    language: string;
    country: string;
    variant: string;
  };
}

export interface BloggerBlogList {
  kind: 'blogger#blogList';
  items: BloggerBlog[];
}

export interface BloggerAuthor {
  id?: string;
  displayName: string;
  url?: string;
  image?: {
    url: string;
  };
}

export interface BloggerPostItem {
  kind: 'blogger#post';
  id: string;
  blog: {
    id: string;
  };
  published: string;
  updated: string;
  url: string;
  selfLink: string;
  title: string;
  content: string;
  author: BloggerAuthor;
  replies?: {
    totalItems: string;
    selfLink: string;
  };
  labels?: string[];
}
