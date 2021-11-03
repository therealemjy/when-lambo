import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';
import Token from '@src/tokens/Token';

export type { Token };
export type { Exchange };

export interface Deal {
  timestamp: Date;
  exchangeName: string;
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  slippageAllowancePercent: number;
}

export type Path = [Deal, Deal];
