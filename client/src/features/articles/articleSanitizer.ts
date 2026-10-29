import DOMPurify from 'dompurify';

export function sanitizeArticleHtml(html: string): string {
  if (typeof window !== 'undefined' && typeof (DOMPurify as any).sanitize === 'function') {
    return (DOMPurify as any).sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed', 'script']
    });
  }

  // Safe fallback for Node/testing environment without browser window
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^>\s]+/gi, '');
}
