const strategies = [
  [
    {
      TRADED_TOKEN_ADDRESS: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
      TRADED_TOKEN_SYMBOL: 'YFI',
      TRADED_TOKEN_DECIMALS: '18',
      STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '3028502177786837930',
      STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
    },
    {
      TRADED_TOKEN_ADDRESS: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
      TRADED_TOKEN_SYMBOL: 'SYN',
      TRADED_TOKEN_DECIMALS: '18',
      STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '3788400000000000000',
      STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
    },
    {
      TRADED_TOKEN_ADDRESS: '0x514910771af9ca656af840dff83e8264ecf986ca',
      TRADED_TOKEN_SYMBOL: 'LINK',
      TRADED_TOKEN_DECIMALS: '18',
      STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '1330000000000000000',
      STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
    },
    {
      TRADED_TOKEN_ADDRESS: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      TRADED_TOKEN_SYMBOL: 'MANA',
      TRADED_TOKEN_DECIMALS: '18',
      STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '4500000000000000000',
      STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
    },
    {
      TRADED_TOKEN_ADDRESS: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      TRADED_TOKEN_SYMBOL: 'AAVE',
      TRADED_TOKEN_DECIMALS: '18',
      STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '9000000000000000000',
      STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
    },
  ],
];

