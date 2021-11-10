import axios from 'axios';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

class OneInch implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.OneInch;
  }

  private _getExchangeName = (nameFrom1InchAPI: string) => {
    switch (nameFrom1InchAPI) {
      case 'UNISWAP_V2':
        return ExchangeName.UniswapV2;
      case 'KYBER':
        return ExchangeName.Kyber;
      case 'SUSHI':
        return ExchangeName.Sushiswap;
      case 'BALANCER_V2':
        return ExchangeName.BalancerV2;
      case 'CURVE_V2':
        return ExchangeName.CurveV2;
      case 'DEFISWAP':
        return ExchangeName.CryptoCom;
      default:
        return undefined
    }
  };

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    // TODO: add typing
    const res = await axios.get<any, any>('https://api.1inch.exchange/v3.0/1/quote', {
      params: {
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: fromTokenDecimalAmount.toFixed()
      }
    })

    const usedExchangeNames = res.data.protocols.flat(4).reduce((allUsedExchangeNames: ExchangeName[], protocol: any) => {
      const exchangeName = this._getExchangeName(protocol.name);
      return !exchangeName || allUsedExchangeNames.includes(exchangeName) ? allUsedExchangeNames : [...allUsedExchangeNames, exchangeName];
    }, [ExchangeName.OneInch] as ExchangeName[]);

    return {
      decimalAmountOut: new BigNumber(res.data.toTokenAmount),
      usedExchangeNames,
      estimatedGas: new BigNumber(res.data.estimatedGas)
    };
  }
}

export default OneInch;
