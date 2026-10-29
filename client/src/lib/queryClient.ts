// Lightweight reactive cache / query helper for client data fetching
export class SimpleQueryClient {
  private cache = new Map<string, { data: any; expiry: number }>();

  async fetchWithCache<T>(key: string, fetcher: () => Promise<T>, ttlMs = 60000): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    const data = await fetcher();
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
    return data;
  }

  invalidate(keyPrefix?: string) {
    if (!keyPrefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryClient = new SimpleQueryClient();
