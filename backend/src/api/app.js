import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { chatRoutes } from './routes/chatRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { workspaceRoutes } from './routes/workspaceRoutes.js';

const frontendDistDir = resolve(process.cwd(), process.env.FRONTEND_DIST_DIR || './frontend/out');
const singlePortMode = process.env.SINGLE_PORT_MODE !== 'false';

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (env.CORS_ORIGINS.includes('*')) return true;
  return env.CORS_ORIGINS.includes(origin);
};

const shouldServeFrontend = (path) =>
  singlePortMode &&
  !path.startsWith('/api') &&
  !path.startsWith('/health') &&
  !path.startsWith('/socket.io');

export const createApp = () => {
  const app = express();

  if (env.TRUST_PROXY) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(pinoHttp({ logger }));

  app.use('/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/workspaces', workspaceRoutes);

  if (singlePortMode && existsSync(frontendDistDir)) {
    app.use(express.static(frontendDistDir, { index: 'index.html' }));
    app.get('*', (req, res, next) => {
      if (!shouldServeFrontend(req.path)) return next();
      return res.sendFile(join(frontendDistDir, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
