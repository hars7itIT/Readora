import { Router } from 'express';
import { isDbConnected } from '../config/database.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    discoveryConfigured: isDbConnected()
  });
});
