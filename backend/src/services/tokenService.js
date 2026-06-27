import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { database } from '../database/connection.js';
import { createOpaqueToken, sha256 } from '../utils/crypto.js';

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  );

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

export const createRefreshSession = ({ userId, userAgent, ipAddress }) => {
  const refreshToken = createOpaqueToken();
  const sessionId = nanoid();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  database
    .prepare(
      `INSERT INTO sessions (id, user_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(sessionId, userId, sha256(refreshToken), userAgent || null, ipAddress || null, expiresAt);

  return { sessionId, refreshToken, expiresAt };
};

export const revokeSessionByRefreshToken = (refreshToken) => {
  database
    .prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE refresh_token_hash = ?')
    .run(sha256(refreshToken));
};

export const findActiveSession = (refreshToken) =>
  database
    .prepare(
      `SELECT sessions.*, users.email, users.name, users.role, users.is_active
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.refresh_token_hash = ?
         AND sessions.revoked_at IS NULL
         AND sessions.expires_at > CURRENT_TIMESTAMP`,
    )
    .get(sha256(refreshToken));
