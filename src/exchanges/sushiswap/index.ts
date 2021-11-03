import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import sushiswapRouterContract from './contracts/sushiswapRouter.json';

class Sushiswap implements Exchange {
  name: string;
  estimatedGasForSwap: number;

  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = 'Sushiswap';
    this.estimatedGasForSwap = 109253;

    this.routerContract = new ethers.Contract(
      sushiswapRouterContract.address,
      sushiswapRouterContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toFixed(), [fromToken.address, toToken.address]);
    return new BigNumber(res[1].toString());
  }
}

export default Sushiswap;
