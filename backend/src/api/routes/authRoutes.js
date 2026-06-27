import { Router } from 'express';
import { login, refresh, currentUser } from '../../services/authService.js';
import { revokeSessionByRefreshToken } from '../../services/tokenService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { validateBody } from '../../middleware/validate.js';
import { loginSchema, refreshSchema } from '../validators.js';

export const authRoutes = Router();

authRoutes.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await login({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/refresh', validateBody(refreshSchema), (req, res, next) => {
  try {
    res.json(refresh(req.body.refreshToken));
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/logout', validateBody(refreshSchema), (req, res) => {
  revokeSessionByRefreshToken(req.body.refreshToken);
  res.json({ loggedOut: true });
});

authRoutes.get('/me', authenticate, (req, res, next) => {
  try {
    res.json({ user: currentUser(req.user.sub) });
  } catch (error) {
    next(error);
  }
});
