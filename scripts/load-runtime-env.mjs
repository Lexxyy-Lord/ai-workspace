import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const candidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'backend/.env'),
];

for (const envPath of candidates) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

process.env.NODE_ENV ||= 'production';
process.env.API_HOST ||= '0.0.0.0';
process.env.API_PORT ||= process.env.SERVER_PORT || process.env.PORT || '25664';
process.env.PUBLIC_FRONTEND_URL ||= `http://apps1.vynzzhost.com:${process.env.API_PORT}`;
process.env.CORS_ORIGINS ||= process.env.PUBLIC_FRONTEND_URL;
process.env.SINGLE_PORT_MODE ||= 'true';
process.env.FRONTEND_DIST_DIR ||= './frontend/out';

export const runtimeEnvLoaded = true;
