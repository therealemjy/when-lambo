import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import kyberNetworkProxy from './contracts/kyberNetworkProxy.json';

class Kyber implements Exchange {
  provider: ethers.providers.Web3Provider;
  networkProxy: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.networkProxy = new ethers.Contract(
      kyberNetworkProxy.address,
      kyberNetworkProxy.abi,
      provider
    );
  }

  getDecimalsOut: Exchange['getDecimalsOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.networkProxy
      .getExpectedRate(
        fromToken.address,
        toToken.address,
        fromTokenDecimalAmount.toString()
      );


    // Price of 1 fromToken in toToken decimals
    const oneFromTokenSellRate =res[0].toString();

    // Price of 1 fromToken decimal in toToken decimals
    const oneFromTokenDecimalSellRate = new BigNumber(oneFromTokenSellRate).dividedBy(fromToken.decimals);

    // Total amount of toToken decimals we get from selling all the fromToken
    // decimals provided
    const totalToTokenDecimals = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);

    return totalToTokenDecimals;
  }
}

export default Kyber;
