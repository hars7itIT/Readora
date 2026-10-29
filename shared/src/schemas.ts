export function isValidUrlString(val: unknown): val is string {
  if (typeof val !== 'string' || !val) return false;
  if (val.length > 2048) return false;
  try {
    const u = new URL(val);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}

export function validateSubscriptionBatch(data: unknown): { valid: boolean; feeds: string[]; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, feeds: [], error: 'Invalid request body. Expected JSON object.' };
  }
  const body = data as { feeds?: unknown };
  if (!Array.isArray(body.feeds)) {
    return { valid: false, feeds: [], error: 'feeds must be an array.' };
  }
  if (body.feeds.length === 0) {
    return { valid: false, feeds: [], error: 'feeds array cannot be empty.' };
  }
  if (body.feeds.length > 50) {
    return { valid: false, feeds: [], error: 'A batch can contain at most 50 feeds.' };
  }
  for (const item of body.feeds) {
    if (typeof item !== 'string' || item.length > 2048) {
      return { valid: false, feeds: [], error: 'Each feed must be a valid string URL up to 2048 characters.' };
    }
  }
  return { valid: true, feeds: body.feeds as string[] };
}
