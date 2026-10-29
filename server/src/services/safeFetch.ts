import http from 'node:http';
import https from 'node:https';
import type { IncomingMessage } from 'node:http';
import { resolvePublicAddress } from '../utils/publicAddress.js';

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 9000;
const MAX_REDIRECTS = 3;
const ALLOWED_TYPES = /^(text\/(html|plain|xml)|application\/(rss\+xml|atom\+xml|xml|rdf\+xml|json|xhtml\+xml|octet-stream))/i;

export interface RawFetchResult { body: Buffer; contentType: string; status: number; finalUrl: string; }
export async function safeFetch(input: string, redirectCount = 0): Promise<RawFetchResult> {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('Invalid URL.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are allowed.');
  if (url.username || url.password) throw new Error('URLs containing credentials are not allowed.');
  if (url.port && url.port !== (url.protocol === 'https:' ? '443' : '80')) throw new Error('Only standard HTTP/HTTPS ports are allowed.');
  const resolved = await resolvePublicAddress(url.hostname);
  const result = await requestOnce(url, resolved.address, resolved.family);
  if ([301, 302, 303, 307, 308].includes(result.status)) {
    if (redirectCount >= MAX_REDIRECTS) throw new Error('Too many redirects.');
    const location = result.headers.location;
    if (!location) throw new Error('Redirect response did not include a location.');
    const next = new URL(location, url).toString();
    // Every redirect goes through DNS/IP validation again.
    return safeFetch(next, redirectCount + 1);
  }
  if (result.status < 200 || result.status >= 300) throw new Error(`Upstream server returned HTTP ${result.status}.`);
  const contentType = String(result.headers['content-type'] || 'application/octet-stream').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.test(contentType)) throw new Error(`Unsupported upstream content type: ${contentType}.`);
  const body = result.body;
  if (body.length > MAX_BYTES) throw new Error('Upstream response exceeds the 2 MB limit.');
  return { body, contentType, status: result.status, finalUrl: url.toString() };
}
function requestOnce(url: URL, pinnedAddress: string, family: 4 | 6): Promise<{ body: Buffer; headers: IncomingMessage['headers']; status: number }> {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    let settled = false;
    const finishError = (e: Error) => { if (!settled) { settled = true; reject(e); } };
    const req = transport.request(url, {
      method: 'GET',
      headers: { 'User-Agent': 'SmallWebReader/1.0 (+https://example.invalid)', 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, text/plain, */*;q=0.5' },
      lookup: (_hostname, _options, callback) => callback(null, pinnedAddress, family),
      servername: url.hostname.replace(/^\[|\]$/g, ''),
      rejectUnauthorized: true
    }, (res) => {
      const status = res.statusCode || 502;
      if ([301, 302, 303, 307, 308].includes(status)) {
        res.resume();
        if (!settled) { settled = true; resolve({ body: Buffer.alloc(0), headers: res.headers, status }); }
        return;
      }
      const chunks: Buffer[] = [];
      let bytes = 0;
      res.on('data', (chunk: Buffer | string) => {
        const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += b.length;
        if (bytes > MAX_BYTES) { req.destroy(new Error('Upstream response exceeds the 2 MB limit.')); return; }
        chunks.push(b);
      });
      res.on('end', () => {
        if (!settled) { settled = true; resolve({ body: Buffer.concat(chunks), headers: res.headers, status }); }
      });
      res.on('error', finishError);
    });
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('Upstream request timed out.')));
    req.on('error', finishError);
    req.end();
  });
}
