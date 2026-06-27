import { database } from './connection.js';
import { schemaStatements } from './schema.js';
import { logger } from '../config/logger.js';

export const runMigrations = () => {
  database.exec('BEGIN');
  try {
    for (const statement of schemaStatements) {
      database.exec(statement);
    }
    database.exec('COMMIT');
    logger.info({ statements: schemaStatements.length }, 'Database migrations completed');
  } catch (error) {
    database.exec('ROLLBACK');
    logger.error({ error }, 'Database migrations failed');
    throw error;
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
