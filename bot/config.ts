import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

import { Environment, GasEstimates, Strategy } from '@localTypes';
import env from '@utils/env';
import formatStrategies from '@utils/formatStrategies';

import swapGasEstimates from '@dist/swapGasEstimates.json';

dotenv.config();

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
  gasEstimates: GasEstimates;
  gasCostMaximumThresholdWei: BigNumber;
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
  testOwnerAccountPrivateKey: string;
}

const strategies: Strategy[] = formatStrategies(
  JSON.parse(env('STRINGIFIED_STRATEGIES')),
  +env('STRATEGY_BORROWED_AMOUNTS_COUNT')
);

const config: EnvConfig = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
  serverId: env('SERVER_ID'),
  aws: {
    mainnetWssRpcUrl: env('AWS_WSS_RPC_URL'),
    accessKeyIdEthNode: env('AWS_ACCESS_KEY_ID_ETH_NODE'),
    secretAccessKeyEthNode: env('AWS_SECRET_ACCESS_KEY_ETH_NODE'),
  },
  slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
  gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
  gasPriceMultiplicator: +env('GAS_PRICE_MULTIPLICATOR'),
  gasEstimates: swapGasEstimates as GasEstimates,
  gasCostMaximumThresholdWei: new BigNumber(env('GAS_COST_MAXIMUM_THRESHOLD_WEI')),
  googleSpreadSheet: {
    id: env('GOOGLE_SPREADSHEET_SPREADSHEET_ID'),
    clientEmail: env('GOOGLE_SPREADSHEET_CLIENT_EMAIL'),
    privateKeyBase64: env('GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64'),
  },
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
    errors: env('SLACK_HOOK_URL_ERRORS'),
  },
  strategies,
  testOwnerAccountPrivateKey: env('TEST_OWNER_ACCOUNT_MAINNET_PRIVATE_KEY'),
};

export default config;
