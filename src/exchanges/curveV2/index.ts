import { ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName, ResultFormatter } from '@src/types';

import swapContract from './contracts/swapContract.json';

class CurveV2 implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.CurveV2;
  }

  // This allow us to get the right contract address
  // private async setUpSwapContract(provider: ethers.providers.Web3Provider){
    /*
      swapContract address and ABI can change if any error occurs, it might be
      due to a new contract ABI that needs to be updated

      ---

      You can get it by using the addressProviderContract (see
      contracts/addressProviderContract.json), this way:
      const swapContractAddress = await this.addressProvider.get_address(2, { gasLimit:100000 });
    */
  // }
  getDecimalAmountOutCallContext: Exchange['getDecimalAmountOutCallContext'] = ({ callReference, fromTokenDecimalAmounts, fromToken, toToken }) => {
    const calls = fromTokenDecimalAmounts.map(fromTokenDecimalAmount => {
      const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();

      return {
        reference: `get_best_rate(address,address,uint256)-${fixedFromTokenDecimalAmount}`,
        methodName: 'get_best_rate(address,address,uint256)',
        methodParameters: [fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed()],
      }
    });

    return {
      context: {
        reference: callReference,
        contractAddress: swapContract.address,
        abi: swapContract.abi,
        calls,
      },
      resultFormatter: this._formatDecimalAmountOutCallResults
    }
  }

  _formatDecimalAmountOutCallResults: ResultFormatter = (
    callResult: ContractCallReturnContext,
    { fromToken }
  ) => (
    callResult.callsReturnContext.map(callReturnContext => {
      // Price of 1 fromToken in toToken decimals
      const oneFromTokenSellRate = callReturnContext.returnValues[0].toString();

      // Price of 1 fromToken decimal in toToken decimals
      const oneFromTokenDecimalSellRate = new BigNumber(oneFromTokenSellRate).dividedBy(1 * 10 ** fromToken.decimals);

      // Total amount of toToken decimals we get from selling all the fromToken
      // decimals provided
      const fromTokenDecimalAmount = callReturnContext.returnValues[2];
      const decimalAmountOut = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);

      return {
        decimalAmountOut,
        estimatedGas: new BigNumber(115000)
      }
    })
  )
}

export default CurveV2;
