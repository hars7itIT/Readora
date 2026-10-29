export function calculateReadingTimeMinutes(textOrHtml: string): number {
  if (!textOrHtml) return 1;
  // Strip HTML tags
  const plainText = textOrHtml.replace(/<[^>]*>/g, ' ');
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes);
}
