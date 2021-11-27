import BigNumber from 'bignumber.js';

import { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput } from '@src/exchanges/types';
import Token from '@src/tokens/Token';

export type { Token };
export type { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput };

export interface Strategy {
  borrowedAmounts: BigNumber[];
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
}

// These values need to correspond to the ones used in the Transactor contract
export enum ExchangeName {
  UniswapV2 = 'UniswapV2',
  Sushiswap = 'Sushiswap',
  CryptoCom = 'CryptoCom',
}

export interface Deal {
  timestamp: Date;
  exchangeName: ExchangeName;
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  slippageAllowancePercent: number;
  estimatedGasCost: BigNumber;
}

export type Path = [Deal, Deal];

export type UsedExchangeNames = {
  [fixedDecimalAmount: string]: ExchangeName;
};
