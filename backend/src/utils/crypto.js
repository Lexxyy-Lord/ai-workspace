import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

export const hashPassword = async (password) => bcrypt.hash(password, env.PASSWORD_SALT_ROUNDS);

export const verifyPassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

export const sha256 = (value) => createHash('sha256').update(value).digest('hex');

export const createOpaqueToken = () => randomBytes(48).toString('base64url');

export const maskSecret = (value = '') => {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};
