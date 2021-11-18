import BigNumber from 'bignumber.js';

import { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput } from '@src/exchanges/types';
import Token from '@src/tokens/Token';

export type { Token };
export type { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput };

export interface Strategy {
  googleSpreadSheetId: string;
  borrowedAmounts: BigNumber[];
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
}

export enum ExchangeName {
  UniswapV2 = 'Uniswap V2',
  Kyber = 'Kyber',
  Sushiswap = 'Sushiswap',
  BalancerV1 = 'Balancer V1',
  CurveV2 = 'Curve V2',
  CryptoCom = 'Crypto.com',
  OneInch = '1inch',
  ZeroX = 'ZeroX',
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
