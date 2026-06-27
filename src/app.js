import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { chatRoutes } from './routes/chatRoutes.js';
import { configRoutes } from './routes/configRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDirectory = join(__dirname, '..', 'public');

const buildCorsOrigin = () => {
  if (env.CORS_ORIGIN === '*') {
    return '*';
  }

  return env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
};

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: buildCorsOrigin(),
      credentials: env.CORS_ORIGIN !== '*',
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: req.id }),
    }),
  );

  app.use(express.static(publicDirectory));
  app.use('/health', healthRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api', chatRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
