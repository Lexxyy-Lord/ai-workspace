import './load-runtime-env.mjs';
import { seedAdmin } from '../backend/src/database/seed.js';

await seedAdmin();
