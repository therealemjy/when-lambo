import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';

import { SWAP_GAS_ESTIMATES_FILE_PATH } from '@constants';
import { ExchangeIndex, GasEstimates } from '@localTypes';

import env from './env';
import formatStrategies from './formatStrategies';
import { ParsedStrategy, EnvConfig, Environment } from './types';

export * from './types';
export type { GasEstimates } from '@localTypes';

dotenv.config();

const parsedStrategies: ParsedStrategy[] = JSON.parse(env('STRINGIFIED_STRATEGIES'));

const getGasEstimates = () => {
  if (process.env.IS_FETCHING_GAS_ESTIMATES) {
    return {};
  }

  if (!fs.existsSync(SWAP_GAS_ESTIMATES_FILE_PATH)) {
    console.error(
      `Gas estimates file not found. It looks like gas estimates have not been fetched yet, please run npm run fetch-gas-estimates then run this command again.`
    );

    return {};
  }

  const fileContent = fs.readFileSync(SWAP_GAS_ESTIMATES_FILE_PATH, 'utf8');
  return JSON.parse(fileContent);
};

const gasEstimates: GasEstimates = getGasEstimates();

const config: EnvConfig = {
  serverId: env('SERVER_ID'),
  aws: {
    mainnetWssRpcUrl: env('AWS_WSS_RPC_URL'),
    accessKeyIdEthNode: env('AWS_ACCESS_KEY_ID_ETH_NODE'),
    secretAccessKeyEthNode: env('AWS_SECRET_ACCESS_KEY_ETH_NODE'),
  },
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
  slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
  gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
  gasPriceMultiplicator: +env('GAS_PRICE_MULTIPLICATOR'),
  gasEstimates,
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
  testAccounts: {
    owner: {
      address: env('TEST_OWNER_ACCOUNT_MAINNET_ADDRESS'),
      privateKey: env('TEST_OWNER_ACCOUNT_MAINNET_ADDRESS'),
    },
    vault: {
      address: env('TEST_VAULT_ACCOUNT_MAINNET_ADDRESS'),
    },
    externalUser: {
      address: env('TEST_EXTERNAL_USER_ACCOUNT_MAINNET_ADDRESS'),
    },
  },
};

export default config;
