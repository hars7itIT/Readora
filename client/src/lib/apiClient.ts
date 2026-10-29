import type { DiscoveryFeed } from '../types/index';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

function readErrorMessage(text: string, fallback: string): string {
  try {
    return JSON.parse(text).error || fallback;
  } catch {
    return fallback;
  }
}

export interface FetchRawResult {
  text: string;
  contentType: string;
  status: number;
  etag?: string;
  lastModified?: string;
}

export async function fetchRaw(
  url: string,
  options?: { etag?: string; lastModified?: string; checkRobots?: boolean }
): Promise<FetchRawResult> {
  const reqHeaders: Record<string, string> = {};
  if (options?.etag) {
    reqHeaders['If-None-Match'] = options.etag;
  }
  if (options?.lastModified) {
    reqHeaders['If-Modified-Since'] = options.lastModified;
  }

  const queryParams = new URLSearchParams({ url });
  if (options?.checkRobots) {
    queryParams.set('checkRobots', 'true');
  }

  const response = await fetch(`${API_BASE}/api/fetch?${queryParams.toString()}`, {
    headers: reqHeaders
  });

  const etag = response.headers.get('etag') || undefined;
  const lastModified = response.headers.get('last-modified') || undefined;

  // Conditional 304 Not Modified
  if (response.status === 304) {
    return {
      text: '',
      contentType: '',
      status: 304,
      etag,
      lastModified
    };
  }

  const body = await response.text();
  if (!response.ok) {
    throw new Error(readErrorMessage(body, `Fetch failed (${response.status})`));
  }

  return {
    text: body,
    contentType: response.headers.get('content-type') || '',
    status: response.status,
    etag,
    lastModified
  };
}

export async function getPopular(): Promise<DiscoveryFeed[]> {
  const r = await fetch(`${API_BASE}/api/discovery/popular`);
  if (!r.ok) {
    throw new Error('Discovery service is unavailable.');
  }
  const data = await r.json();
  return data.feeds as DiscoveryFeed[];
}

export async function getRecommendations(feeds: string[]): Promise<DiscoveryFeed[]> {
  const r = await fetch(`${API_BASE}/api/discovery/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feeds })
  });
  if (!r.ok) {
    throw new Error('Could not load recommendations.');
  }
  const data = await r.json();
  return data.feeds as DiscoveryFeed[];
}

export async function shareSubscriptions(feeds: string[]): Promise<{ accepted: number; message: string }> {
  const r = await fetch(`${API_BASE}/api/discovery/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feeds })
  });
  if (!r.ok) {
    throw new Error(readErrorMessage(await r.text(), 'Could not share subscriptions.'));
  }
  return r.json();
}
