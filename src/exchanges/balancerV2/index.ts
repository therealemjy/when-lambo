import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import balancerV2ExchangeProxyContract from './contracts/balancerV2ExchangeProxy.json';

class BalancerV2 implements Exchange {
  name: ExchangeName;
  provider: ethers.providers.Web3Provider;
  exchangeProxy: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = ExchangeName.BalancerV2;

    this.exchangeProxy = new ethers.Contract(
      balancerV2ExchangeProxyContract.address,
      balancerV2ExchangeProxyContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const [_swaps, totalAmounts] = await this.exchangeProxy.viewSplitExactIn(fromToken.address, toToken.address,  fromTokenDecimalAmount.toFixed(), 4);

    return {
      decimalAmountOut: new BigNumber(totalAmounts.toString()),
      usedExchangeNames: [ExchangeName.BalancerV2],
      estimatedGas: new BigNumber(166270)
    }
  }
}

export default BalancerV2;
