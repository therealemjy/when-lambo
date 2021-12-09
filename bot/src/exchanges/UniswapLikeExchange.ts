import { BigNumber, ethers } from 'ethers';

import { ExchangeIndex } from '@localTypes';
import wethInfo from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Exchange } from './types';

export interface ContractInfo {
  address: string;
  abi: any[];
}

class UniswapLikeExchange implements Exchange {
  index: ExchangeIndex;
  name: string;
  routerContractInfo: ContractInfo;

  constructor({ index, routerContractInfo }: { index: ExchangeIndex; routerContractInfo: ContractInfo }) {
    this.index = index;
    this.name = ExchangeIndex[index];
    this.routerContractInfo = routerContractInfo;
  }

  estimateGetDecimalAmountOut: Exchange['estimateGetDecimalAmountOut'] = async ({
    signer,
    amountIn,
    toTokenAddress,
    isProd,
  }) => {
    if (isProd) {
      throw new Error(
        'estimateGetDecimalAmountOut can only be run in non-production environments, as it sends real transactions to the node! Make sure to only run this method on a test/forked network only using fake ETH.'
      );
    }

    const deadline = new Date(new Date().getTime() + 120000).getTime();
    const signerAddress = await signer.getAddress();
    const wethContract = new ethers.Contract(wethInfo.address, wethInfo.abi, signer);
    const routerContract = new ethers.Contract(this.routerContractInfo.address, this.routerContractInfo.abi, signer);

    let gasUsed: BigNumber;

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
    const calls = fromTokenDecimalAmounts.map((fromTokenDecimalAmount) => ({
      reference: `getAmountsOut-${fromTokenDecimalAmount.toString()}`,
      methodName: 'getAmountsOut',
      methodParameters: [fromTokenDecimalAmount, [fromToken.address, toToken.address]],
    }));

    return {
      context: {
        reference: callReference,
        contractAddress: this.routerContractInfo.address,
        abi: this.routerContractInfo.abi,
        calls,
      },
      resultsFormatter: (callResult) =>
        callResult.callsReturnContext
          // Filter out unsuccessful calls
          .filter((callReturnContext) => callReturnContext.success && callReturnContext.returnValues.length >= 2)
          .map((callReturnContext) => ({
            fromToken,
            fromTokenDecimalAmount: BigNumber.from(callReturnContext.methodParameters[0]),
            toToken,
            toTokenDecimalAmount: BigNumber.from(callReturnContext.returnValues[1].hex),
          })),
    };
  };
}

export default UniswapLikeExchange;
