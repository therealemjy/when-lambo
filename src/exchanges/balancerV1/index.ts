import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import balancerV1ExchangeProxyContract from './contracts/balancerV1ExchangeProxy.json';

// Number of pools we allow Balancer to take the funds from. Note: we're
// currently setting it to 1 as we're not sure if taking funds from multiple
// pools increases the gas cost or not.
// TODO: check if that's true or if we can increase the number of pools
const N_POOLS = 1;

class BalancerV1 implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.BalancerV1;
  }

  getDecimalAmountOutCallContext: Exchange['getDecimalAmountOutCallContext'] = ({ callReference, fromTokenDecimalAmounts, fromToken, toToken }) => {
    const calls = fromTokenDecimalAmounts.map(fromTokenDecimalAmount => {
      const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();

      return {
        reference: `viewSplitExactIn-${fixedFromTokenDecimalAmount}`,
        methodName: 'viewSplitExactIn',
        methodParameters: [fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed(), N_POOLS],
      }
    });

    return {
      context: {
        reference: callReference,
        contractAddress: balancerV1ExchangeProxyContract.address,
        abi: balancerV1ExchangeProxyContract.abi,
        calls,
      },
      resultFormatter: (callResult) => (
        callResult.callsReturnContext
          // Filter out unsuccessful calls
          .filter(callReturnContext => callReturnContext.success)
          .map(callReturnContext => ({
              decimalAmountOut: new BigNumber(callReturnContext.returnValues[1].toString()),
              estimatedGas: new BigNumber(165000)
            }))
      )
    }
  }
}

export default BalancerV1;
