import { AuthError, ForbiddenError } from '../utils/appError.js';
import { verifyAccessToken } from '../services/tokenService.js';

export const authenticate = (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new AuthError('Token akses wajib dikirim.');
    }

    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AuthError('Token akses tidak valid.'));
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ForbiddenError('Role tidak memiliki akses.'));
  }

  return next();
};
