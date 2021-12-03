import BigNumber from 'bignumber.js';
import ethers from 'ethers';

import uniswapV2RouterContract from '@resources/thirdPartyContracts/mainnet/uniswapV2Router.json';
import wethContract from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Exchange, ExchangeName } from '@src/types';

class UniswapV2 implements Exchange {
  name: ExchangeName;

  constructor() {
    this.name = ExchangeName.UniswapV2;
  }

  initialize: Exchange['initialize'] = async ({ estimateTransactions, signer }) => {
    // Get router contract
    const routerContract = new ethers.Contract(uniswapV2RouterContract.address, uniswapV2RouterContract.abi, signer);

    // Since we're only interested in the gas estimate of the transaction, we
    // put the smallest amount possible as amountOutMin to make sure the
    // transaction succeeds
    const amountOutMin = 1;
    const signerAddress = await signer.getAddress();
    const deadline = new Date(new Date().getTime() + 1200000).getTime(); // 2 minutes from now

    const promises = estimateTransactions.map(async ({ wethDecimalAmount, toToken }) => {
      console.log(wethDecimalAmount.toFixed());

      const estimate = await routerContract.estimateGas.swapExactTokensForTokens(
        ethers.BigNumber.from(wethDecimalAmount.toFixed()),
        amountOutMin,
        [wethContract.address, toToken.address],
        signerAddress,
        deadline,
        // Since this is an estimate only, we can set a gas price of 0 and it
        // will still succeed
        { gasPrice: '0', gasLimit: ethers.utils.hexlify(3000000) }
      );

      console.log('HERE?');

      return estimate;
    });

    const estimates = await Promise.all(promises);

    console.log('estimates', estimates);
  };

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
