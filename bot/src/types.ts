import { BigNumber } from 'ethers';

import { ExchangeIndex, Token } from '@localTypes';

import { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput } from '@bot/src/exchanges/types';

export type { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput };

export interface Deal {
  timestamp: Date;
  exchangeIndex: ExchangeIndex;
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  slippageAllowancePercent: number;
  gasEstimate: BigNumber;
  gasCostEstimate: BigNumber;
}

export type Path = [Deal, Deal];

export type UsedExchangeIndexes = {
  [fixedDecimalAmount: string]: ExchangeIndex;
};
