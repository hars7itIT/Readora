import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config/env.js';
import { globalApiRateLimit } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { healthRouter } from './routes/health.routes.js';
import { fetchRouter } from './routes/fetch.routes.js';
import { discoveryRouter } from './routes/discovery.routes.js';
import { authRouter } from './routes/auth.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  const allowedOrigins = config.clientOrigin.split(',').map((s) => s.trim());
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match', 'If-Modified-Since'],
    exposedHeaders: ['ETag', 'Last-Modified']
  }));

  app.use(express.json({ limit: '32kb', strict: true }));
  app.use('/api/', globalApiRateLimit);

  // Friendly root route
  app.get('/', (req, res) => {
    // If client explicitly requested JSON via ?format=json or Accept: application/json without html
    const wantsJson =
      req.query.format === 'json' ||
      (Boolean(req.headers.accept?.includes('application/json')) && !req.headers.accept?.includes('text/html'));

    if (wantsJson) {
      return res.json({
        name: 'Small Web Reader API',
        version: '1.0.0',
        status: 'online',
        clientUrl: config.clientOrigin,
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
          fetch: '/api/fetch?url=<encoded_url>',
          popular: '/api/discovery/popular',
          recommendations: '/api/discovery/recommendations',
          subscriptions: '/api/discovery/subscriptions'
        }
      });
    }

    // Direct browser redirect with styled HTML fallback
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${config.clientOrigin}/">
  <title>Small Reader — Independent by Design</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8f9f5;
      color: #20452f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #dfe8dc;
      max-width: 480px;
    }
    h1 { font-family: Georgia, serif; font-size: 26px; margin: 0 0 12px; }
    p { color: #58695d; font-size: 15px; margin: 0 0 24px; line-height: 1.5; }
    a.btn {
      display: inline-block;
      background: #20452f;
      color: #ffffff;
      padding: 12px 28px;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    a.btn:hover { background: #183524; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌿 Small Reader</h1>
    <p>Connected to Small Web Reader API (port 8080). Redirecting to the reader UI at <strong>${config.clientOrigin}</strong>...</p>
    <a class="btn" href="${config.clientOrigin}/">Open Small Reader UI →</a>
  </div>
  <script>window.location.href = "${config.clientOrigin}/";</script>
</body>
</html>`);
  });

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/fetch', fetchRouter);
  app.use('/api/discovery', discoveryRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
