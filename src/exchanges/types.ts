import BigNumber from 'bignumber.js';

import { Token, ExchangeName } from '@src/types';

export interface Exchange {
  name: ExchangeName;
  getDecimalAmountOut: (args: {
    fromTokenDecimalAmount: BigNumber;
    fromToken: Token;
    toToken: Token;
  }) => Promise<IGetDecimalAmountOutput>;
}
export interface IGetDecimalAmountOutput {
  decimalAmountOut: BigNumber;
  usedExchangeNames: ExchangeName[];
  estimatedGas: BigNumber;
}
