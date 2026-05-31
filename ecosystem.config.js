module.exports = {
  apps: [{
    name: 'mgil-website',
    script: 'npm',
    args: 'start',
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
    env_production: {
      NODE_ENV: 'production',
    },
  }],
}
