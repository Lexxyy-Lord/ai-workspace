import { createServer } from 'node:http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { createApp } from './app.js';

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, env.HOST, () => {
  logger.info(
    {
      app: env.APP_NAME,
      environment: env.NODE_ENV,
      host: env.HOST,
      port: env.PORT,
    },
    'AI Workspace server started',
  );
});

const shutdown = (signal) => {
  logger.info({ signal }, 'Shutting down server');
  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Failed to close server cleanly');
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
