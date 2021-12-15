import { BigNumber } from 'ethers';

export type Environment = 'development' | 'test' | 'production';

// These values need to follow the exact same order as the ones used in the Transactor contract
export enum ExchangeIndex {
  UniswapV2 = 0,
  Sushiswap = 1,
  CryptoCom = 2,
}

export interface Token {
  symbol: string;
  address: string;
  decimals: number;
}

export type GasEstimates = {
  [exchangeIndex: number]: {
    [tokenAddress: string]: string;
  };
};

export interface ParsedStrategy {
  TRADED_TOKEN_ADDRESS: string;
  TRADED_TOKEN_SYMBOL: string;
  TRADED_TOKEN_DECIMALS: string;
  BORROWED_WETH_STARTING_BASE_AMOUNT: string;
  BORROWED_WETH_AMOUNT_INCREMENT_PERCENT: string;
}

export interface Strategy {
  borrowedWethAmounts: BigNumber[];
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
}
