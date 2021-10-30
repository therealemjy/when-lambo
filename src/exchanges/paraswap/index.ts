import BigNumber from 'bignumber.js';
import axios from 'axios';

import { Exchange } from '@src/exchanges/types';

class Paraswap implements Exchange {
  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await axios.get('https://apiv5.paraswap.io/prices', {
      params: {
        srcToken: fromToken.address,
        srcDecimals: fromToken.decimals,
        destToken: toToken.address,
        destDecimals: toToken.decimals,
        amount: fromTokenDecimalAmount.toFixed(),
        side: 'SELL'
      }
    });

    return new BigNumber(res.data.priceRoute.destAmount);
  }
}

export default Paraswap;
