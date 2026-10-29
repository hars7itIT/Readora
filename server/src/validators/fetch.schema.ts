export function validateFetchUrl(input: unknown): { valid: boolean; url: string; error?: string } {
  if (typeof input !== 'string' || !input) {
    return { valid: false, url: '', error: 'Provide a valid URL string parameter.' };
  }
  if (input.length > 2048) {
    return { valid: false, url: '', error: 'URL must not exceed 2048 characters.' };
  }
  return { valid: true, url: input };
}
