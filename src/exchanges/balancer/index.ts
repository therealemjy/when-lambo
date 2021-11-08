import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import exchangeProxyContract from './contracts/exchangeProxy.json';

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
    const [_swaps, totalAmounts] = await this.exchangeProxy.viewSplitExactIn(fromToken.address, toToken.address,  fromTokenDecimalAmount.toFixed(), 4);

    return new BigNumber(totalAmounts.toString())
  }
}

export default Balancer;
