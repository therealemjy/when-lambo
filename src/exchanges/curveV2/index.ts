import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { Exchange, ExchangeName } from '@src/types';

import addressProviderContract from './contracts/addressProviderContract.json';
import swapContract from './contracts/swapContract.json';

class CurveV2 implements Exchange {
  name: ExchangeName;

  provider: ethers.providers.Web3Provider;
  networkProxy: ethers.Contract;
  addressProvider: ethers.Contract;
  swap: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = ExchangeName.CurveV2;

    this.addressProvider = new ethers.Contract(
      addressProviderContract.address,
      JSON.stringify(addressProviderContract.abi),
      provider,
    );

    this.swap = new ethers.Contract(
      swapContract.address,
      JSON.stringify(swapContract.abi),
      provider,
    );
  }

  // This allow us to get the right contract address
  // private async setUpSwapContract(provider: ethers.providers.Web3Provider){
    /*
      swapContract address and ABI can change
      if any error occurs, it might be due to a new contract ABI that needs to be updated

      ---

      You can get it this way:
      const swapContractAddress = await this.addressProvider.get_address(2, { gasLimit:100000 });
    */
  // }

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {
    const res = await this.swap['get_best_rate(address,address,uint256)'](fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed());

    // // Price of 1 fromToken in toToken decimals
    const oneFromTokenSellRate = res[0].toString();

    // Price of 1 fromToken decimal in toToken decimals
    const oneFromTokenDecimalSellRate = new BigNumber(oneFromTokenSellRate).dividedBy(1 * 10 ** fromToken.decimals);

    // Total amount of toToken decimals we get from selling all the fromToken
    // decimals provided
    const totalToTokenDecimals = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);

    return {
      decimalAmountOut:totalToTokenDecimals,
      usedExchangeNames: [ExchangeName.CurveV2],
      estimatedGas: new BigNumber(115000)
    }
  }
}

export default CurveV2;
