import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import cryptoComRouterContract from './contracts/cryptoComRouter.json';

class CryptoCom implements Exchange {
  name: string;
  estimatedGasForSwap: BigNumber;

  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = 'Crypto.com';
    this.estimatedGasForSwap = new BigNumber(105657);

    this.routerContract = new ethers.Contract(
      cryptoComRouterContract.address,
      cryptoComRouterContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toFixed(), [fromToken.address, toToken.address]);
    return new BigNumber(res[1].toString());
  }
}

export default CryptoCom;
