import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import cryptoComRouterContract from './contracts/cryptoComRouter.json';

class CryptoCom implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.CryptoCom;
  }

  getDecimalAmountOutCallContext: Exchange['getDecimalAmountOutCallContext'] = ({ callReference, fromTokenDecimalAmounts, fromToken, toToken }) => {
    const calls = fromTokenDecimalAmounts.map(fromTokenDecimalAmount => {
      const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();

      return {
        reference: `getAmountsOut-${fixedFromTokenDecimalAmount}`,
        methodName: 'getAmountsOut',
        methodParameters: [fixedFromTokenDecimalAmount, [fromToken.address, toToken.address]],
      }
    });

    return {
      context: {
        reference: callReference,
        contractAddress: cryptoComRouterContract.address,
        abi: cryptoComRouterContract.abi,
        calls,
      },
      resultFormatter: (callResult) => (
        callResult.callsReturnContext
          // Filter out unsuccessful calls
          .filter(callReturnContext => callReturnContext.success)
          .map(callReturnContext => ({
            decimalAmountOut: new BigNumber(callReturnContext.returnValues[1].toString()),
            estimatedGas: new BigNumber(115000)
          }))
      )
    }
  };
}

export default CryptoCom;
