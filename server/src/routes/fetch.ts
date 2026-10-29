import { Router } from 'express';
import { safeFetch } from '../services/safeFetch.js';
export const fetchRouter = Router();
fetchRouter.get('/', async (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url : '';
  if (!url || url.length > 2048) return res.status(400).json({ error: 'Provide a URL up to 2048 characters.' });
  try {
    const result = await safeFetch(url);
    res.setHeader('Content-Type', `${result.contentType}; charset=utf-8`);
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    res.status(200).send(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch failed.';
    const status = /private|local|invalid url|only http|credentials|port|hostname/i.test(message) ? 400 : /timed out/i.test(message) ? 504 : 502;
    res.status(status).json({ error: message });
  }
});
