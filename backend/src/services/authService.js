import { database } from '../database/connection.js';
import { AuthError } from '../utils/appError.js';
import { verifyPassword } from '../utils/crypto.js';
import { createRefreshSession, findActiveSession, signAccessToken } from './tokenService.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const login = async ({ email, password, userAgent, ipAddress }) => {
  const user = database.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AuthError('Email atau password salah.');
  }

  const accessToken = signAccessToken(user);
  const session = createRefreshSession({ userId: user.id, userAgent, ipAddress });

  return {
    user: publicUser(user),
    accessToken,
    refreshToken: session.refreshToken,
    refreshExpiresAt: session.expiresAt,
  };
};

export const refresh = (refreshToken) => {
  const session = findActiveSession(refreshToken);

  if (!session || !session.is_active) {
    throw new AuthError('Session tidak valid atau sudah kedaluwarsa.');
  }

  const user = {
    id: session.user_id,
    name: session.name,
    email: session.email,
    role: session.role,
  };

  return {
    user: publicUser(user),
    accessToken: signAccessToken(user),
  };
};

export const currentUser = (userId) => {
  const user = database
    .prepare('SELECT id, name, email, role FROM users WHERE id = ? AND is_active = 1')
    .get(userId);

  if (!user) {
    throw new AuthError('User tidak ditemukan.');
  }

  return user;
};
