import dotenv from 'dotenv';
import { ethers, BigNumber } from 'ethers';

import { ExchangeIndex } from '@bot/src/types';

import formatStrategies from './formatStrategies';
import { ParsedStrategy, Strategy, Environment } from './types';

export * from './types';

dotenv.config();

export const env = (name: string): string => {
  const value = process.env[`${name}`];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

export interface EnvConfig {
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
  serverId: string;
  aws: {
    mainnetWssRpcUrl: string;
    accessKeyIdEthNode: string;
    secretAccessKeyEthNode: string;
  };
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
  mainnetForkingRpcUrl: string;
  testProfitableTrade: {
    blockNumber: number;
    wethAmountToBorrow: BigNumber;
    sellingExchangeIndex: ExchangeIndex; // TODO: do something smarter, so that it is automatically defined based on the ExchangeName type
    tradedTokenAddress: string;
    tradedTokenAmountOutMin: BigNumber;
    tradedTokenAmountOutExpected: BigNumber;
    buyingExchangeIndex: ExchangeIndex;
    wethAmountOutMin: BigNumber;
    wethAmountOutExpected: BigNumber;
  };
}

const parsedStrategies: ParsedStrategy[] = JSON.parse(env('STRINGIFIED_STRATEGIES'));

const config: EnvConfig = {
  serverId: env('SERVER_ID'),
  aws: {
    mainnetWssRpcUrl: env('AWS_WSS_RPC_URL'),
    accessKeyIdEthNode: env('AWS_ACCESS_KEY_ID_ETH_NODE'),
    secretAccessKeyEthNode: env('AWS_SECRET_ACCESS_KEY_ETH_NODE'),
  },
  environment: env('NODE_ENV') as Environment,
  isProd: env('NODE_ENV') === 'production',
  isDev: env('NODE_ENV') === 'development',
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
  strategies: formatStrategies(parsedStrategies, +env('STRATEGY_BORROWED_AMOUNTS_COUNT')),
  mainnetForkingRpcUrl: env('MAINNET_FORKING_RPC_URL'),
  testProfitableTrade: {
    blockNumber: +env('TEST_PROFITABLE_TRADE_BLOCK_NUMBER'),
    wethAmountToBorrow: ethers.BigNumber.from(env('TEST_PROFITABLE_TRADE_WETH_AMOUNT_TO_BORROW')),
    sellingExchangeIndex: +env('TEST_PROFITABLE_TRADE_SELLING_EXCHANGE_INDEX') as ExchangeIndex,
    tradedTokenAddress: env('TEST_PROFITABLE_TRADE_TRADED_TOKEN_ADDRESS'),
    tradedTokenAmountOutMin: ethers.BigNumber.from(env('TEST_PROFITABLE_TRADE_TRADED_TOKEN_AMOUNT_OUT_MIN')),
    tradedTokenAmountOutExpected: ethers.BigNumber.from(env('TEST_PROFITABLE_TRADE_TRADED_TOKEN_AMOUNT_OUT_EXPECTED')),
    buyingExchangeIndex: +env('TEST_PROFITABLE_TRADE_BUYING_EXCHANGE_INDEX') as ExchangeIndex,
    wethAmountOutMin: ethers.BigNumber.from(env('TEST_PROFITABLE_TRADE_WETH_AMOUNT_OUT_MIN')),
    wethAmountOutExpected: ethers.BigNumber.from(env('TEST_PROFITABLE_TRADE_WETH_AMOUNT_OUT_EXPECTED')),
  },
};

export default config;
