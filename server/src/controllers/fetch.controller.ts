import type { Request, Response } from 'express';
import { validateFetchUrl } from '../validators/fetch.schema.js';
import { safeFetch } from '../services/safeFetch.service.js';
import { getStatusCodeFromError } from '../utils/safeErrors.js';

export async function handleFetch(req: Request, res: Response) {
  const validation = validateFetchUrl(req.query.url);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const ifNoneMatch = (req.headers['if-none-match'] || req.query.etag) as string | undefined;
  const ifModifiedSince = (req.headers['if-modified-since'] || req.query.lastModified) as string | undefined;
  const checkRobots = req.query.checkRobots === 'true' || req.query.robots === '1';

  try {
    const result = await safeFetch(validation.url, 0, {
      ifNoneMatch,
      ifModifiedSince,
      checkRobots
    });

    if (result.headers?.etag) {
      res.setHeader('ETag', result.headers.etag);
    }
    if (result.headers?.lastModified) {
      res.setHeader('Last-Modified', result.headers.lastModified);
    }

    if (result.status === 304) {
      res.setHeader('Cache-Control', 'private, max-age=60');
      return res.status(304).end();
    }

    res.setHeader('Content-Type', `${result.contentType}; charset=utf-8`);
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    return res.status(200).send(result.body);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch failed.';
    if (message.toLowerCase().includes('robots.txt')) {
      return res.status(403).json({ error: message, robotsBlocked: true });
    }
    const status = getStatusCodeFromError(err);
    return res.status(status).json({ error: message });
  }
}
