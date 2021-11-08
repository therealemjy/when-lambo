import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import exchangeProxyContract from './contracts/ExchangeProxy.json';

class Balancer implements Exchange {
  name: string;
  estimatedGasForSwap: BigNumber;

  provider: ethers.providers.Web3Provider;
  exchangeProxy: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = 'Balancer';
    this.estimatedGasForSwap = new BigNumber(166270);

    this.exchangeProxy = new ethers.Contract(
      exchangeProxyContract.address,
      exchangeProxyContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.exchangeProxy.viewSplitExactIn(fromToken.address, toToken.address,  fromTokenDecimalAmount.toFixed(), 4);

    console.log("Balancer res", res)
    return new BigNumber(1);
  }
}

export default Balancer;
