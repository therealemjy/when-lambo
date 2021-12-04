import BigNumber from 'bignumber.js';

import { ExchangeIndex } from '@localTypes';

import uniswapV2RouterContract from '@resources/thirdPartyContracts/mainnet/uniswapV2Router.json';

import { Exchange } from '@bot/src/types';

class UniswapV2 implements Exchange {
  index: ExchangeIndex;
  name: string;

  constructor() {
    this.index = ExchangeIndex.UniswapV2;
    this.name = ExchangeIndex[ExchangeIndex.UniswapV2];
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
        contractAddress: uniswapV2RouterContract.address,
        abi: uniswapV2RouterContract.abi,
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

export default UniswapV2;
