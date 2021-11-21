import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { Exchange, ExchangeName } from '@src/types';

import contractAddresses from '@constants/contractAddresses';

import uniswapV2RouterAbi from './abis/uniswapV2Router.json';

class UniswapV2 implements Exchange {
  name: ExchangeName;

  routerContract: ethers.Contract;

  constructor() {
    this.name = ExchangeName.UniswapV2;
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
        contractAddress: contractAddresses.mainnet.uniswapV2Router,
        abi: uniswapV2RouterAbi,
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
