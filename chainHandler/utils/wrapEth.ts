import { ethers, Signer, BigNumber } from 'ethers';

import wethMainnetContractInfo from '@resources/thirdPartyContracts/mainnet/weth.json';

const wrapEth = async (ethersInstance: typeof ethers, signer: Signer, ethAmount: BigNumber, toAddress: string) => {
  // Get contract
  const wethContract = new ethersInstance.Contract(
    wethMainnetContractInfo.address,
    wethMainnetContractInfo.abi,
    signer
  );

  // Wrap ETH and receive the WETH on the signer account
  const { value } = await wethContract.deposit({ value: ethAmount });

  // Send WETH from the signer account to provided address
  return wethContract.transfer(toAddress, value);
};

export default wrapEth;
