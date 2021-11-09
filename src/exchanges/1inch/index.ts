import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

class OneInch implements Exchange {
  name: ExchangeName;
  estimatedGasForSwap: BigNumber;

  constructor() {
    this.name = ExchangeName.OneInch;
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    return {
      decimalAmountOut: new BigNumber(0),
      usedExchangeNames: []
    };
  }
}

export default OneInch;
