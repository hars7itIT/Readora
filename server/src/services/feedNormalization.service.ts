import { normalizeFeedUrl } from '../utils/normalizeUrl.js';
import { validatePublicHost } from './urlValidation.service.js';

export async function normalizeAndValidateBatch(feeds: string[]): Promise<string[]> {
  const normalized: string[] = [];
  for (const raw of feeds) {
    const cleanUrl = normalizeFeedUrl(raw);
    const host = new URL(cleanUrl).hostname;
    await validatePublicHost(host);
    normalized.push(cleanUrl);
  }
  return [...new Set(normalized)];
}
