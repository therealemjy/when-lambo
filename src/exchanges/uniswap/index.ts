import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import uniswapRouterContract from './contracts/uniswapRouter.json';

class Uniswap implements Exchange {
  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.routerContract = new ethers.Contract(
      uniswapRouterContract.address,
      uniswapRouterContract.abi,
      provider
    );
  }

  getDecimalsOut: Exchange['getDecimalsOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toString(), [fromToken.address, toToken.address]);
    return new BigNumber(res[1].toString());
  }
}

export default Uniswap;
