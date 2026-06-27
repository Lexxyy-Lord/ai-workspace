import { createServer } from 'node:http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { runMigrations } from './database/migrate.js';
import { seedAdmin } from './database/seed.js';
import { createApp } from './api/app.js';
import { attachSocketServer } from './websocket/socketServer.js';

runMigrations();
await seedAdmin();

const app = createApp();
const server = createServer(app);
attachSocketServer(server);

server.listen(env.API_PORT, env.API_HOST, () => {
  logger.info(
    {
      app: env.APP_NAME,
      host: env.API_HOST,
      port: env.API_PORT,
      environment: env.NODE_ENV,
    },
    'AI Workspace backend started',
  );
});

const shutdown = (signal) => {
  logger.info({ signal }, 'Shutting down backend');
  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Backend shutdown failed');
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
