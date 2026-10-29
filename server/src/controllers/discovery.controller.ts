import type { Request, Response } from 'express';
import { validateBatchSubmission } from '../validators/discovery.schema.js';
import { getPopularFeeds, getRecommendations, submitAnonymousBatch } from '../services/recommendation.service.js';

export async function handleGetPopular(_req: Request, res: Response) {
  try {
    const feeds = await getPopularFeeds();
    return res.json({ feeds });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Discovery unavailable.';
    return res.status(503).json({ error: message });
  }
}

export async function handleGetRecommendations(req: Request, res: Response) {
  const feeds = Array.isArray(req.body?.feeds) ? (req.body.feeds as string[]) : [];
  try {
    const recommendations = await getRecommendations(feeds);
    return res.json({ feeds: recommendations });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load recommendations.';
    return res.status(400).json({ error: message });
  }
}

export async function handleSubmitBatch(req: Request, res: Response) {
  const validation = validateBatchSubmission(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await submitAnonymousBatch(validation.feeds);
    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to submit batch.';
    return res.status(400).json({ error: message });
  }
}
