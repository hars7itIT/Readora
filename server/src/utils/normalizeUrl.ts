import ipaddr from 'ipaddr.js';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'source',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid'
]);

export function normalizeFeedUrl(input: string): string {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    throw new Error('Invalid URL.');
  }
  if (!['http:', 'https:'].includes(u.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed.');
  }
  if (u.username || u.password) {
    throw new Error('URLs containing credentials are not allowed.');
  }

  // Reject localhost and local/internal hosts
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Localhost and private domains are not allowed.');
  }

  // Reject raw private/loopback/link-local IPs
  const cleanIp = host.replace(/^\[|\]$/g, '');
  if (ipaddr.isValid(cleanIp)) {
    const parsed = ipaddr.parse(cleanIp);
    if (parsed.range() !== 'unicast') {
      throw new Error('Private or loopback IP addresses are not allowed.');
    }
  }

  // Strip www. prefix
  u.hostname = host.replace(/^www\./, '');

  // Strip fragment
  u.hash = '';

  // Strip default ports
  if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) {
    u.port = '';
  }

  // Strip tracking parameters
  for (const param of Array.from(u.searchParams.keys())) {
    if (TRACKING_PARAMS.has(param.toLowerCase())) {
      u.searchParams.delete(param);
    }
  }

  // Strip trailing slash from pathname if length > 1
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1);
  }

  return u.toString();
}

export function extractDomainTitle(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
