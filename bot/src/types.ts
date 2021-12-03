import BigNumber from 'bignumber.js';

import { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput } from '@bot/src/exchanges/types';
import Token from '@bot/src/tokens/Token';

export { default as Token } from '@bot/src/tokens/Token';
export type { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput };

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
