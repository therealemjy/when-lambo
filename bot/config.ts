import dotenv from 'dotenv';
import { BigNumber } from 'ethers';

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
  googleSpreadSheet: {
    id: string;
    clientEmail: string;
    privateKeyBase64: string;
  };
  slackChannelsWebhooks: {
    deals: string;
  };
  blocknativeApiKey: string;
  sentryDNS: string;
  testOwnerAccountPrivateKey: string;
  slippageAllowancePercent: number;
  gasLimitMultiplicator: number;
  maxPriorityFeePerGasMultiplicator: number;
  gasEstimates: GasEstimates;
  gasCostMaximumThresholdWei: BigNumber;
  strategies: Strategy[];
}

const strategies: Strategy[] = formatStrategies(
  JSON.parse(env('STRINGIFIED_STRATEGIES')),
  +env('STRATEGY_BORROWED_AMOUNT_COUNT')
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
  googleSpreadSheet: {
    id: env('GOOGLE_SPREADSHEET_SPREADSHEET_ID'),
    clientEmail: env('GOOGLE_SPREADSHEET_CLIENT_EMAIL'),
    privateKeyBase64: env('GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64'),
  },
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
  },
  blocknativeApiKey: env('BLOCKNATIVE_API_KEY'),
  sentryDNS: env('SENTRY_DNS_URL'),
  testOwnerAccountPrivateKey: env('TEST_OWNER_ACCOUNT_MAINNET_PRIVATE_KEY'),
  slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
  gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
  maxPriorityFeePerGasMultiplicator: +env('MAX_PRIORITY_FEE_PER_GAS_MULTIPLICATOR'),
  gasEstimates: swapGasEstimates as GasEstimates,
  gasCostMaximumThresholdWei: BigNumber.from(env('GAS_COST_MAXIMUM_THRESHOLD_WEI')),
  strategies,
};

export default config;
