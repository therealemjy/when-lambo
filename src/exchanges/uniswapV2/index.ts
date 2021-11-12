import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import uniswapV2RouterContract from './contracts/uniswapV2Router.json';

class UniswapV2 implements Exchange {
  name: ExchangeName;

  routerContract: ethers.Contract;

  constructor() {
    this.name = ExchangeName.UniswapV2;
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
        contractAddress: uniswapV2RouterContract.address,
        abi: uniswapV2RouterContract.abi,
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

export default UniswapV2;
