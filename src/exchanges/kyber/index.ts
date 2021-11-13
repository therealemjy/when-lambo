import BigNumber from 'bignumber.js';
import { ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';

import { Exchange, ExchangeName, IGetDecimalAmountOutCallContextInput } from '@src/types';

import kyberNetworkProxy from './contracts/kyberNetworkProxy.json';

class Kyber implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.Kyber;
  }

  getDecimalAmountOutCallContext: Exchange['getDecimalAmountOutCallContext'] = (args) => {
    const { callReference, fromTokenDecimalAmounts, fromToken, toToken } = args;

    const calls = fromTokenDecimalAmounts.map(fromTokenDecimalAmount => {
      const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();

      return {
        reference: `getExpectedRate-${fixedFromTokenDecimalAmount}`,
        methodName: 'getExpectedRate',
        methodParameters: [fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed()],
      }
    });

    return {
      context: {
        reference: callReference,
        contractAddress: kyberNetworkProxy.address,
        abi: kyberNetworkProxy.abi,
        calls,
      },
      resultFormatter: (callResult: ContractCallReturnContext) => this._formatDecimalAmountOutCallResults(callResult, { callReference, fromTokenDecimalAmounts, fromToken, toToken })
    }
  };

  _formatDecimalAmountOutCallResults = (
    callResult: ContractCallReturnContext,
    { fromToken, toToken }: IGetDecimalAmountOutCallContextInput
  ) => (
    callResult.callsReturnContext
      // Filter out unsuccessful calls
      .filter(callReturnContext => {
        const oneFromTokenSellRate = new BigNumber(callReturnContext.returnValues[0].hex);
        return callReturnContext.success && oneFromTokenSellRate.isGreaterThan(0)
      })
      .map(callReturnContext => {
          // Price of 1 fromToken in toToken decimals
        const oneFromTokenSellRate = new BigNumber(callReturnContext.returnValues[0].hex);

        // Price of 1 fromToken decimal in toToken decimals
        const oneFromTokenDecimalSellRate = oneFromTokenSellRate.dividedBy(1 * 10 ** fromToken.decimals);

        // Total amount of toToken decimals we get from selling all the fromToken
        // decimals provided
        const fromTokenDecimalAmount = new BigNumber(callReturnContext.methodParameters[2]);
        const toTokenDecimalAmount = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);

        return {
          fromToken,
          fromTokenDecimalAmount,
          toToken,
          toTokenDecimalAmount,
          estimatedGas: new BigNumber(400000)
        }
      })
  );
}

export default Kyber;
