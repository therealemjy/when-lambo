import { Signer, BigNumber } from 'ethers';

import getWethContract from './getWethContract';

const exchangeEthForWeth = async (signer: Signer, ethAmount: BigNumber, toAddress: string) => {
  // Get contract
  const wethContract = getWethContract(signer);

  // Wrap ETH and receive the WETH on the signer account
  const { value } = await wethContract.deposit({ value: ethAmount });

  // Send WETH from the signer account to provided address
  return wethContract.transfer(toAddress, value);
};

export default exchangeEthForWeth;
