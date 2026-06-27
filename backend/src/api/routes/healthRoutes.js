import { Router } from 'express';
import { env } from '../../config/env.js';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    app: env.APP_NAME,
    service: 'backend',
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
