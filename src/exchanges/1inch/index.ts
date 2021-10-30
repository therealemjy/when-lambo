import BigNumber from 'bignumber.js';
import axios from 'axios';

import { Exchange } from '@src/exchanges/types';


class OneInch implements Exchange {
  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await axios.get('https://api.1inch.exchange/v3.0/1/quote', {
      params: {
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: fromTokenDecimalAmount.toFixed()
      }
    });

    return new BigNumber(res.data.toTokenAmount);
  }
}

export default OneInch;
