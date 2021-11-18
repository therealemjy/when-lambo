import { ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName, Token } from '@src/types';

import kyberNetworkProxy from './contracts/kyberNetworkProxy.json';

class Kyber implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.Kyber;
  }

  getDecimalAmountOutCallContext: Exchange['getDecimalAmountOutCallContext'] = (args) => {
    const { callReference, fromTokenDecimalAmounts, fromToken, toToken } = args;

    const calls = fromTokenDecimalAmounts.map((fromTokenDecimalAmount) => {
      const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();

      return {
        reference: `getExpectedRate-${fixedFromTokenDecimalAmount}`,
        methodName: 'getExpectedRate',
        methodParameters: [fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed()],
      };
    });

    return {
      context: {
        reference: callReference,
        contractAddress: kyberNetworkProxy.address,
        abi: kyberNetworkProxy.abi,
        calls,
      },
      resultsFormatter: this._formatDecimalAmountOutCallResults,
    };
  };

  _formatDecimalAmountOutCallResults = (
    callResult: ContractCallReturnContext,
    { fromToken, toToken }: { fromToken: Token; toToken: Token }
  ) =>
    callResult.callsReturnContext
      // Filter out unsuccessful calls
      .filter((callReturnContext) => {
        const oneFromTokenSellRate = new BigNumber(callReturnContext.returnValues[0].hex);
        return callReturnContext.success && oneFromTokenSellRate.isGreaterThan(0);
      })
      .map((callReturnContext) => {
        // Price of 1 fromToken in toToken decimals. Note that the price given
        // by Kyber is expressed using the same decimal places as fromToken, so
        // we first need to convert it to get the price of 1 fromToken in
        // toToken by dividing the price by the decimals places of fromToken. We
        // then convert the value obtained by the decimal places of toToken to
        // obtain the price of 1 fromToken in toToken decimals.
        const oneFromTokenSellRate = new BigNumber(callReturnContext.returnValues[0].hex)
          .dividedBy(1 * 10 ** fromToken.decimals)
          .multipliedBy(1 * 10 ** toToken.decimals);

        // Price of 1 fromToken decimal in toToken decimals
        const oneFromTokenDecimalSellRate = oneFromTokenSellRate.dividedBy(1 * 10 ** fromToken.decimals);

        const fromTokenDecimalAmount = new BigNumber(callReturnContext.methodParameters[2]);
        // Total amount of toToken decimals we get from selling all the
        // fromToken decimals provided
        const toTokenDecimalAmount = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);

        return {
          fromToken,
          fromTokenDecimalAmount,
          toToken,
          toTokenDecimalAmount,
          estimatedGas: new BigNumber(400000),
        };
      });
}

export default Kyber;
