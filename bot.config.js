const tradedTokens = [
  [
    {
      ADDRESS: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
      SYMBOL: 'SHIB',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x514910771af9ca656af840dff83e8264ecf986ca',
      SYMBOL: 'LINK',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      SYMBOL: 'MANA',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      SYMBOL: 'AAVE',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      SYMBOL: 'WBTC',
      DECIMALS: '8',
    },
    {
      ADDRESS: '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
      SYMBOL: 'TOKE',
      DECIMALS: '18',
    },
  ],
  [
    {
      ADDRESS: '0x408e41876cccdc0f92210600ef50372656052a38',
      SYMBOL: 'REN',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x87d73e916d7057945c9bcd8cdd94e42a6f47f776',
      SYMBOL: 'NTFX',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68',
      SYMBOL: 'INV',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
      SYMBOL: 'FTM',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff',
      SYMBOL: 'SRM',
      DECIMALS: '6',
    },
    {
      ADDRESS: '0xbc396689893d065f41bc2c6ecbee5e0085233447',
      SYMBOL: 'PERP',
      DECIMALS: '18',
    },
  ],
  [
    {
      ADDRESS: '0xd291e7a03283640fdc51b121ac401383a46cc623',
      SYMBOL: 'RGT',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
      SYMBOL: 'YFI',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0xd533a949740bb3306d119cc777fa900ba034cd52',
      SYMBOL: 'CRV',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
      SYMBOL: 'SNX',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44',
      SYMBOL: 'KP3R',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
      SYMBOL: 'GALA',
      DECIMALS: '8',
    },
  ],
  [
    {
      ADDRESS: '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9',
      SYMBOL: 'FTT',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
      SYMBOL: 'ENS',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0xbc396689893d065f41bc2c6ecbee5e0085233447',
      SYMBOL: 'PERP',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x111111111117dc0aa78b770fa6a738034120c302',
      SYMBOL: '1INCH',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
      SYMBOL: 'MATIC',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0xc00e94cb662c3520282e6f5717214004a7f26888',
      SYMBOL: 'COMP',
      DECIMALS: '18',
    },
  ],
  [
    {
      ADDRESS: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      SYMBOL: 'UNI',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
      SYMBOL: 'GRT',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0xDDB3422497E61e13543BeA06989C0789117555c5',
      SYMBOL: 'COTI',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      SYMBOL: 'MKR',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
      SYMBOL: 'SUSHI',
      DECIMALS: '18',
    },
    {
      ADDRESS: '0x8290333cef9e6d528dd5618fb97a76f268f3edd4',
      SYMBOL: 'ANKR',
      DECIMALS: '18',
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
  SLACK_HOOK_URL_DEALS: 'https://hooks.slack.com/services/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',
  GOOGLE_SPREADSHEET_CLIENT_EMAIL: 'log-bot@when-lambo-331122.iam.gserviceaccount.com',
  GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64:
    'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRRGZYcDliM3FweFBYcloKUTRsdDBLQlFIQzg5WWVHRkMwQ3FWK1NJaWhaQkdrTGdwSkFrTGI1cHEvR05VSURRcmt4YVJpaGNlN0tkNVF1Ugo0TDhBVmFiTFVwZjVvL0RNYndMSERzWTFlNEpjb28vT0VLbWxJVlN2VWVKbmxPT0Z0N1BxVkVjN1ByTjJPMkIrCjVIQkpGSWQwSWZUajVVanM4SFVVQ253b2NLbjJXazJkWlpJQ2llN2FhQk1ZajVQcDlyT1kwSlhIc3BoblV0aFAKbUZwMGxnWkEyUVpMZDJEL2diTnV3YVplcDhMbkVLRlFOQTVKckxVYkZCaEFoYU1XaytsRDF2a3M4MjVXVzhvZApXVm1xeW5NV0liUDloVVhUTmFCNWJ0MDYxMjB0K3Y5YjN3WFJFV2tLV056azhKZnREYklSNjFET2VOdjk5YldDCnJwYkk2RXRSQWdNQkFBRUNnZ0VBT01EV2RhVzBJYlNRdjU0b3oyV1lMZktUVUNITUJwMU96MWtvb0VhUmsvWUQKc3djczlueEc2cHQ4OHI1WEZHNk15TTBWbVRYMnNxYU5FNElLbFordGt2Q0gyNjU3VXI0TDh4NitYcjFrYUh3SApWTUNvRWVSUG00SVBKK2xOQzk4YWovbmM1V0V2Z09WaVJhdHVHaXRrcFMyeGhxdnRwUUlOaFV1S3MwMjQ2WFliCmhFaFpBdFpJL01NVkxERlRpN1BRbFlQSlRtL2ZaSndPeTl6WC9TNlovWnJCbEZWNlNidVhOQ0d4Z011elh5ZWUKZ1NGN2xoblBGQ1Z5NUIyVUZhUlZVSTZFTHJ4VTc4aWFuTTBHMWNUNmt6alhYZEY3SGVwYThBU1k3M2JtTEJUawpmOWlJejE1RVMzMzdBcENIVnBaaC94V0YyenZ0YlJhQTBSLzlSTHl1VndLQmdRRC9rclp2SktSMXNsblN2UTVDClhDMDBtaTFIL210NG9YQ3NRL051TnZQWUlkRkp0aG9DOERrQTI5d1daWGVmelQyZS9QeGx6eDFKcVdzUXpnNEYKY1gwWXExYkV2TzdZMS95T1FCNmVPNWNyWUZIazVRV3ZjRDJJY240TVl3eFJpamMvYVFsNWFJWnFLWklUQitUdwpYZWRFSXZXOW9BZ2hIa1hWR1ZiYzU4R3hXd0tCZ1FEZnZpT2MyMGM3UXBNaE9vTTRwY1hOU2hLSG5MREU0OUZCCklkT2xpd1pZdy9kZVF6eHBVV0xsVTk5bE5mZEtDYWljNUMzUXYrZitneVBiNkRHdEsxSVkvRjl5WmdoRGJPMzUKcWswS1hobUFGV0tzNHRoek9sWUo5RVM0VmZwYm1uNCtKRzRlR0FOSGVrd0UvYnJqaGcyUmdtVkNuQ3p2bDBqSAp0Qm9JS3dZSnd3S0JnUUN3cWNPOTlFQlNzMlJ2emd1clIzaGdJaXNtMXZHSFEyRlZVdXRVeGx1c2pVUFVoakpZCjBhRTF2TVRZSG0rZ1lRazFlMzhsQ1JRZnRTS3pUUnhZR3VqMFFvd0tGdWVyc1RGOVMwbGU2NlpGYjZGc2JmdU8KR0RJUXZjUHY0QS9GMVpyM0ZDNWVaQ2gxL2lKaFVWV3A2ZDlSTkRGV1VPY05yWlZzQnNZS2taRk1mUUtCZ0dyRQpCNmhzOXFPdmxCZlNIUlhsL09xR1F5dFZPUURyR1VwMFF0T0c4TU5nMStTeVB0eWV5b3RXSjQ3YlhxS0UwMkh5CmZHNVZkUFg5VEJvK3haMjF3MXBLNjV6aVZXVWZVTHZIYVRYZVMxclVXWjdZTEtObm5mRG9EL2JLaUVvNEFhL1QKb0h4Wnh3N1ByQURodHRHbGdVb0RLQ0ROOTU5bzJJRDdUMFRBaXdRVEFvR0JBTG5WTWdWbjZKRk16RFdhQWtnaQpsaitPdzlWSzFPZWVwSGVXckJBcU9GcTFaeVRLNHlyZ3ZSUWFWTHp5Sk9zWFZjN3R3K0FCQXI4UGoveDcxV3VmCnJHcmdaWWI0TWdidndkZlo4c29FTWxpOUZyVjY4Y1NjZGgwbG0wNEhFdG54TkxBcTQ5WDhyY3dhMjNwY1J3UjcKZGZoUnhVbEFXd2IwVGlnamo0WSsrcm1yCi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K',
  GOOGLE_SPREADSHEET_SPREADSHEET_ID: '1zHMFP3oMbB8opRr4A4uG6nQrsaSyrw1bNcRy4trkhQw',
  SENTRY_DNS_URL: 'https://05abb9f7dda745c382603d61f148eaf7@o1084392.ingest.sentry.io/6094170',
  OWNER_ACCOUNT_MAINNET_ADDRESS: '0x9f452B20fFf1410859b9ff9aD5a23bf2B0dcC79f',
  VAULT_ACCOUNT_MAINNET_ADDRESS: '0x56bE12a70ef5d5E974b4716281356199564F23c3',
  SLIPPAGE_ALLOWANCE_PERCENT: '0.5',
  // Note: using anything lower than that will result in transactions failing.
  // I couldn't find the actual reason for it :/
  GAS_LIMIT_MULTIPLICATOR: '1.35',
  GAS_COST_MAXIMUM_THRESHOLD_WEI: '50000000000000000',
  LOAN_AMOUNTS_COUNT: '11',
  LOAN_AMOUNTS_INCREMENT_PERCENT: '10',
  COMMUNICATOR_WSS_URL: 'ws://34.239.124.108:80',
};

const baseOptions = {
  key: '~/.ssh/when-lambo.pem',
  user: 'ubuntu',
  ssh_options: 'StrictHostKeyChecking=no',
  ref: 'origin/master',
  repo: 'git@github.com:peel-chat/when-lambo-bot.git',
  path: '/home/ubuntu/when-lambo',
};

const getHookDeployCommand = (envName) => `pm2 start ./bot.config.js --env ${envName}`;

module.exports = {
  tradedTokens,
  baseEnvs,
  apps: [
    {
      name: 'when-lambo-bot',
      script: './dist/bot/index.js',
      wait_ready: false,
      watch: false,
      env_one: {
        ...baseEnvs,
        SERVER_ID: 1,
        STRINGIFIED_TRADED_TOKENS: JSON.stringify(tradedTokens[0]),
      },
      env_two: {
        ...baseEnvs,
        SERVER_ID: 2,
        STRINGIFIED_TRADED_TOKENS: JSON.stringify(tradedTokens[1]),
      },
      env_three: {
        ...baseEnvs,
        SERVER_ID: 3,
        STRINGIFIED_TRADED_TOKENS: JSON.stringify(tradedTokens[2]),
      },
      env_four: {
        ...baseEnvs,
        SERVER_ID: 4,
        STRINGIFIED_TRADED_TOKENS: JSON.stringify(tradedTokens[3]),
      },
      env_five: {
        ...baseEnvs,
        SERVER_ID: 5,
        STRINGIFIED_TRADED_TOKENS: JSON.stringify(tradedTokens[4]),
      },
    },
  ],
  deploy: {
    one: {
      ...baseOptions,
      'post-deploy': getHookDeployCommand('one'),
      host: ['ec2-52-91-212-133.compute-1.amazonaws.com'],
    },
    two: {
      ...baseOptions,
      'post-deploy': getHookDeployCommand('two'),
      host: ['ec2-52-207-222-24.compute-1.amazonaws.com'],
    },
    three: {
      ...baseOptions,
      'post-deploy': getHookDeployCommand('three'),
      host: ['ec2-54-211-140-43.compute-1.amazonaws.com'],
    },
    four: {
      ...baseOptions,
      'post-deploy': getHookDeployCommand('four'),
      host: ['ec2-54-175-205-29.compute-1.amazonaws.com'],
    },
    five: {
      ...baseOptions,
      'post-deploy': getHookDeployCommand('five'),
      host: ['ec2-3-87-52-230.compute-1.amazonaws.com'],
    },
  },
};
