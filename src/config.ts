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
  GOOGLE_SPREADSHEET_WORKSHEET_ID: string;
  TRADED_TOKEN_ADDRESS: string;
  TRADED_TOKEN_SYMBOL: string;
  TRADED_TOKEN_DECIMALS: string;
  TRADED_TOKEN_WEI_AMOUNTS: string;
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
    clientEmail: string;
    privateKeyBase64: string;
  };
  slackChannelsWebhooks: {
    deals: string;
    errors: string;
  };
}

const parsedStrategies: ParsedStrategy[] = JSON.parse(env('STRINGIFIED_STRATEGIES'));

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
    clientEmail: env('GOOGLE_SPREADSHEET_CLIENT_EMAIL'),
    privateKeyBase64: env('GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64'),
  },
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
    errors: env('SLACK_HOOK_URL_ERRORS'),
  },
  strategies: parsedStrategies.map((parsedStrategy: ParsedStrategy) => ({
    googleSpreadSheetId: parsedStrategy.GOOGLE_SPREADSHEET_WORKSHEET_ID,
    toToken: {
      address: parsedStrategy.TRADED_TOKEN_ADDRESS,
      symbol: parsedStrategy.TRADED_TOKEN_SYMBOL,
      decimals: +parsedStrategy.TRADED_TOKEN_DECIMALS,
      weiAmounts: parsedStrategy.TRADED_TOKEN_WEI_AMOUNTS.split(',').map((amount: string) => new BigNumber(amount)),
    },
  })),
};

export default config;
