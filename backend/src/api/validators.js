import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const chatSchema = z.object({
  title: z.string().max(120).optional(),
  provider: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant', 'tool']),
        content: z.string().min(1),
      }),
    )
    .default([]),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  maxTokens: z.number().int().positive().max(64000).optional(),
  workspaceId: z.string().optional(),
});

export const workspaceCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  language: z.string().max(60).optional(),
});

export const workspaceRenameSchema = z.object({
  name: z.string().min(1).max(120),
});

export const fileWriteSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export const entryCreateSchema = z.object({
  parentPath: z.string().default('.'),
  name: z.string().min(1).max(255),
  type: z.enum(['file', 'directory']),
});

export const entryRenameSchema = z.object({
  path: z.string().min(1),
  newName: z.string().min(1).max(255),
});
