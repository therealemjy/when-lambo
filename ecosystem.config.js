import strategy1 from './strategies/1.json';
import strategy2 from './strategies/2.json';
import strategy3 from './strategies/3.json';
import strategy4 from './strategies/4.json';

const baseEnvs = {
  NODE_ENV: 'production',
  AWS_WS_RPC_URL: 'wss://nd-omssuug64ravhkl6euczd7ixwq.wss.ethereum.managedblockchain.us-east-1.amazonaws.com',
  AWS_ACCESS_KEY_ID: 'AKIA2R3ZISIADD4WZMV7',
  AWS_SECRET_ACCESS_KEY: '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',
  SLACK_HOOK_URL_DEALS: '/services/T02KL0NM4JW/B02KL2YR274/uuVWs7PFmmu7HeJFznO0lnbr',
  SLACK_HOOK_URL_ERRORS: '/services/T02KL0NM4JW/B02MY8HCBH6/emYh5ABeek7BtSgaLAEUlfxo',
  SLIPPAGE_ALLOWANCE_PERCENT: '0.5',
  GAS_LIMIT_MULTIPLICATOR: '1.2',
  GAS_PRICE_MULTIPLICATOR: '1.1',
  GOOGLE_SPREADSHEET_CLIENT_EMAIL: 'log-bot@when-lambo-331122.iam.gserviceaccount.com',
  GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64:
    'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRRGZYcDliM3FweFBYcloKUTRsdDBLQlFIQzg5WWVHRkMwQ3FWK1NJaWhaQkdrTGdwSkFrTGI1cHEvR05VSURRcmt4YVJpaGNlN0tkNVF1Ugo0TDhBVmFiTFVwZjVvL0RNYndMSERzWTFlNEpjb28vT0VLbWxJVlN2VWVKbmxPT0Z0N1BxVkVjN1ByTjJPMkIrCjVIQkpGSWQwSWZUajVVanM4SFVVQ253b2NLbjJXazJkWlpJQ2llN2FhQk1ZajVQcDlyT1kwSlhIc3BoblV0aFAKbUZwMGxnWkEyUVpMZDJEL2diTnV3YVplcDhMbkVLRlFOQTVKckxVYkZCaEFoYU1XaytsRDF2a3M4MjVXVzhvZApXVm1xeW5NV0liUDloVVhUTmFCNWJ0MDYxMjB0K3Y5YjN3WFJFV2tLV056azhKZnREYklSNjFET2VOdjk5YldDCnJwYkk2RXRSQWdNQkFBRUNnZ0VBT01EV2RhVzBJYlNRdjU0b3oyV1lMZktUVUNITUJwMU96MWtvb0VhUmsvWUQKc3djczlueEc2cHQ4OHI1WEZHNk15TTBWbVRYMnNxYU5FNElLbFordGt2Q0gyNjU3VXI0TDh4NitYcjFrYUh3SApWTUNvRWVSUG00SVBKK2xOQzk4YWovbmM1V0V2Z09WaVJhdHVHaXRrcFMyeGhxdnRwUUlOaFV1S3MwMjQ2WFliCmhFaFpBdFpJL01NVkxERlRpN1BRbFlQSlRtL2ZaSndPeTl6WC9TNlovWnJCbEZWNlNidVhOQ0d4Z011elh5ZWUKZ1NGN2xoblBGQ1Z5NUIyVUZhUlZVSTZFTHJ4VTc4aWFuTTBHMWNUNmt6alhYZEY3SGVwYThBU1k3M2JtTEJUawpmOWlJejE1RVMzMzdBcENIVnBaaC94V0YyenZ0YlJhQTBSLzlSTHl1VndLQmdRRC9rclp2SktSMXNsblN2UTVDClhDMDBtaTFIL210NG9YQ3NRL051TnZQWUlkRkp0aG9DOERrQTI5d1daWGVmelQyZS9QeGx6eDFKcVdzUXpnNEYKY1gwWXExYkV2TzdZMS95T1FCNmVPNWNyWUZIazVRV3ZjRDJJY240TVl3eFJpamMvYVFsNWFJWnFLWklUQitUdwpYZWRFSXZXOW9BZ2hIa1hWR1ZiYzU4R3hXd0tCZ1FEZnZpT2MyMGM3UXBNaE9vTTRwY1hOU2hLSG5MREU0OUZCCklkT2xpd1pZdy9kZVF6eHBVV0xsVTk5bE5mZEtDYWljNUMzUXYrZitneVBiNkRHdEsxSVkvRjl5WmdoRGJPMzUKcWswS1hobUFGV0tzNHRoek9sWUo5RVM0VmZwYm1uNCtKRzRlR0FOSGVrd0UvYnJqaGcyUmdtVkNuQ3p2bDBqSAp0Qm9JS3dZSnd3S0JnUUN3cWNPOTlFQlNzMlJ2emd1clIzaGdJaXNtMXZHSFEyRlZVdXRVeGx1c2pVUFVoakpZCjBhRTF2TVRZSG0rZ1lRazFlMzhsQ1JRZnRTS3pUUnhZR3VqMFFvd0tGdWVyc1RGOVMwbGU2NlpGYjZGc2JmdU8KR0RJUXZjUHY0QS9GMVpyM0ZDNWVaQ2gxL2lKaFVWV3A2ZDlSTkRGV1VPY05yWlZzQnNZS2taRk1mUUtCZ0dyRQpCNmhzOXFPdmxCZlNIUlhsL09xR1F5dFZPUURyR1VwMFF0T0c4TU5nMStTeVB0eWV5b3RXSjQ3YlhxS0UwMkh5CmZHNVZkUFg5VEJvK3haMjF3MXBLNjV6aVZXVWZVTHZIYVRYZVMxclVXWjdZTEtObm5mRG9EL2JLaUVvNEFhL1QKb0h4Wnh3N1ByQURodHRHbGdVb0RLQ0ROOTU5bzJJRDdUMFRBaXdRVEFvR0JBTG5WTWdWbjZKRk16RFdhQWtnaQpsaitPdzlWSzFPZWVwSGVXckJBcU9GcTFaeVRLNHlyZ3ZSUWFWTHp5Sk9zWFZjN3R3K0FCQXI4UGoveDcxV3VmCnJHcmdaWWI0TWdidndkZlo4c29FTWxpOUZyVjY4Y1NjZGgwbG0wNEhFdG54TkxBcTQ5WDhyY3dhMjNwY1J3UjcKZGZoUnhVbEFXd2IwVGlnamo0WSsrcm1yCi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K',
  STRATEGY_BORROWED_AMOUNTS_COUNT: 11,
};

