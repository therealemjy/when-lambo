module.exports = {
  apps: [
    {
      name: 'when-lambo-communicator',
      script: './dist/communicator/index.js',
      wait_ready: false,
      watch: false,
      env_prod: {
        NODE_ENV: 'production',
        BLOCKNATIVE_API_KEY: '6856435a-21ea-4468-8c53-f53db987a448',
        MAX_PRIORITY_FEE_PER_GAS_MULTIPLICATOR: '1.1',
        SLACK_HOOK_URL_DEALS: '/services/T02KL0NM4JW/B02KL2YR274/uuVWs7PFmmu7HeJFznO0lnbr',
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
      'post-deploy': 'sudo pm2 start ./communicator.config.js --env prod',
      host: ['ec2-34-239-124-108.compute-1.amazonaws.com'],
    },
  },
};
