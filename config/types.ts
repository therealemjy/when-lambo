import BigNumber from 'bignumber.js';

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
