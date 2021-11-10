import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';
import Token from '@src/tokens/Token';

export type { Token };
export type { Exchange };

export enum ExchangeName {
  UniswapV2 = 'Uniswap V2',
  Kyber = 'Kyber',
  Sushiswap = 'Sushiswap',
  BalancerV2 = 'Balancer V2',
  CurveV2 = 'Curve V2',
  CryptoCom = 'Crypto.com',
  OneInch = '1inch',
}

export interface Deal {
  timestamp: Date;
  exchange: Exchange;
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  slippageAllowancePercent: number;
  estimatedGasCost: BigNumber;
  usedExchangeNames: ExchangeName[];
}

export type Path = [Deal, Deal];
