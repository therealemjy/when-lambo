import BigNumber from 'bignumber.js';

import { Token } from '@src/tokens';

export interface Exchange {
  getDecimalAmountOut: (args: {
    fromTokenDecimalAmount: BigNumber;
    fromToken: Token;
    toToken: Token;
  }) => Promise<BigNumber>;
}
