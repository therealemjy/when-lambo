import BigNumber from 'bignumber.js';

import { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput } from '@bot/src/exchanges/types';
import Token from '@bot/src/tokens/Token';

export { default as Token } from '@bot/src/tokens/Token';
export type { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput };

// TODO: move to root of repo
// These values need to correspond to the ones used in the Transactor contract
export enum ExchangeIndex {
  UniswapV2 = 0,
  Sushiswap = 1,
  CryptoCom = 2,
}

export interface Deal {
  timestamp: Date;
  exchangeIndex: ExchangeIndex;
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  slippageAllowancePercent: number;
  estimatedGasCost: BigNumber;
}

export type Path = [Deal, Deal];

export type UsedExchangeIndexes = {
  [fixedDecimalAmount: string]: ExchangeIndex;
};
