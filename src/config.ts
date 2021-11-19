import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

import { Strategy } from '@src/types';

dotenv.config();

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
    wsRpcUrl: string;
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

const parsedStrategies: ParsedStrategy[] = JSON.parse(env('STRINGIFIED_STRATEGIES'));

const strategyToWeiAmounts = (baseWei: string, incrementPercent: number, incrementAmount: number): BigNumber[] => {
  const strategy = Array.from(Array(incrementAmount).keys()) as unknown as BigNumber[];
  const middleIndex = Math.round(strategy.length / 2);

  strategy.forEach((_, index) => {
    // If middle value we set the base value
    if (index === middleIndex) {
      strategy[index] = new BigNumber(baseWei);
      return;
    }

    const positionFromBase = index - middleIndex;
    const percent = (incrementPercent * positionFromBase) / 100 + 1;

    strategy[index] = new BigNumber(baseWei).multipliedBy(percent);
  });

  return strategy;
};

const config: EnvConfig = {
  serverId: env('SERVER_ID'),
  aws: {
    wsRpcUrl: env('AWS_WS_RPC_URL'),
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
