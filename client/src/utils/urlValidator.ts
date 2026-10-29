export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
  cleanUrl?: string;
}

const PRIVATE_IP_REGEX = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/;
const DANGEROUS_SCHEMES = ['javascript:', 'file:', 'ftp:', 'data:', 'blob:', 'ws:', 'wss:'];

/**
 * Validates a feed or website URL input.
 * Detects invalid links, malformed schemes, internal IPs, and formats.
 */
export function validateFeedUrlInput(input: string): UrlValidationResult {
  const trimmed = (input || '').trim();

  // 1. Empty check
  if (!trimmed) {
    return {
      valid: false,
      error: 'URL cannot be empty.',
      suggestion: 'Please enter a valid website address (e.g. https://jvns.ca or https://buzz.blogger.com).'
    };
  }

  // 2. Dangerous schemes check
  const lower = trimmed.toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return {
        valid: false,
        error: `Security Alert: Scheme "${scheme}" is strictly forbidden.`,
        suggestion: 'Only secure HTTP and HTTPS addresses are permitted.'
      };
    }
  }

  // 3. Embedded credentials check
  if (/@/.test(trimmed.split('/')[2] || '')) {
    return {
      valid: false,
      error: 'Security Alert: URLs with embedded credentials (user:password@) are not allowed.',
      suggestion: 'Please remove any credentials before submitting.'
    };
  }

  // 4. Scheme normalization
  const hasScheme = /^https?:\/\//i.test(trimmed);
  const normalized = hasScheme ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      valid: false,
      error: 'Malformed URL: The address entered could not be parsed.',
      suggestion: 'Check for typo errors, spaces, or missing characters (e.g. https://example.com/feed.xml).'
    };
  }

  // 5. Hostname validity
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    return {
      valid: false,
      error: 'Invalid Hostname: URL has no host address.',
      suggestion: 'Please provide a valid domain name (e.g. example.com).'
    };
  }

  // Reject single-word hosts like "hello", "xyz" that have no TLD
  if (!hostname.includes('.') && hostname !== 'localhost') {
    return {
      valid: false,
      error: `Invalid Domain: "${hostname}" does not appear to be a valid internet domain.`,
      suggestion: 'Include a top-level domain, such as .com, .org, or .net (e.g. example.com).'
    };
  }

  // 6. SSRF / Private IP rejection
  if (hostname === 'localhost' || hostname === '::1' || PRIVATE_IP_REGEX.test(hostname)) {
    return {
      valid: false,
      error: `Security Alert (SSRF): Localhost and private subnets ("${hostname}") are blocked.`,
      suggestion: 'Feed Reader only connects to public internet blogs and feeds.'
    };
  }

  // 7. Non-standard ports warning/rejection
  if (parsed.port && !['80', '443', '8080'].includes(parsed.port)) {
    return {
      valid: false,
      error: `Blocked Port: Connecting to port ${parsed.port} is not permitted.`,
      suggestion: 'Feeds must be hosted on standard HTTP (80) or HTTPS (443) ports.'
    };
  }

  return {
    valid: true,
    cleanUrl: parsed.href
  };
}

/**
 * Normalizes a feed URL to its canonical form (strips www, default ports, trailing slash, queries, hash)
 */
export function normalizeFeedUrl(input: string): string {
  try {
    const raw = input.trim();
    const url = new URL(raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`);
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    url.hash = '';
    url.search = '';
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    url.pathname = pathname;
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return input.trim().toLowerCase();
  }
}
