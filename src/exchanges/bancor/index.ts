import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { Exchange } from '@src/exchanges/types';

import bancorContractRegistryContract from './contracts/bancorContractRegistry.json';

class Bancor implements Exchange {
  name: string;
  estimatedGasForSwap: BigNumber;

  provider: ethers.providers.Web3Provider;
  contractRegistryContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;

    this.name = 'Bancor';
    this.estimatedGasForSwap = new BigNumber(0); // TODO: to define

    this.contractRegistryContract = new ethers.Contract(
      bancorContractRegistryContract.address,
      bancorContractRegistryContract.abi,
      provider
    );
  }

  init = async () => {
    // TODO: refactor to use our provider
    const web3 = new Web3();
    web3.setProvider('https://mainnet.infura.io/v3/1732759b69d54284a73caf0fe44ebb0f');
    // @ts-ignore
    const contractRegistry = new web3.eth.Contract(bancorContractRegistryContract.abi, '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4');
    const bancorNetworkAddress = await contractRegistry.methods.addressOf(Web3.utils.asciiToHex('BancorNetwork')).call();

    console.log(bancorNetworkAddress);

    // // Get address of the network contract
    // const networkContractAddress = await this.contractRegistryContract.addressOf('0x42616e636f724e6574776f726b');
    // console.log(networkContractAddress);
  };

  getDecimalAmountOut: Exchange['getDecimalAmountOut'] = async ({ fromTokenDecimalAmount, fromToken, toToken }) => {

    return new BigNumber(0);
  }
}

export default Bancor;
