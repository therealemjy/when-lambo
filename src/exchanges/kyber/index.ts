import BigNumber from 'bignumber.js';
import { ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';

import { Exchange, ExchangeName, ResultFormatter } from '@src/types';

import kyberNetworkProxy from './contracts/kyberNetworkProxy.json';

class Kyber implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.Kyber;
  }

  getDecimalAmountOutCallContext: Exchange['getDecimalAmountOutCallContext'] = ({ callReference, fromTokenDecimalAmounts, fromToken, toToken }) => {
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
      resultFormatter: this._formatDecimalAmountOutCallResults
    }
  };

  _formatDecimalAmountOutCallResults: ResultFormatter = (
    callResult: ContractCallReturnContext,
    { fromToken }
  ) => (
    callResult.callsReturnContext.map(callReturnContext => {
        // Price of 1 fromToken in toToken decimals
      const oneFromTokenSellRate = callReturnContext.returnValues[0].toString();

      if (parseInt(oneFromTokenSellRate) === 0) {
        throw new Error('Token not found on Kyber exchange');
      }

      // Price of 1 fromToken decimal in toToken decimals
      const oneFromTokenDecimalSellRate = new BigNumber(oneFromTokenSellRate).dividedBy(1 * 10 ** fromToken.decimals);

      // Total amount of toToken decimals we get from selling all the fromToken
      // decimals provided
      const fromTokenDecimalAmount = callReturnContext.returnValues[2];
      const decimalAmountOut = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);

      return {
        decimalAmountOut,
        estimatedGas: new BigNumber(400000)
      }
    })
  );
}

export default Kyber;
