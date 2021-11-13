import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';
import { errors } from 'ethers';

dotenv.config();

const env = (name: string): string => {
  const value = process.env[`${name}`];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

export interface EnvConfig {
  aws: {
    wsRpcUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  environment: 'development' | 'production';
  slippageAllowancePercent: number;
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
    // TODO: move outside of toToken (confusing)
    weiAmounts: BigNumber[];
  };
  googleSpreadSheet: {
    worksheetId: string;
    clientEmail: string;
    privateKeyBase64: string;
  };
  slackChannelsWebhooks: {
    deals: string;
    errors: string;
  };
}

const config: EnvConfig = {
  aws: {
    wsRpcUrl: env('AWS_WS_RPC_URL'),
    accessKeyId: env('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
  },
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
  toToken: {
    address: env('TRADED_TOKEN_ADDRESS'),
    symbol: env('TRADED_TOKEN_SYMBOL'),
    decimals: +env('TRADED_TOKEN_DECIMALS'),
    weiAmounts: env('TRADED_TOKEN_WEI_AMOUNTS')
      .split(',')
      .map((amount) => new BigNumber(amount)),
  },
  googleSpreadSheet: {
    worksheetId: env('GOOGLE_SPREADSHEET_WORKSHEET_ID'),
    clientEmail: env('GOOGLE_SPREADSHEET_CLIENT_EMAIL'),
    privateKeyBase64: env('GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64'),
  },
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
    errors: env('SLACK_HOOK_URL_ERRORS'),
  },
};

export default config;
