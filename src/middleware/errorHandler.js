import { isProduction } from '../config/env.js';
import { logger } from '../config/logger.js';
import { isTrustedError } from '../utils/errors.js';

export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} tidak ditemukan.`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const response = {
    error: {
      message: statusCode === 500 && isProduction ? 'Internal server error.' : error.message,
      statusCode,
    },
  };

  if (!isProduction && error.details) {
    response.error.details = error.details;
  }

  if (!isTrustedError(error) || statusCode >= 500) {
    logger.error({ error, requestId: req.id }, 'Unhandled application error');
  }

  res.status(statusCode).json(response);
};
