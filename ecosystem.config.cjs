module.exports = {
  apps: [
    {
      name: 'ai-workspace-backend',
      cwd: './backend',
      script: 'src/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
      max_memory_restart: '512M',
    },
    {
      name: 'ai-workspace-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 0.0.0.0 -p 3001',
      interpreter: 'node',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
      max_memory_restart: '512M',
    },
  ],
};
