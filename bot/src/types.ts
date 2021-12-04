import BigNumber from 'bignumber.js';

import { ExchangeIndex } from '@localTypes';

import { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput } from '@bot/src/exchanges/types';
import Token from '@bot/src/tokens/Token';

export { default as Token } from '@bot/src/tokens/Token';
export type { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput };

// TODO: move to root of repo

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
