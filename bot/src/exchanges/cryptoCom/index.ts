import BigNumber from 'bignumber.js';

import { ExchangeIndex } from '@localTypes';

import cryptoComRouterContract from '@resources/thirdPartyContracts/mainnet/cryptoComRouter.json';

import { Exchange } from '@bot/src/types';

class CryptoCom implements Exchange {
  index: ExchangeIndex;
  name: string;

  constructor() {
    this.index = ExchangeIndex.CryptoCom;
    this.name = ExchangeIndex[ExchangeIndex.CryptoCom];
  }

  getDecimalAmountOutCallContext: Exchange['getDecimalAmountOutCallContext'] = ({
    callReference,
    fromTokenDecimalAmounts,
    fromToken,
    toToken,
  }) => {
    const calls = fromTokenDecimalAmounts.map((fromTokenDecimalAmount) => {
      const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();

      return {
        reference: `getAmountsOut-${fixedFromTokenDecimalAmount}`,
        methodName: 'getAmountsOut',
        methodParameters: [fixedFromTokenDecimalAmount, [fromToken.address, toToken.address]],
      };
    });

    return {
      context: {
        reference: callReference,
        contractAddress: cryptoComRouterContract.address,
        abi: cryptoComRouterContract.abi,
        calls,
      },
      resultsFormatter: (callResult) =>
        callResult.callsReturnContext
          // Filter out unsuccessful calls
          .filter((callReturnContext) => callReturnContext.success && callReturnContext.returnValues.length >= 2)
          .map((callReturnContext) => ({
            fromToken,
            fromTokenDecimalAmount: new BigNumber(callReturnContext.methodParameters[0]),
            toToken,
            toTokenDecimalAmount: new BigNumber(callReturnContext.returnValues[1].hex),
            estimatedGas: new BigNumber(115000),
          })),
    };
  };
}

export default CryptoCom;
