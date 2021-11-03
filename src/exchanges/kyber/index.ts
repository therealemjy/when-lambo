import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import kyberNetworkProxy from './contracts/kyberNetworkProxy.json';

class Kyber implements Exchange {
  name: string;
  estimatedGasForSwap: BigNumber;

  provider: ethers.providers.Web3Provider;
  networkProxy: ethers.Contract

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = 'Kyber';
    this.estimatedGasForSwap = new BigNumber(400000);

    this.networkProxy = new ethers.Contract(
      kyberNetworkProxy.address,
      kyberNetworkProxy.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.networkProxy
      .getExpectedRate(
        fromToken.address,
        toToken.address,
        fromTokenDecimalAmount.toFixed()
      );

    // Price of 1 fromToken in toToken decimals
    const oneFromTokenSellRate = res[0].toString();

    // Price of 1 fromToken decimal in toToken decimals
    const oneFromTokenDecimalSellRate = new BigNumber(oneFromTokenSellRate).dividedBy(1 * 10 ** fromToken.decimals);

    // Total amount of toToken decimals we get from selling all the fromToken
    // decimals provided
    const totalToTokenDecimals = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);

    return totalToTokenDecimals;
  }
}

export default Kyber;
