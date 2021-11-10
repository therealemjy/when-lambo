import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import uniswapV2RouterContract from './contracts/uniswapV2Router.json';

class UniswapV2 implements Exchange {
  name: ExchangeName;

  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = ExchangeName.UniswapV2;

    this.routerContract = new ethers.Contract(
      uniswapV2RouterContract.address,
      uniswapV2RouterContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toFixed(), [fromToken.address, toToken.address]);

    return {
      decimalAmountOut: new BigNumber(res[1].toString()),
      usedExchangeNames: [ExchangeName.UniswapV2],
      estimatedGas: new BigNumber(115000)
    }
  }
}

export default UniswapV2;
