module.exports = {
  apps: [
    {
      name: 'when-lambo-bot',
      script: './dist/bot/index.js',
      wait_ready: false,
      watch: false,
      env_prod: {
        NODE_ENV: 'production',
        BLOCKNATIVE_API_KEY: '6856435a-21ea-4468-8c53-f53db987a448',
        MAX_PRIORITY_FEE_PER_GAS_MULTIPLICATOR: '1.1',
      },
    },
  ],
  deploy: {
    prod: {
      key: '~/.ssh/when-lambo.pem',
      user: 'ubuntu',
      ssh_options: 'StrictHostKeyChecking=no',
      ref: 'origin/master',
      repo: 'git@github.com:peel-chat/when-lambo-bot.git',
      path: '/home/ubuntu/when-lambo',
      'post-deploy': 'pm2 start ./communicator.config.js --env prod',
      host: ['ec2-54-174-159-107.compute-1.amazonaws.com'],
    },
  },
};
