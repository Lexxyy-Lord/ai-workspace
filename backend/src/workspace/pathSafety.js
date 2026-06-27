import { resolve, relative } from 'node:path';
import { AppError } from '../utils/appError.js';

export const safeJoin = (root, target = '.') => {
  const base = resolve(root);
  const candidate = resolve(base, target);
  const rel = relative(base, candidate);

  if (rel === '' || (!rel.startsWith('..') && !rel.startsWith('/'))) {
    return candidate;
  }

  throw new AppError('Path berada di luar workspace.', 400, 'UNSAFE_WORKSPACE_PATH');
};

export const assertSafeName = (name) => {
  const invalid = !name || name.includes('/') || name.includes('\\') || name.includes('..');

  if (invalid) {
    throw new AppError('Nama file atau folder tidak valid.', 400, 'INVALID_WORKSPACE_NAME');
  }

  return name;
};
