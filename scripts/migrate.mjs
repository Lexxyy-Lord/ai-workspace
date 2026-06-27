import './load-runtime-env.mjs';
import { runMigrations } from '../backend/src/database/migrate.js';

runMigrations();
