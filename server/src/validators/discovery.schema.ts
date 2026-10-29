export function validateBatchSubmission(body: unknown): { valid: boolean; feeds: string[]; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, feeds: [], error: 'Expected request body to be an object.' };
  }
  const { feeds } = body as { feeds?: unknown };
  if (!Array.isArray(feeds)) {
    return { valid: false, feeds: [], error: 'feeds must be an array of feed URLs.' };
  }
  if (feeds.length === 0) {
    return { valid: false, feeds: [], error: 'feeds array cannot be empty.' };
  }
  if (feeds.length > 50) {
    return { valid: false, feeds: [], error: 'A batch can contain at most 50 feeds.' };
  }
  for (const f of feeds) {
    if (typeof f !== 'string' || f.length > 2048) {
      return { valid: false, feeds: [], error: 'Each feed URL must be a string up to 2048 characters.' };
    }
  }
  return { valid: true, feeds: feeds as string[] };
}
