import type { Request, Response, NextFunction } from 'express';
import { formatSafeErrorMessage } from '../utils/safeErrors.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = formatSafeErrorMessage(err);
  const status = (err as any)?.status || (err as any)?.statusCode || 400;
  res.status(status).json({ error: message });
}
