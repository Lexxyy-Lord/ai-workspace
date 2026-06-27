import 'dotenv/config';
import { z } from 'zod';

const jsonObjectFromString = z.string().default('{}').transform((value, ctx) => {
  try {
    const parsed = JSON.parse(value || '{}');

    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be a valid JSON object.',
      });
      return z.NEVER;
    }

    return parsed;
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Must be valid JSON. ${error.message}`,
    });
    return z.NEVER;
  }
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().min(1).default('AI Workspace'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  CORS_ORIGIN: z.string().min(1).default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  FREEEMODEL_API_KEY: z.string().default(''),
  FREEEMODEL_BASE_URL: z.string().url().default('https://freeemodel.dev/api/v1'),
  FREEEMODEL_CHAT_PATH: z.string().min(1).default('/chat/completions'),
  FREEEMODEL_MODELS_PATH: z.string().min(1).default('/models'),
  FREEEMODEL_MODEL: z.string().min(1).default('freeemodel-default'),
  FREEEMODEL_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  FREEEMODEL_AUTH_HEADER: z.string().min(1).default('Authorization'),
  FREEEMODEL_AUTH_PREFIX: z.string().default('Bearer'),
  FREEEMODEL_EXTRA_HEADERS: jsonObjectFromString,

  AI_DEFAULT_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  AI_DEFAULT_MAX_TOKENS: z.coerce.number().int().positive().default(1024),
  AI_SYSTEM_PROMPT: z.string().default('You are a helpful, concise AI assistant.'),

  PUBLIC_APP_TITLE: z.string().min(1).default('AI Workspace'),
  PUBLIC_APP_DESCRIPTION: z
    .string()
    .min(1)
    .default('Workspace AI berbasis Node.js yang aman karena API key hanya disimpan di server.'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);

export const isProduction = env.NODE_ENV === 'production';
