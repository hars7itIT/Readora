import rateLimit from 'express-rate-limit';

export const globalApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false
});

export const discoverySubmissionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});
