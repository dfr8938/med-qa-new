module.exports = {
  apps: [
    {
      name: 'med-qa-backend',
      script: './index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '130.49.149.185',
        DOMAIN: 'medsester.ru'
      }
    }
  ]
};