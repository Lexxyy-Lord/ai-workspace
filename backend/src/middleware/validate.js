import { AppError } from '../utils/appError.js';

export const validateBody = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return next(new AppError('Payload request tidak valid.', 400, 'VALIDATION_ERROR', parsed.error.flatten().fieldErrors));
  }

  req.body = parsed.data;
  return next();
};

export const validateQuery = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse(req.query);

  if (!parsed.success) {
    return next(new AppError('Query request tidak valid.', 400, 'VALIDATION_ERROR', parsed.error.flatten().fieldErrors));
  }

  req.query = parsed.data;
  return next();
};
