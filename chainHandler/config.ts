import dotenv from 'dotenv';
import { ethers, BigNumber } from 'ethers';

import { Environment, ExchangeIndex, Strategy } from '@localTypes';

import env from '../utils/env';
import formatStrategies from '../utils/formatStrategies';

dotenv.config();

export interface EnvConfig {
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
  strategies: Strategy[];
  mainnetForkingRpcUrl: string;
  testProfitableTrade: {
    blockNumber: number;
    wethAmountToBorrow: BigNumber;
    sellingExchangeIndex: ExchangeIndex;
    tradedTokenAddress: string;
    tradedTokenAmountOutMin: BigNumber;
    tradedTokenAmountOutExpected: BigNumber;
    buyingExchangeIndex: ExchangeIndex;
    wethAmountOutMin: BigNumber;
    wethAmountOutExpected: BigNumber;
  };
  testAccounts: {
    owner: {
      address: string;
      privateKey: string;
    };
    vault: {
      address: string;
    };
    externalUser: {
      address: string;
    };
  };
}

const strategies: Strategy[] = formatStrategies(
  JSON.parse(env('STRINGIFIED_STRATEGIES')),
  +env('STRATEGY_BORROWED_AMOUNTS_COUNT')
);

const config: EnvConfig = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
  strategies,
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
      privateKey: env('TEST_OWNER_ACCOUNT_MAINNET_PRIVATE_KEY'),
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
