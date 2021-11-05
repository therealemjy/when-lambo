import BigNumber from 'bignumber.js';

import { Token } from '@src/types';

export interface Exchange {
  name: string;
  estimatedGasForSwap: BigNumber; // in Wei
  getDecimalAmountOut: (args: {
    fromTokenDecimalAmount: BigNumber;
    fromToken: Token;
    toToken: Token;
  }) => Promise<BigNumber>;
}
