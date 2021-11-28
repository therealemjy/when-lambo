import { ethers } from 'hardhat';
import { Signer, BigNumber } from 'ethers';

import wethAbi from './wethAbi.json';
import { WETH_MAINNET_ADDRESS } from '../../../constants';

const exchangeEthForWeth = async (signer: Signer, ethAmount: BigNumber, toAddress: string) => {
  // Get contract
  const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, signer);

  // Wrap ETH and receive the WETH on the signer account
  const { value } = await wethContract.deposit({ value: ethAmount });

  // Send WETH from the signer account to provided address
  return wethContract.transfer(toAddress, value);
};

export default exchangeEthForWeth;
