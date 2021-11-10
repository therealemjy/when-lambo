import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import sushiswapRouterContract from './contracts/sushiswapRouter.json';

class Sushiswap implements Exchange {
  name: ExchangeName;

  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = ExchangeName.Sushiswap;

    this.routerContract = new ethers.Contract(
      sushiswapRouterContract.address,
      sushiswapRouterContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toFixed(), [fromToken.address, toToken.address]);

    return {
      decimalAmountOut: new BigNumber(res[1].toString()),
      usedExchangeNames: [ExchangeName.Sushiswap],
      estimatedGas: new BigNumber(115000)
    }
  }
}

export default Sushiswap;
