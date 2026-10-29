import http from 'node:http';
import https from 'node:https';
import type { IncomingMessage } from 'node:http';
import { resolvePublicAddress } from '../utils/publicAddress.js';
import { checkRobotsPermission } from './robots.service.js';

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 9000;
const MAX_REDIRECTS = 3;
const ALLOWED_TYPES = /^(text\/(html|plain|xml)|application\/(rss\+xml|atom\+xml|xml|rdf\+xml|json|xhtml\+xml|octet-stream))/i;

export interface FetchOptions {
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  checkRobots?: boolean;
}

export interface RawFetchResult {
  body: Buffer;
  contentType: string;
  status: number;
  finalUrl: string;
  headers?: {
    etag?: string;
    lastModified?: string;
  };
}

export async function safeFetch(
  input: string,
  redirectCount = 0,
  options?: FetchOptions
): Promise<RawFetchResult> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Invalid URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed.');
  }
  if (url.username || url.password) {
    throw new Error('URLs containing credentials are not allowed.');
  }
  if (url.port && url.port !== (url.protocol === 'https:' ? '443' : '80')) {
    throw new Error('Only standard HTTP/HTTPS ports (80, 443) are allowed.');
  }

  // Check robots.txt if requested (and not fetching robots.txt itself)
  if (options?.checkRobots && !url.pathname.endsWith('/robots.txt')) {
    const robotsCheck = await checkRobotsPermission(url.toString(), async (robotsUrl) => {
      try {
        const robotsRes = await safeFetch(robotsUrl, 0, { checkRobots: false });
        return robotsRes.body.toString('utf-8');
      } catch {
        return null;
      }
    });

    if (!robotsCheck.allowed) {
      throw new Error(robotsCheck.reason || 'Blocked by website robots.txt policy.');
    }
  }

  const resolved = await resolvePublicAddress(url.hostname);
  const result = await requestOnce(url, resolved.address, resolved.family, options);

  if ([301, 302, 303, 307, 308].includes(result.status)) {
    if (redirectCount >= MAX_REDIRECTS) {
      throw new Error('Too many redirects.');
    }
    const location = result.headers.location;
    if (!location) {
      throw new Error('Redirect response did not include a location header.');
    }
    const next = new URL(location, url).toString();
    return safeFetch(next, redirectCount + 1, options);
  }

  // Conditional fetch 304 Not Modified
  if (result.status === 304) {
    const etag = typeof result.headers.etag === 'string' ? result.headers.etag : undefined;
    const lastModified = typeof result.headers['last-modified'] === 'string' ? result.headers['last-modified'] : undefined;
    return {
      body: Buffer.alloc(0),
      contentType: '',
      status: 304,
      finalUrl: url.toString(),
      headers: { etag, lastModified }
    };
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upstream server returned HTTP ${result.status}.`);
  }

  const contentType = String(result.headers['content-type'] || 'application/octet-stream').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.test(contentType)) {
    throw new Error(`Unsupported upstream content type: ${contentType}.`);
  }

  const body = result.body;
  if (body.length > MAX_BYTES) {
    throw new Error('Upstream response exceeds the 2 MB limit.');
  }

  const etag = typeof result.headers.etag === 'string' ? result.headers.etag : undefined;
  const lastModified = typeof result.headers['last-modified'] === 'string' ? result.headers['last-modified'] : undefined;

  return {
    body,
    contentType,
    status: result.status,
    finalUrl: url.toString(),
    headers: { etag, lastModified }
  };
}

function requestOnce(
  url: URL,
  pinnedAddress: string,
  family: 4 | 6,
  options?: FetchOptions
): Promise<{ body: Buffer; headers: IncomingMessage['headers']; status: number }> {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    let settled = false;
    const finishError = (e: Error) => {
      if (!settled) {
        settled = true;
        reject(e);
      }
    };

    const reqHeaders: Record<string, string> = {
      'User-Agent': 'SmallWebReader/1.0 (+https://github.com/pec/small-web-reader)',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, text/plain, */*;q=0.5'
    };

    if (options?.ifNoneMatch) {
      reqHeaders['If-None-Match'] = options.ifNoneMatch;
    }
    if (options?.ifModifiedSince) {
      reqHeaders['If-Modified-Since'] = options.ifModifiedSince;
    }

    const req = transport.request(url, {
      method: 'GET',
      headers: reqHeaders,
      lookup: (_hostname, _options, callback) => callback(null, pinnedAddress, family),
      servername: url.hostname.replace(/^\[|\]$/g, ''),
      rejectUnauthorized: true
    }, (res) => {
      const status = res.statusCode || 502;
      if ([301, 302, 303, 307, 308, 304].includes(status)) {
        res.resume();
        if (!settled) {
          settled = true;
          resolve({ body: Buffer.alloc(0), headers: res.headers, status });
        }
        return;
      }

      const chunks: Buffer[] = [];
      let bytes = 0;
      res.on('data', (chunk: Buffer | string) => {
        const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += b.length;
        if (bytes > MAX_BYTES) {
          req.destroy(new Error('Upstream response exceeds the 2 MB limit.'));
          return;
        }
        chunks.push(b);
      });

      res.on('end', () => {
        if (!settled) {
          settled = true;
          resolve({ body: Buffer.concat(chunks), headers: res.headers, status });
        }
      });

      res.on('error', finishError);
    });

    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('Upstream request timed out.')));
    req.on('error', finishError);
    req.end();
  });
}
