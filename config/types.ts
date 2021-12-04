import BigNumber from 'bignumber.js';
import { BigNumber as EtherBigNumber } from 'ethers';

import { ExchangeIndex, GasEstimates } from '@localTypes';

export type Environment = 'development' | 'test' | 'production';

export interface ParsedStrategy {
  TRADED_TOKEN_ADDRESS: string;
  TRADED_TOKEN_SYMBOL: string;
  TRADED_TOKEN_DECIMALS: string;
  STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: string;
  STRATEGY_BORROWED_INCREMENT_PERCENT: string;
}

export interface Strategy {
  borrowedWethAmounts: BigNumber[];
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
}

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
    wethAmountToBorrow: EtherBigNumber;
    sellingExchangeIndex: ExchangeIndex;
    tradedTokenAddress: string;
    tradedTokenAmountOutMin: EtherBigNumber;
    tradedTokenAmountOutExpected: EtherBigNumber;
    buyingExchangeIndex: ExchangeIndex;
    wethAmountOutMin: EtherBigNumber;
    wethAmountOutExpected: EtherBigNumber;
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
