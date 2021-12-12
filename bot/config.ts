import dotenv from 'dotenv';
import { BigNumber } from 'ethers';

import { Environment, GasEstimates, Strategy } from '@localTypes';
import env from '@utils/env';
import formatStrategies from '@utils/formatStrategies';

import gasEstimates from '@dist/gasEstimates.json';

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
    region: string;
    secretName: string;
  };
  googleSpreadSheet: {
    id: string;
    clientEmail: string;
    privateKeyBase64: string;
  };
  slackChannelsWebhooks: {
    deals: string;
  };
  sentryDNS: string;
  slippageAllowancePercent: number;
  gasLimitMultiplicator: number;
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
    region: env('AWS_REGION'),
    secretName: env('AWS_SECRET_NAME'),
  },
  googleSpreadSheet: {
    id: env('GOOGLE_SPREADSHEET_SPREADSHEET_ID'),
    clientEmail: env('GOOGLE_SPREADSHEET_CLIENT_EMAIL'),
    privateKeyBase64: env('GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64'),
  },
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
  },
  sentryDNS: env('SENTRY_DNS_URL'),
  slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
  gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
  gasEstimates: gasEstimates as GasEstimates,
  gasCostMaximumThresholdWei: BigNumber.from(env('GAS_COST_MAXIMUM_THRESHOLD_WEI')),
  strategies,
};

export default config;
