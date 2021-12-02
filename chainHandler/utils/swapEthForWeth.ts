import { ethers, Signer, BigNumber } from 'ethers';

import { WETH_MAINNET_ADDRESS } from '../../constants';
import wethAbi from './wethAbi.json';

const swapEthForWeth = async (
  ethersInstance: typeof ethers,
  signer: Signer,
  ethAmount: BigNumber,
  toAddress: string
) => {
  // Get contract
  const wethContract = new ethersInstance.Contract(WETH_MAINNET_ADDRESS, wethAbi, signer);

  // Wrap ETH and receive the WETH on the signer account
  const { value } = await wethContract.deposit({ value: ethAmount });

  // Send WETH from the signer account to provided address
  return wethContract.transfer(toAddress, value);
};

export default swapEthForWeth;
