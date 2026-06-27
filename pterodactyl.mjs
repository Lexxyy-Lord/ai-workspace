import './scripts/load-runtime-env.mjs';
import { spawnSync } from 'node:child_process';

const build = spawnSync('npm', ['run', 'build', '--workspace', 'frontend'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (build.status !== 0) {
  process.exit(build.status || 1);
}

await import('./backend/src/server.js');
