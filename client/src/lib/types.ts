export interface Feed { id: string; title: string; siteUrl: string; feedUrl: string; addedAt: number; }
export interface Post { id: string; feedId: string; feedTitle: string; title: string; link: string; summary: string; publishedAt: number; author: string; read: boolean; contentHtml?: string; articleHtml?: string; }
export interface DiscoveryFeed { url: string; title: string; count: number; reason?: string; }