const baseEnvs = {
  NODE_ENV: 'production',
  AWS_ACCESS_KEY_ID_ETH_NODE: 'AKIA2R3ZISIADD4WZMV7',
  AWS_SECRET_ACCESS_KEY_ETH_NODE: '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',
  AWS_WSS_RPC_URL: 'wss://nd-omssuug64ravhkl6euczd7ixwq.wss.ethereum.managedblockchain.us-east-1.amazonaws.com',
  AWS_REGION: 'us-east-1',
  AWS_SECRET_NAME: 'arn:aws:secretsmanager:us-east-1:725566919168:secret:prod/secret-O2a6FL',
  SLACK_HOOK_URL_DEALS: '/services/T02KL0NM4JW/B02KL2YR274/uuVWs7PFmmu7HeJFznO0lnbr',
  GOOGLE_SPREADSHEET_CLIENT_EMAIL: 'log-bot@when-lambo-331122.iam.gserviceaccount.com',
  GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64:
    'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRRGZYcDliM3FweFBYcloKUTRsdDBLQlFIQzg5WWVHRkMwQ3FWK1NJaWhaQkdrTGdwSkFrTGI1cHEvR05VSURRcmt4YVJpaGNlN0tkNVF1Ugo0TDhBVmFiTFVwZjVvL0RNYndMSERzWTFlNEpjb28vT0VLbWxJVlN2VWVKbmxPT0Z0N1BxVkVjN1ByTjJPMkIrCjVIQkpGSWQwSWZUajVVanM4SFVVQ253b2NLbjJXazJkWlpJQ2llN2FhQk1ZajVQcDlyT1kwSlhIc3BoblV0aFAKbUZwMGxnWkEyUVpMZDJEL2diTnV3YVplcDhMbkVLRlFOQTVKckxVYkZCaEFoYU1XaytsRDF2a3M4MjVXVzhvZApXVm1xeW5NV0liUDloVVhUTmFCNWJ0MDYxMjB0K3Y5YjN3WFJFV2tLV056azhKZnREYklSNjFET2VOdjk5YldDCnJwYkk2RXRSQWdNQkFBRUNnZ0VBT01EV2RhVzBJYlNRdjU0b3oyV1lMZktUVUNITUJwMU96MWtvb0VhUmsvWUQKc3djczlueEc2cHQ4OHI1WEZHNk15TTBWbVRYMnNxYU5FNElLbFordGt2Q0gyNjU3VXI0TDh4NitYcjFrYUh3SApWTUNvRWVSUG00SVBKK2xOQzk4YWovbmM1V0V2Z09WaVJhdHVHaXRrcFMyeGhxdnRwUUlOaFV1S3MwMjQ2WFliCmhFaFpBdFpJL01NVkxERlRpN1BRbFlQSlRtL2ZaSndPeTl6WC9TNlovWnJCbEZWNlNidVhOQ0d4Z011elh5ZWUKZ1NGN2xoblBGQ1Z5NUIyVUZhUlZVSTZFTHJ4VTc4aWFuTTBHMWNUNmt6alhYZEY3SGVwYThBU1k3M2JtTEJUawpmOWlJejE1RVMzMzdBcENIVnBaaC94V0YyenZ0YlJhQTBSLzlSTHl1VndLQmdRRC9rclp2SktSMXNsblN2UTVDClhDMDBtaTFIL210NG9YQ3NRL051TnZQWUlkRkp0aG9DOERrQTI5d1daWGVmelQyZS9QeGx6eDFKcVdzUXpnNEYKY1gwWXExYkV2TzdZMS95T1FCNmVPNWNyWUZIazVRV3ZjRDJJY240TVl3eFJpamMvYVFsNWFJWnFLWklUQitUdwpYZWRFSXZXOW9BZ2hIa1hWR1ZiYzU4R3hXd0tCZ1FEZnZpT2MyMGM3UXBNaE9vTTRwY1hOU2hLSG5MREU0OUZCCklkT2xpd1pZdy9kZVF6eHBVV0xsVTk5bE5mZEtDYWljNUMzUXYrZitneVBiNkRHdEsxSVkvRjl5WmdoRGJPMzUKcWswS1hobUFGV0tzNHRoek9sWUo5RVM0VmZwYm1uNCtKRzRlR0FOSGVrd0UvYnJqaGcyUmdtVkNuQ3p2bDBqSAp0Qm9JS3dZSnd3S0JnUUN3cWNPOTlFQlNzMlJ2emd1clIzaGdJaXNtMXZHSFEyRlZVdXRVeGx1c2pVUFVoakpZCjBhRTF2TVRZSG0rZ1lRazFlMzhsQ1JRZnRTS3pUUnhZR3VqMFFvd0tGdWVyc1RGOVMwbGU2NlpGYjZGc2JmdU8KR0RJUXZjUHY0QS9GMVpyM0ZDNWVaQ2gxL2lKaFVWV3A2ZDlSTkRGV1VPY05yWlZzQnNZS2taRk1mUUtCZ0dyRQpCNmhzOXFPdmxCZlNIUlhsL09xR1F5dFZPUURyR1VwMFF0T0c4TU5nMStTeVB0eWV5b3RXSjQ3YlhxS0UwMkh5CmZHNVZkUFg5VEJvK3haMjF3MXBLNjV6aVZXVWZVTHZIYVRYZVMxclVXWjdZTEtObm5mRG9EL2JLaUVvNEFhL1QKb0h4Wnh3N1ByQURodHRHbGdVb0RLQ0ROOTU5bzJJRDdUMFRBaXdRVEFvR0JBTG5WTWdWbjZKRk16RFdhQWtnaQpsaitPdzlWSzFPZWVwSGVXckJBcU9GcTFaeVRLNHlyZ3ZSUWFWTHp5Sk9zWFZjN3R3K0FCQXI4UGoveDcxV3VmCnJHcmdaWWI0TWdidndkZlo4c29FTWxpOUZyVjY4Y1NjZGgwbG0wNEhFdG54TkxBcTQ5WDhyY3dhMjNwY1J3UjcKZGZoUnhVbEFXd2IwVGlnamo0WSsrcm1yCi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K',
  GOOGLE_SPREADSHEET_SPREADSHEET_ID: '1zHMFP3oMbB8opRr4A4uG6nQrsaSyrw1bNcRy4trkhQw',
  SENTRY_DNS_URL: 'https://05abb9f7dda745c382603d61f148eaf7@o1084392.ingest.sentry.io/6094170',
  BLOCKNATIVE_API_KEY: '6856435a-21ea-4468-8c53-f53db987a448',
  OWNER_ACCOUNT_MAINNET_ADDRESS: '0x9f452B20fFf1410859b9ff9aD5a23bf2B0dcC79f',
  VAULT_ACCOUNT_MAINNET_ADDRESS: '0x56bE12a70ef5d5E974b4716281356199564F23c3',
  SLIPPAGE_ALLOWANCE_PERCENT: '0.5',
  MAX_PRIORITY_FEE_PER_GAS_MULTIPLICATOR: '1.1',
  GAS_LIMIT_MULTIPLICATOR: '1.3',
  GAS_COST_MAXIMUM_THRESHOLD_WEI: '50000000000000000',
  STRATEGY_BORROWED_AMOUNT_COUNT: 11,
};

const baseOptions = {
  key: '~/.ssh/when-lambo.pem',
  user: 'ubuntu',
  ssh_options: 'StrictHostKeyChecking=no',
  ref: 'origin/master',
  repo: 'git@github.com:peel-chat/when-lambo-bot.git',
  path: '/home/ubuntu/when-lambo',
};

const getHookDeployCommand = (envName) => `pm2 start ./ecosystem.config.js --env ${envName}`;

module.exports = {
  strategies,
  apps: [
    {
      name: 'when-lambo-bot',
      script: './dist/index.js',
      wait_ready: false,
      watch: false,
      env_one: {
        ...baseEnvs,
        SERVER_ID: 1,
        STRINGIFIED_STRATEGIES: JSON.stringify(strategies[0]),
      },
    },
  ],
  deploy: {
    one: {
      ...baseOptions,
      'post-deploy': getHookDeployCommand('one'),
      host: ['ec2-54-174-159-107.compute-1.amazonaws.com'],
    },
  },
};
