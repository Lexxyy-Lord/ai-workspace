import pino from 'pino';
import { env, isProduction } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'headers.authorization',
      'headers.cookie',
      'password',
      '*.password',
      '*.passwordHash',
      '*.apiKey',
      '*.refreshToken',
      '*.accessToken',
      '*.FREEMODEL_API_KEY',
    ],
    censor: '[redacted]',
  },
});
