const baseEnvs = {
  NODE_ENV: 'production',
  AWS_WS_RPC_URL: 'wss://nd-omssuug64ravhkl6euczd7ixwq.wss.ethereum.managedblockchain.us-east-1.amazonaws.com',
  AWS_ACCESS_KEY_ID: 'AKIA2R3ZISIADD4WZMV7',
  AWS_SECRET_ACCESS_KEY: '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',
  SLACK_HOOK_URL_DEALS: '/services/T02KL0NM4JW/B02KL2YR274/uuVWs7PFmmu7HeJFznO0lnbr',
  SLACK_HOOK_URL_ERRORS: '/services/T02KL0NM4JW/B02MY8HCBH6/emYh5ABeek7BtSgaLAEUlfxo',
  SLIPPAGE_ALLOWANCE_PERCENT: '0.5',
  GOOGLE_SPREADSHEET_CLIENT_EMAIL: 'log-bot@when-lambo-331122.iam.gserviceaccount.com',
  GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64:
    'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRRGZYcDliM3FweFBYcloKUTRsdDBLQlFIQzg5WWVHRkMwQ3FWK1NJaWhaQkdrTGdwSkFrTGI1cHEvR05VSURRcmt4YVJpaGNlN0tkNVF1Ugo0TDhBVmFiTFVwZjVvL0RNYndMSERzWTFlNEpjb28vT0VLbWxJVlN2VWVKbmxPT0Z0N1BxVkVjN1ByTjJPMkIrCjVIQkpGSWQwSWZUajVVanM4SFVVQ253b2NLbjJXazJkWlpJQ2llN2FhQk1ZajVQcDlyT1kwSlhIc3BoblV0aFAKbUZwMGxnWkEyUVpMZDJEL2diTnV3YVplcDhMbkVLRlFOQTVKckxVYkZCaEFoYU1XaytsRDF2a3M4MjVXVzhvZApXVm1xeW5NV0liUDloVVhUTmFCNWJ0MDYxMjB0K3Y5YjN3WFJFV2tLV056azhKZnREYklSNjFET2VOdjk5YldDCnJwYkk2RXRSQWdNQkFBRUNnZ0VBT01EV2RhVzBJYlNRdjU0b3oyV1lMZktUVUNITUJwMU96MWtvb0VhUmsvWUQKc3djczlueEc2cHQ4OHI1WEZHNk15TTBWbVRYMnNxYU5FNElLbFordGt2Q0gyNjU3VXI0TDh4NitYcjFrYUh3SApWTUNvRWVSUG00SVBKK2xOQzk4YWovbmM1V0V2Z09WaVJhdHVHaXRrcFMyeGhxdnRwUUlOaFV1S3MwMjQ2WFliCmhFaFpBdFpJL01NVkxERlRpN1BRbFlQSlRtL2ZaSndPeTl6WC9TNlovWnJCbEZWNlNidVhOQ0d4Z011elh5ZWUKZ1NGN2xoblBGQ1Z5NUIyVUZhUlZVSTZFTHJ4VTc4aWFuTTBHMWNUNmt6alhYZEY3SGVwYThBU1k3M2JtTEJUawpmOWlJejE1RVMzMzdBcENIVnBaaC94V0YyenZ0YlJhQTBSLzlSTHl1VndLQmdRRC9rclp2SktSMXNsblN2UTVDClhDMDBtaTFIL210NG9YQ3NRL051TnZQWUlkRkp0aG9DOERrQTI5d1daWGVmelQyZS9QeGx6eDFKcVdzUXpnNEYKY1gwWXExYkV2TzdZMS95T1FCNmVPNWNyWUZIazVRV3ZjRDJJY240TVl3eFJpamMvYVFsNWFJWnFLWklUQitUdwpYZWRFSXZXOW9BZ2hIa1hWR1ZiYzU4R3hXd0tCZ1FEZnZpT2MyMGM3UXBNaE9vTTRwY1hOU2hLSG5MREU0OUZCCklkT2xpd1pZdy9kZVF6eHBVV0xsVTk5bE5mZEtDYWljNUMzUXYrZitneVBiNkRHdEsxSVkvRjl5WmdoRGJPMzUKcWswS1hobUFGV0tzNHRoek9sWUo5RVM0VmZwYm1uNCtKRzRlR0FOSGVrd0UvYnJqaGcyUmdtVkNuQ3p2bDBqSAp0Qm9JS3dZSnd3S0JnUUN3cWNPOTlFQlNzMlJ2emd1clIzaGdJaXNtMXZHSFEyRlZVdXRVeGx1c2pVUFVoakpZCjBhRTF2TVRZSG0rZ1lRazFlMzhsQ1JRZnRTS3pUUnhZR3VqMFFvd0tGdWVyc1RGOVMwbGU2NlpGYjZGc2JmdU8KR0RJUXZjUHY0QS9GMVpyM0ZDNWVaQ2gxL2lKaFVWV3A2ZDlSTkRGV1VPY05yWlZzQnNZS2taRk1mUUtCZ0dyRQpCNmhzOXFPdmxCZlNIUlhsL09xR1F5dFZPUURyR1VwMFF0T0c4TU5nMStTeVB0eWV5b3RXSjQ3YlhxS0UwMkh5CmZHNVZkUFg5VEJvK3haMjF3MXBLNjV6aVZXVWZVTHZIYVRYZVMxclVXWjdZTEtObm5mRG9EL2JLaUVvNEFhL1QKb0h4Wnh3N1ByQURodHRHbGdVb0RLQ0ROOTU5bzJJRDdUMFRBaXdRVEFvR0JBTG5WTWdWbjZKRk16RFdhQWtnaQpsaitPdzlWSzFPZWVwSGVXckJBcU9GcTFaeVRLNHlyZ3ZSUWFWTHp5Sk9zWFZjN3R3K0FCQXI4UGoveDcxV3VmCnJHcmdaWWI0TWdidndkZlo4c29FTWxpOUZyVjY4Y1NjZGgwbG0wNEhFdG54TkxBcTQ5WDhyY3dhMjNwY1J3UjcKZGZoUnhVbEFXd2IwVGlnamo0WSsrcm1yCi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K',
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
      env_dai: {
        ...baseEnvs,
        GOOGLE_SPREADSHEET_WORKSHEET_ID: '1ka3JbjlSSjNnvwLhJ11c-mKwK2TJ622_elG9evOf4JI',
        TRADED_TOKEN_ADDRESS: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        TRADED_TOKEN_SYMBOL: 'DAI',
        TRADED_TOKEN_DECIMALS: '18',
        TRADED_TOKEN_WEI_AMOUNTS:
          '20000000000000000000,30000000000000000000,40000000000000000000,50000000000000000000,60000000000000000000',
      },
      env_shib: {
        ...baseEnvs,
        GOOGLE_SPREADSHEET_WORKSHEET_ID: '18XDhR2ICyAwfux1xeZ8o0i2HqsyjodF0NFLcnEUZYn0',
        TRADED_TOKEN_ADDRESS: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
        TRADED_TOKEN_SYMBOL: 'SHIB',
        TRADED_TOKEN_DECIMALS: '18',
        TRADED_TOKEN_WEI_AMOUNTS:
          '450000000000000000,400000000000000000,350000000000000000,300000000000000000,250000000000000000',
      },
      env_link: {
        ...baseEnvs,
        GOOGLE_SPREADSHEET_WORKSHEET_ID: '1_BU34XkJ4z6jEaY77SH-TFeoB1moD8Fqdw25823KnAM',
        TRADED_TOKEN_ADDRESS: '0x514910771af9ca656af840dff83e8264ecf986ca',
        TRADED_TOKEN_SYMBOL: 'LINK',
        TRADED_TOKEN_DECIMALS: '18',
        TRADED_TOKEN_WEI_AMOUNTS:
          '850000000000000000,875000000000000000,900000000000000000,925000000000000000,950000000000000000',
      },
      env_mana: {
        ...baseEnvs,
        GOOGLE_SPREADSHEET_WORKSHEET_ID: '11hKz-0mILcJY1FrLTIORcidw27tYsF0G10xRkkegIHQ',
        TRADED_TOKEN_ADDRESS: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
        TRADED_TOKEN_SYMBOL: 'MANA',
        TRADED_TOKEN_DECIMALS: '18',
        TRADED_TOKEN_WEI_AMOUNTS:
          '3000000000000000000,3500000000000000000,4500000000000000000,5000000000000000000,5500000000000000000',
      },
      env_aave: {
        ...baseEnvs,
        GOOGLE_SPREADSHEET_WORKSHEET_ID: '1-e3vMLwLPvSv8Fq2NpSUngke-oMxtsocaQxT_metpOA',
        TRADED_TOKEN_ADDRESS: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        TRADED_TOKEN_SYMBOL: 'AAVE',
        TRADED_TOKEN_DECIMALS: '18',
        TRADED_TOKEN_WEI_AMOUNTS:
          '8000000000000000000,9000000000000000000,10000000000000000000,20000000000000000000,30000000000000000000',
      },
      env_sand: {
        ...baseEnvs,
        GOOGLE_SPREADSHEET_WORKSHEET_ID: '13Px9n9sqNXQd25PNEzFCBhKv1pIQ4zbUIBVTyywJGIQ',
        TRADED_TOKEN_ADDRESS: '0x3845badade8e6dff049820680d1f14bd3903a5d0',
        TRADED_TOKEN_SYMBOL: 'SAND',
        TRADED_TOKEN_DECIMALS: '18',
        TRADED_TOKEN_WEI_AMOUNTS:
          '1000000000000000000,1500000000000000000,2000000000000000000,2500000000000000000,3000000000000000000',
      },
    },
  ],
  deploy: {
    dai: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env dai',
      host: ['ec2-3-91-241-119.compute-1.amazonaws.com'],
    },
    shib: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env shib',
      host: ['ec2-184-73-39-7.compute-1.amazonaws.com'],
    },
    link: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env link',
      host: ['ec2-3-89-131-117.compute-1.amazonaws.com'],
    },
    mana: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env mana',
      host: ['ec2-35-171-162-140.compute-1.amazonaws.com'],
    },
    aave: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env aave',
      host: ['ec2-3-91-151-108.compute-1.amazonaws.com'],
    },
    sand: {
      ...baseOptions,
      'post-deploy': 'npm install && npm run tsc && pm2 start ecosystem.config.js --env sand',
      host: ['ec2-184-72-215-181.compute-1.amazonaws.com'],
    },
  },
};
