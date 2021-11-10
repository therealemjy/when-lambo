import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import cryptoComRouterContract from './contracts/cryptoComRouter.json';

class CryptoCom implements Exchange {
  name: ExchangeName;

  provider: ethers.providers.Web3Provider;
  routerContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = ExchangeName.CryptoCom;

    this.routerContract = new ethers.Contract(
      cryptoComRouterContract.address,
      cryptoComRouterContract.abi,
      provider
    );
  }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.routerContract.getAmountsOut(fromTokenDecimalAmount.toFixed(), [fromToken.address, toToken.address]);

    return {
      decimalAmountOut: new BigNumber(res[1].toString()),
      usedExchangeNames: [ExchangeName.CryptoCom],
      estimatedGas: new BigNumber(165000)
    }
  }
}

export default CryptoCom;
