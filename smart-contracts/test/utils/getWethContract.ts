import { ethers } from 'hardhat';
import { Signer } from 'ethers';

import wethAbi from '../abis/weth.json';
import { WETH_MAINNET_ADDRESS } from '../../constants';

const getWethContract = (signer: Signer, address: string = WETH_MAINNET_ADDRESS) =>
  new ethers.Contract(address, wethAbi, signer);

export default getWethContract;
