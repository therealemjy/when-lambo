import BigNumber from 'bignumber.js';

import sushiswapRouterContract from '@resources/thirdPartyContracts/mainnet/sushiswapRouter.json';

import { Exchange, ExchangeName } from '@src/types';

class Sushiswap implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.Sushiswap;
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
        contractAddress: sushiswapRouterContract.address,
        abi: sushiswapRouterContract.abi,
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

export default Sushiswap;
