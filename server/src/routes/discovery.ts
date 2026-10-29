import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { popularFeeds, recommendFeeds, submitBatch } from '../services/discovery.js';
export const discoveryRouter = Router();
const submissionLimit = rateLimit({ windowMs: 60_000, limit: 8, standardHeaders: true, legacyHeaders: false });
discoveryRouter.get('/popular', async (_req, res) => {
  try { res.json({ feeds: await popularFeeds() }); }
  catch (e) { res.status(503).json({ error: e instanceof Error ? e.message : 'Discovery unavailable.' }); }
});
discoveryRouter.post('/subscriptions', submissionLimit, async (req, res) => {
  try { res.json(await submitBatch(req.body?.feeds)); }
  catch (e) { res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid submission.' }); }
});
discoveryRouter.post('/recommendations', async (req, res) => {
  try { res.json({ feeds: await recommendFeeds(req.body?.feeds) }); }
  catch (e) { res.status(400).json({ error: e instanceof Error ? e.message : 'Could not recommend feeds.' }); }
});
