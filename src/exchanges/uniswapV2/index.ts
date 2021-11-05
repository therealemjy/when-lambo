import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import uniswapV2RouterContract from './contracts/uniswapV2Router.json';

class UniswapV2 implements Exchange {
  name: string;
  estimatedGasForSwap: BigNumber;

  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = 'Uniswap V2';
    this.estimatedGasForSwap = new BigNumber(115000);

    this.routerContract = new ethers.Contract(
      uniswapV2RouterContract.address,
      uniswapV2RouterContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toFixed(), [fromToken.address, toToken.address]);
    return new BigNumber(res[1].toString());
  }
}

export default UniswapV2;
