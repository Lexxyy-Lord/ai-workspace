module.exports = {
  apps: [
    {
      name: 'ai-workspace-single-port',
      cwd: './backend',
      script: 'src/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        SINGLE_PORT_MODE: process.env.SINGLE_PORT_MODE || 'true',
        FRONTEND_DIST_DIR: process.env.FRONTEND_DIST_DIR || '../frontend/out',
      },
      max_memory_restart: '512M',
    },
  ],
};
