module.exports = {
  apps: [
    {
      name: 'waba-api',
      script: 'pnpm',
      args: '--filter api run start:prod',
      instances: 'max', // or a specific number like 2
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'waba-client',
      script: 'pnpm',
      args: '--filter client run start',
      instances: 1, // Next.js standalone handles its own clustering usually, or run 1 instance per PM2
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
