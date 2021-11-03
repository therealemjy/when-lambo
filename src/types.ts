import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';
import Token from '@src/tokens/Token';

export type { Token };
export type { Exchange };

export interface Deal {
  timestamp: Date;
  exchange: Exchange;
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  slippageAllowancePercent: number;
  estimatedGasCost: BigNumber;
}

export type Path = [Deal, Deal];
