import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import exchangeProxyContract from './contracts/exchangeProxy.json';

class Balancer implements Exchange {
  name: ExchangeName;
  estimatedGasForSwap: BigNumber;
  provider: ethers.providers.Web3Provider;
  exchangeProxy: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = ExchangeName.Balancer;
    this.estimatedGasForSwap = new BigNumber(166270);

    this.exchangeProxy = new ethers.Contract(
      exchangeProxyContract.address,
      exchangeProxyContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const [_swaps, totalAmounts] = await this.exchangeProxy.viewSplitExactIn(fromToken.address, toToken.address,  fromTokenDecimalAmount.toFixed(), 4);

    return {
      decimalAmountOut: new BigNumber(totalAmounts.toString()),
      usedExchangeNames: [ExchangeName.Balancer],
    }
  }
}

export default Balancer;