const baseOptions = {
  key: '~/.ssh/when-lambo.pem',
  user: 'ubuntu',
  ssh_options: 'StrictHostKeyChecking=no',
  ref: 'origin/master',
  repo: 'git@github.com:peel-chat/bot-test.git',
  path: '/home/ubuntu/when-lambo',
};

module.exports = {
  apps: [
    {
      name: 'when-lambo-bot',
      script: './dist/index.js',
      wait_ready: false,
      watch: false,
      env_one: {
        ...baseEnvs,
        SERVER_ID: '1',
        STRINGIFIED_STRATEGY: JSON.stringify(strategy1),
      },
      env_two: {
        ...baseEnvs,
        STRINGIFIED_STRATEGY: JSON.stringify(strategy2),
      },
      env_three: {
        ...baseEnvs,
        STRINGIFIED_STRATEGY: JSON.stringify(strategy3),
      },
      env_four: {
        ...baseEnvs,
        STRINGIFIED_STRATEGY: JSON.stringify(strategy4),
      },
    },
  ],
  deploy: {
    one: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env 1',
      host: ['ec2-54-145-167-115.compute-1.amazonaws.com'],
    },
    two: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env 2',
      host: ['ec2-52-23-163-124.compute-1.amazonaws.com	'],
    },
    three: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env 3',
      host: ['ec2-54-163-43-1.compute-1.amazonaws.com'],
    },
    four: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env 4',
      host: ['ec2-52-87-227-199.compute-1.amazonaws.com'],
    },
  },
};
