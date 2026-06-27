import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

const jsonObject = z
  .string()
  .default('{}')
  .transform((value, ctx) => {
    try {
      const parsed = JSON.parse(value || '{}');
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be a JSON object.' });
        return z.NEVER;
      }
      return parsed;
    } catch (error) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: error.message });
      return z.NEVER;
    }
  });

const csv = z
  .string()
  .default('http://localhost:3001')
  .transform((value) => value.split(',').map((item) => item.trim()).filter(Boolean));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().min(1).default('AI Workspace'),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  PUBLIC_FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  CORS_ORIGINS: csv,
  TRUST_PROXY: z.coerce.boolean().default(false),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATA_DIR: z.string().min(1).default('./data'),
  DATABASE_PATH: z.string().min(1).default('./data/ai-workspace.sqlite'),
  WORKSPACE_ROOT: z.string().min(1).default('./data/workspaces'),
  UPLOAD_DIR: z.string().min(1).default('./data/uploads'),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(100),

  JWT_ACCESS_SECRET: z.string().min(32).default('change-this-access-secret-minimum-32-characters'),
  JWT_REFRESH_SECRET: z.string().min(32).default('change-this-refresh-secret-minimum-32-characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),
  PASSWORD_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(12),
  ADMIN_EMAIL: z.string().email().default('admin@local.test'),
  ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  ADMIN_NAME: z.string().min(1).default('Administrator'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  DEFAULT_AI_PROVIDER: z.string().min(1).default('freemodel'),
  DEFAULT_AI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  DEFAULT_AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  DEFAULT_AI_TOP_P: z.coerce.number().min(0).max(1).default(1),
  DEFAULT_AI_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  DEFAULT_SYSTEM_PROMPT: z.string().default('You are AI Workspace, a professional coding assistant.'),

  FREEMODEL_API_KEY: z.string().default(''),
  FREEMODEL_BASE_URL: z.string().url().default('https://freemodel.dev/v1'),
  FREEMODEL_CHAT_PATH: z.string().min(1).default('/chat/completions'),
  FREEMODEL_MODELS_PATH: z.string().min(1).default('/models'),
  FREEMODEL_AUTH_HEADER: z.string().min(1).default('Authorization'),
  FREEMODEL_AUTH_PREFIX: z.string().default('Bearer'),
  FREEMODEL_EXTRA_HEADERS: jsonObject,
  PROVIDER_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

const normalizePath = (path) => resolve(process.cwd(), path);

export const env = Object.freeze({
  ...result.data,
  DATA_DIR: normalizePath(result.data.DATA_DIR),
  DATABASE_PATH: normalizePath(result.data.DATABASE_PATH),
  WORKSPACE_ROOT: normalizePath(result.data.WORKSPACE_ROOT),
  UPLOAD_DIR: normalizePath(result.data.UPLOAD_DIR),
});

for (const directory of [env.DATA_DIR, env.WORKSPACE_ROOT, env.UPLOAD_DIR]) {
  mkdirSync(directory, { recursive: true });
}

export const isProduction = env.NODE_ENV === 'production';
