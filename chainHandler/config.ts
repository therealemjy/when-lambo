import dotenv from 'dotenv';
import { BigNumber } from 'ethers';

import { Environment, ExchangeIndex, Token } from '@localTypes';
import env from '@utils/env';

import formatTradedTokens from '@root/utils/formatTradedTokens';

dotenv.config();

export interface EnvConfig {
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
  startFromTestBlock: boolean;
  tradedTokens: Token[];
  networks: {
    hardhat: {
      rpcUrl: string;
      blockNumber: number;
      accounts: {
        owner: {
          address: string;
        };
        vault: {
          address: string;
        };
        externalUser: {
          address: string;
        };
      };
    };
    rinkeby: {
      rpcUrl: string;
      accounts: {
        owner: {
          address: string;
          privateKey: string;
        };
        vault: {
          address: string;
        };
      };
    };
    mainnet: {
      rpcUrl: string;
      accounts: {
        owner: {
          address: string;
          privateKey: string;
        };
        vault: {
          address: string;
        };
      };
    };
  };
  testProfitableTrade: {
    wethAmountToBorrow: BigNumber;
    sellingExchangeIndex: ExchangeIndex;
    tradedTokenAddress: string;
    tradedTokenAmountOutMin: BigNumber;
    tradedTokenAmountOutExpected: BigNumber;
    buyingExchangeIndex: ExchangeIndex;
    wethAmountOutMin: BigNumber;
    wethAmountOutExpected: BigNumber;
  };
}

const tradedTokens: Token[] = formatTradedTokens(JSON.parse(env('STRINGIFIED_TRADED_TOKENS')));

const mainnetAccounts = {
  owner: {
    address: env('OWNER_ACCOUNT_MAINNET_ADDRESS'),
    privateKey: env('OWNER_ACCOUNT_MAINNET_PRIVATE_KEY'),
  },
  vault: {
    address: env('VAULT_ACCOUNT_MAINNET_ADDRESS'),
  },
};

const config: EnvConfig = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
  startFromTestBlock: !!process.env.START_FROM_BLOCK,
  tradedTokens,
  networks: {
    hardhat: {
      rpcUrl: env('MAINNET_FORKING_RPC_URL'),
      blockNumber: +env('TEST_PROFITABLE_TRADE_BLOCK_NUMBER'),
      accounts: {
        owner: {
          address: env('TEST_OWNER_ACCOUNT_MAINNET_ADDRESS'),
        },
        vault: {
          address: env('TEST_VAULT_ACCOUNT_MAINNET_ADDRESS'),
        },
        externalUser: {
          address: env('TEST_EXTERNAL_USER_ACCOUNT_MAINNET_ADDRESS'),
        },
      },
    },
    // We use rinkeby as a staging environment, on which we used the same accounts
    // as on mainnet
    rinkeby: {
      rpcUrl: env('RINKEBY_RPC_URL'),
      accounts: mainnetAccounts,
    },
    mainnet: {
      rpcUrl: env('MAINNET_RPC_URL'),
      accounts: mainnetAccounts,
    },
  },
  testProfitableTrade: {
    wethAmountToBorrow: BigNumber.from(env('TEST_PROFITABLE_TRADE_WETH_AMOUNT_TO_BORROW')),
    sellingExchangeIndex: +env('TEST_PROFITABLE_TRADE_SELLING_EXCHANGE_INDEX') as ExchangeIndex,
    tradedTokenAddress: env('TEST_PROFITABLE_TRADE_ADDRESS'),
    tradedTokenAmountOutMin: BigNumber.from(env('TEST_PROFITABLE_TRADE_TRADED_TOKEN_AMOUNT_OUT_MIN')),
    tradedTokenAmountOutExpected: BigNumber.from(env('TEST_PROFITABLE_TRADE_TRADED_TOKEN_AMOUNT_OUT_EXPECTED')),
    buyingExchangeIndex: +env('TEST_PROFITABLE_TRADE_BUYING_EXCHANGE_INDEX') as ExchangeIndex,
    wethAmountOutMin: BigNumber.from(env('TEST_PROFITABLE_TRADE_WETH_AMOUNT_OUT_MIN')),
    wethAmountOutExpected: BigNumber.from(env('TEST_PROFITABLE_TRADE_WETH_AMOUNT_OUT_EXPECTED')),
  },
};

export default config;
