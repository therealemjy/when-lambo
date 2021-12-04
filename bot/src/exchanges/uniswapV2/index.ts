import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { ExchangeIndex } from '@localTypes';

import uniswapV2RouterInfo from '@resources/thirdPartyContracts/mainnet/uniswapV2Router.json';
import wethInfo from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Exchange } from '@bot/src/types';

class UniswapV2 implements Exchange {
  index: ExchangeIndex;
  name: string;

  constructor() {
    this.index = ExchangeIndex.UniswapV2;
    this.name = ExchangeIndex[ExchangeIndex.UniswapV2];
  }

  estimateGetDecimalAmountOut: Exchange['estimateGetDecimalAmountOut'] = async ({
    signer,
    amountIn,
    toTokenAddress,
  }) => {
    const deadline = new Date(new Date().getTime() + 120000).getTime();
    const signerAddress = await signer.getAddress();
    const wethContract = new ethers.Contract(wethInfo.address, wethInfo.abi, signer);
    const routerContract = new ethers.Contract(uniswapV2RouterInfo.address, uniswapV2RouterInfo.abi, signer);

    let gasUsed: number;

    try {
      // Give approval to router account to withdraw WETH from signer
      await wethContract.approve(routerContract.address, amountIn);

      const transaction = await routerContract.swapExactTokensForTokens(
        amountIn,
        1, // Min toToken amount out
        [wethInfo.address, toTokenAddress],
        signerAddress,
        deadline
      );

      // Wait for transaction to get mined (instantaneously in our case since we're running on
      // Hardhat's local network)
      const receipt = await transaction.wait();
      gasUsed = receipt.gasUsed;
    } catch (error: any) {
      if (error.message === 'Transaction reverted without a reason string') {
        // If we get this error message, then it means the exchange simply does not have
        // any pool containing WETH and the token we want to trade
        return undefined;
      }

      throw error;
    }

    return gasUsed;
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
        contractAddress: uniswapV2RouterInfo.address,
        abi: uniswapV2RouterInfo.abi,
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
