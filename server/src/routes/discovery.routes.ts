import { Router } from 'express';
import { discoverySubmissionRateLimit } from '../middleware/rateLimit.js';
import { requireJsonBody } from '../middleware/validateRequest.js';
import { handleGetPopular, handleGetRecommendations, handleSubmitBatch } from '../controllers/discovery.controller.js';

export const discoveryRouter = Router();

discoveryRouter.get('/popular', handleGetPopular);
discoveryRouter.post('/recommendations', requireJsonBody, handleGetRecommendations);
discoveryRouter.post('/subscriptions', discoverySubmissionRateLimit, requireJsonBody, handleSubmitBatch);
