import BigNumber from 'bignumber.js';

import { Token } from '@src/tokens/types';

export interface Exchange {
  getDecimalsOut: (args: { fromTokenDecimalAmount: BigNumber; fromToken: Token; toToken: Token }) => Promise<BigNumber>;
}
