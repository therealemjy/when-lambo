import dotenv from 'dotenv';
import { BigNumber } from 'ethers';

import { Environment, GasEstimates, Token } from '@localTypes';
import env from '@utils/env';

import formatTradedTokens from '@root/utils/formatTradedTokens';

import gasEstimates from '@dist/gasEstimates.json';

dotenv.config();

export interface EnvConfig {
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
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
  slippageAllowancePercent: number;
  gasLimitMultiplicator: number;
  gasEstimates: GasEstimates;
  gasCostMaximumThresholdWei: BigNumber;
  tradedTokens: Token[];
  communicationWssUrl: string;
}

const tradedTokens: Token[] = formatTradedTokens(JSON.parse(env('STRINGIFIED_TRADED_TOKENS')));

const config: EnvConfig = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
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
  communicationWssUrl: env('COMMUNICATOR_WSS_URL'),
  slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
  gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
  gasEstimates: gasEstimates as GasEstimates,
  gasCostMaximumThresholdWei: BigNumber.from(env('GAS_COST_MAXIMUM_THRESHOLD_WEI')),
  tradedTokens,
};

export default config;
