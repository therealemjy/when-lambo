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

export type LoanAmounts = {
  [key: string]: string;
};

export interface ParsedTradedToken {
  ADDRESS: string;
  SYMBOL: string;
  DECIMALS: string;
}

export interface Strategy {
  borrowedWethAmounts: BigNumber[];
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
}
