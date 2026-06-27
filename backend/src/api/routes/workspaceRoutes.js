import { Router } from 'express';
import multer from 'multer';
import { join } from 'node:path';
import { env } from '../../config/env.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { validateBody } from '../../middleware/validate.js';
import {
  createEntry,
  createWorkspace,
  deleteEntry,
  deleteWorkspace,
  extractZipToWorkspace,
  getWorkspaceTree,
  listWorkspaces,
  readWorkspaceFile,
  renameEntry,
  renameWorkspace,
  streamWorkspaceZip,
  writeWorkspaceFile,
} from '../../workspace/workspaceService.js';
import {
  entryCreateSchema,
  entryRenameSchema,
  fileWriteSchema,
  workspaceCreateSchema,
  workspaceRenameSchema,
} from '../validators.js';

const upload = multer({
  dest: env.UPLOAD_DIR,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.originalname.toLowerCase().endsWith('.zip'));
  },
});

export const workspaceRoutes = Router();
workspaceRoutes.use(authenticate);

workspaceRoutes.get('/', (req, res) => {
  res.json({ items: listWorkspaces(req.user.sub) });
});

workspaceRoutes.post('/', validateBody(workspaceCreateSchema), (req, res, next) => {
  try {
    res.status(201).json(createWorkspace({ ownerId: req.user.sub, ...req.body }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.patch('/:workspaceId', validateBody(workspaceRenameSchema), (req, res, next) => {
  try {
    res.json(renameWorkspace({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, name: req.body.name }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.delete('/:workspaceId', (req, res, next) => {
  try {
    res.json(deleteWorkspace({ ownerId: req.user.sub, workspaceId: req.params.workspaceId }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.get('/:workspaceId/tree', (req, res, next) => {
  try {
    res.json(getWorkspaceTree({ ownerId: req.user.sub, workspaceId: req.params.workspaceId }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.get('/:workspaceId/file', (req, res, next) => {
  try {
    res.json(readWorkspaceFile({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, filePath: req.query.path }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.put('/:workspaceId/file', validateBody(fileWriteSchema), (req, res, next) => {
  try {
    res.json(writeWorkspaceFile({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, filePath: req.body.path, content: req.body.content }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.post('/:workspaceId/entry', validateBody(entryCreateSchema), (req, res, next) => {
  try {
    res.status(201).json(createEntry({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, ...req.body }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.patch('/:workspaceId/entry', validateBody(entryRenameSchema), (req, res, next) => {
  try {
    res.json(renameEntry({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, filePath: req.body.path, newName: req.body.newName }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.delete('/:workspaceId/entry', (req, res, next) => {
  try {
    res.json(deleteEntry({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, filePath: req.query.path }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.post('/:workspaceId/upload-zip', upload.single('file'), (req, res, next) => {
  try {
    res.json(extractZipToWorkspace({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, zipPath: req.file.path }));
  } catch (error) {
    next(error);
  }
});

workspaceRoutes.get('/:workspaceId/download.zip', (req, res, next) => {
  try {
    res.attachment(join('workspace', `${req.params.workspaceId}.zip`));
    streamWorkspaceZip({ ownerId: req.user.sub, workspaceId: req.params.workspaceId, output: res });
  } catch (error) {
    next(error);
  }
});
