import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

import { Strategy } from '@src/types';

dotenv.config();

const testingCoins = [
  {
    TRADED_TOKEN_ADDRESS: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    TRADED_TOKEN_SYMBOL: 'UNI',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '2000000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
    TRADED_TOKEN_SYMBOL: 'GTR',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '2000000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0xDDB3422497E61e13543BeA06989C0789117555c5',
    TRADED_TOKEN_SYMBOL: 'COTI',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '1500000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    TRADED_TOKEN_SYMBOL: 'MKR',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '2000000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    TRADED_TOKEN_SYMBOL: 'SUSHI',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '1300000000000000000',
    STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
  },
  {
    TRADED_TOKEN_ADDRESS: '0x8290333cef9e6d528dd5618fb97a76f268f3edd4',
    TRADED_TOKEN_SYMBOL: 'ANKR',
    TRADED_TOKEN_DECIMALS: '18',
    STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '2000000000000000000',
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
