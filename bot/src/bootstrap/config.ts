import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

import { Strategy } from '@src/types';

dotenv.config();

const testingCoins = [
  {
    TRADED_TOKEN_ADDRESS: '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9',
    TRADED_TOKEN_SYMBOL: 'FTT',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '1300000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
    TRADED_TOKEN_SYMBOL: 'ENS',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '1300000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0xbc396689893d065f41bc2c6ecbee5e0085233447',
    TRADED_TOKEN_SYMBOL: 'PERP',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '2820000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0x111111111117dc0aa78b770fa6a738034120c302',
    TRADED_TOKEN_SYMBOL: '1INCH',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '4300000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    TRADED_TOKEN_SYMBOL: 'MATIC',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '6020000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    TRADED_TOKEN_SYMBOL: 'COMP',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '4300000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
];

const env = (name: string): string => {
  const value = process.env[`${name}`];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

interface ParsedStrategy {
  TRADED_TOKEN_ADDRESS: string;
  TRADED_TOKEN_SYMBOL: string;
  TRADED_TOKEN_DECIMALS: string;
  STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: string;
  STRATEGY_BORROWED_INCREMENT_PERCENT: string;
}
export interface EnvConfig {
  serverId: string;
  aws: {
    mainnetWssRpcUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  isDev: boolean;
  isProd: boolean;
  slippageAllowancePercent: number;
  gasLimitMultiplicator: number;
  gasPriceMultiplicator: number;
  strategies: Strategy[];
  googleSpreadSheet: {
    id: string;
    clientEmail: string;
    privateKeyBase64: string;
  };
  slackChannelsWebhooks: {
    deals: string;
    errors: string;
  };
}

const parsedStrategies: ParsedStrategy[] =
  process.env.NODE_ENV === 'development' ? testingCoins : JSON.parse(env('STRINGIFIED_STRATEGIES'));

const strategyToWeiAmounts = (baseWei: string, incrementPercent: number, incrementAmount: number): BigNumber[] => {
  const strategy = Array.from(Array(incrementAmount).keys()) as unknown as BigNumber[];
  const middleIndex = Math.round(strategy.length / 2);

  strategy.forEach((_, index) => {
    strategy[index] = new BigNumber(baseWei);

    // If middle value we set the base value
    if (index === middleIndex) {
      return;
    }

    const positionFromBase = index - middleIndex;
    const percent = (incrementPercent * positionFromBase) / 100 + 1;

    strategy[index] = new BigNumber(strategy[index].multipliedBy(percent).toFixed(0));
  });

  return strategy;
};

const config: EnvConfig = {
  serverId: env('SERVER_ID'),
  aws: {
    mainnetWssRpcUrl: env('AWS_WSS_RPC_URL'),
    accessKeyId: env('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
  },
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
  slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
  gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
  gasPriceMultiplicator: +env('GAS_PRICE_MULTIPLICATOR'),
  googleSpreadSheet: {
    id: env('GOOGLE_SPREADSHEET_SPREADSHEET_ID'),
    clientEmail: env('GOOGLE_SPREADSHEET_CLIENT_EMAIL'),
    privateKeyBase64: env('GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64'),
  },
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
    errors: env('SLACK_HOOK_URL_ERRORS'),
  },
  strategies: parsedStrategies.map((parsedStrategy: ParsedStrategy) => ({
    borrowedAmounts: strategyToWeiAmounts(
      parsedStrategy.STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT,
      +parsedStrategy.STRATEGY_BORROWED_INCREMENT_PERCENT,
      +env('STRATEGY_BORROWED_AMOUNTS_COUNT')
    ),
    toToken: {
      address: parsedStrategy.TRADED_TOKEN_ADDRESS,
      symbol: parsedStrategy.TRADED_TOKEN_SYMBOL,
      decimals: +parsedStrategy.TRADED_TOKEN_DECIMALS,
    },
  })),
};

export default config;
