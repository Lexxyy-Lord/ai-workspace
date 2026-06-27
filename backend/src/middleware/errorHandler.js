import { isProduction } from '../config/env.js';
import { logger } from '../config/logger.js';

export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} tidak ditemukan.`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  error.isOperational = true;
  next(error);
};

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: statusCode === 500 && isProduction ? 'Internal server error.' : error.message,
      statusCode,
    },
  };

  if (!isProduction && error.details) payload.error.details = error.details;

  if (statusCode >= 500) {
    logger.error({ error, requestId: req.id }, 'API error');
  }

  res.status(statusCode).json(payload);
};
