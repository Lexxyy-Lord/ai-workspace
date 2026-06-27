import Database from 'better-sqlite3';
import { env } from '../config/env.js';

const db = new Database(env.DATABASE_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

export const database = db;

export const transaction = (callback) => database.transaction(callback)();
