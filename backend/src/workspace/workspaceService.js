import { createReadStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import AdmZip from 'adm-zip';
import archiver from 'archiver';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { database } from '../database/connection.js';
import { AppError } from '../utils/appError.js';
import { assertSafeName, safeJoin } from './pathSafety.js';

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || nanoid(8);

export const createWorkspace = ({ ownerId, name, description, language }) => {
  const id = nanoid();
  const slug = `${slugify(name)}-${id.slice(0, 8)}`;
  const rootPath = join(env.WORKSPACE_ROOT, slug);
  mkdirSync(rootPath, { recursive: true });

  database
    .prepare(
      `INSERT INTO workspaces (id, owner_id, name, slug, description, language, root_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, ownerId, name, slug, description || null, language || null, rootPath);

  return getWorkspace({ ownerId, workspaceId: id });
};

export const listWorkspaces = (ownerId) =>
  database
    .prepare('SELECT id, name, slug, description, language, is_betabotz_md2, created_at, updated_at FROM workspaces WHERE owner_id = ? ORDER BY updated_at DESC')
    .all(ownerId);

export const getWorkspace = ({ ownerId, workspaceId }) => {
  const row = database.prepare('SELECT * FROM workspaces WHERE id = ? AND owner_id = ?').get(workspaceId, ownerId);

  if (!row) throw new AppError('Workspace tidak ditemukan.', 404, 'WORKSPACE_NOT_FOUND');
  return row;
};

export const renameWorkspace = ({ ownerId, workspaceId, name }) => {
  getWorkspace({ ownerId, workspaceId });
  database.prepare('UPDATE workspaces SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, workspaceId);
  return getWorkspace({ ownerId, workspaceId });
};

export const deleteWorkspace = ({ ownerId, workspaceId }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  rmSync(workspace.root_path, { recursive: true, force: true });
  database.prepare('DELETE FROM workspaces WHERE id = ? AND owner_id = ?').run(workspaceId, ownerId);
  return { deleted: true };
};

const toTree = (root, current = '.') => {
  const fullPath = safeJoin(root, current);
  const stats = statSync(fullPath);
  const name = current === '.' ? basename(root) : basename(current);

  if (!stats.isDirectory()) {
    return { name, path: current, type: 'file', size: stats.size };
  }

  return {
    name,
    path: current,
    type: 'directory',
    children: readdirSync(fullPath)
      .filter((item) => !['node_modules', '.git', '.cache'].includes(item))
      .map((item) => toTree(root, current === '.' ? item : join(current, item))),
  };
};

export const getWorkspaceTree = ({ ownerId, workspaceId }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  return toTree(workspace.root_path);
};

export const readWorkspaceFile = ({ ownerId, workspaceId, filePath }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  const target = safeJoin(workspace.root_path, filePath);
  const stats = statSync(target);

  if (!stats.isFile()) throw new AppError('Target bukan file.', 400, 'NOT_FILE');
  if (stats.size > 1024 * 1024 * 2) throw new AppError('File terlalu besar untuk preview.', 413, 'FILE_TOO_LARGE');

  return { path: filePath, content: readFileSync(target, 'utf8') };
};

export const writeWorkspaceFile = ({ ownerId, workspaceId, filePath, content }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  const target = safeJoin(workspace.root_path, filePath);
  writeFileSync(target, content, 'utf8');
  return { path: filePath, saved: true };
};

export const createEntry = ({ ownerId, workspaceId, parentPath = '.', name, type }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  assertSafeName(name);
  const target = safeJoin(workspace.root_path, join(parentPath, name));

  if (existsSync(target)) throw new AppError('File atau folder sudah ada.', 409, 'ENTRY_EXISTS');
  if (type === 'directory') mkdirSync(target, { recursive: true });
  else writeFileSync(target, '', 'utf8');

  return { path: join(parentPath, name), type };
};

export const deleteEntry = ({ ownerId, workspaceId, filePath }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  rmSync(safeJoin(workspace.root_path, filePath), { recursive: true, force: true });
  return { deleted: true };
};

export const renameEntry = ({ ownerId, workspaceId, filePath, newName }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  assertSafeName(newName);
  const from = safeJoin(workspace.root_path, filePath);
  const to = safeJoin(workspace.root_path, join(filePath, '..', newName));
  renameSync(from, to);
  return { renamed: true };
};

export const extractZipToWorkspace = ({ ownerId, workspaceId, zipPath }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(workspace.root_path, true);
  return getWorkspaceTree({ ownerId, workspaceId });
};

export const streamWorkspaceZip = ({ ownerId, workspaceId, output }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(workspace.root_path, false);
  archive.pipe(output);
  archive.finalize();
  return archive;
};

export const streamFile = ({ ownerId, workspaceId, filePath }) => {
  const workspace = getWorkspace({ ownerId, workspaceId });
  return createReadStream(safeJoin(workspace.root_path, filePath));
};
