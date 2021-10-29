import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import uniswapV2RouterContract from './contracts/uniswapV2Router.json';

class UniswapV2 implements Exchange {
  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.routerContract = new ethers.Contract(
      uniswapV2RouterContract.address,
      uniswapV2RouterContract.abi,
      provider
    );
  }

  getDecimalsOut: Exchange['getDecimalsOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toFixed(), [fromToken.address, toToken.address]);
    return new BigNumber(res[1].toString());
  }
}

export default UniswapV2;
