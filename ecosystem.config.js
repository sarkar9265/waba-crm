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
        PORT: 4001,
      },
    },
    {
      name: 'waba-client',
      script: 'pnpm',
      args: '--filter client run start',
      instances: 1, // Next.js standalone handles its own clustering usually
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'waba-admin',
      script: 'pnpm',
      args: '--filter admin run start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4002,
      },
    },
    {
      name: 'waba-worker',
      script: 'pnpm',
      args: '--filter worker run start:prod',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
