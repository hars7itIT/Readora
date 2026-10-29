import type { Request, Response } from 'express';
import { config } from '../config/env.js';

export function notFoundHandler(req: Request, res: Response) {
  if (!req.path.startsWith('/api') && req.accepts('html')) {
    return res.redirect(`${config.clientOrigin}${req.originalUrl}`);
  }
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}
