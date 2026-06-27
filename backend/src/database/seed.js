import { nanoid } from 'nanoid';
import { database } from './connection.js';
import { runMigrations } from './migrate.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { hashPassword } from '../utils/crypto.js';

export const seedAdmin = async () => {
  runMigrations();

  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(env.ADMIN_EMAIL);

  if (existing) {
    logger.info({ email: env.ADMIN_EMAIL }, 'Admin user already exists');
    return existing;
  }

  const id = nanoid();
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  database
    .prepare(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, 'admin')`,
    )
    .run(id, env.ADMIN_NAME, env.ADMIN_EMAIL, passwordHash);

  logger.info({ email: env.ADMIN_EMAIL }, 'Admin user created');
  return { id };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin().catch((error) => {
    logger.error({ error }, 'Admin seed failed');
    process.exit(1);
  });
}
