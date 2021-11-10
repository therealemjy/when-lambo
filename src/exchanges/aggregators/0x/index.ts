import axios from 'axios';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

class ZeroX implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.OneInch;
  }

  private _getExchangeName =  (nameFrom1InchAPI: string) => {
    switch (nameFrom1InchAPI) {
      case 'Uniswap_V2':
        return ExchangeName.UniswapV2;
      case 'Kyber':
        return ExchangeName.Kyber;
      case 'SushiSwap':
        return ExchangeName.Sushiswap;
      case 'Balancer_V2':
        return ExchangeName.BalancerV2;
      case 'Curve_V2':
        return ExchangeName.CurveV2;
      case 'CryptoCom':
        return ExchangeName.CryptoCom;
      default:
        return undefined
    }
  };

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    // TODO: add typing
    const res = await axios.get<any, any>('	https://api.0x.org/swap/v1/quote', {
      params: {
        sellToken: fromToken.address,
        buyToken: toToken.address,
        sellAmount: fromTokenDecimalAmount.toFixed()
      }
    })

    // TODO: handle protocol fee? See https://0x.org/docs/api#response-1

    // Get the sources from which a proportion of the deal comes from
    const usedExchangeNames = res.data.sources.reduce((allUsedExchangeNames: ExchangeName[], source: any) => {
      const exchangeName = this._getExchangeName(source.name);
      return source.proportion === '0' || !exchangeName || allUsedExchangeNames.includes(exchangeName) ? allUsedExchangeNames : [...allUsedExchangeNames, exchangeName];
    }, [ExchangeName.ZeroX] as ExchangeName[]);

    return {
      decimalAmountOut: new BigNumber(res.buyAmount),
      usedExchangeNames,
      estimatedGas: new BigNumber(res.data.estimatedGas)
    };
  }
}

export default ZeroX;
