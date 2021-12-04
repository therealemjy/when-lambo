import { BigNumber, ContractTransaction, Signer } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

// TODO: import mainnet info once contract has been deployed on it
import { abi as transactorContractAbi } from '@deployments/localhost/Transactor.json';
import { address as WETH_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/weth.json';
import { abi as wethAbi } from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import formatNestedBN from '@chainHandler/utils/formatNestedBN';

const withdrawFromTransactorContract = async (
  {
    signer,
    tokenSymbol,
    amount,
    transactorContractAddress,
  }: {
    signer: Signer;
    tokenSymbol: 'ETH' | 'WETH';
    amount: BigNumber;
    transactorContractAddress: string;
  },
  { ethers, getNamedAccounts }: HardhatRuntimeEnvironment
) => {
  const signerAddress = await signer.getAddress();
  const { ownerAddress, vaultAddress } = await getNamedAccounts();

  // Check ownerAddress corresponds to address of owner retrieved from ledger
  if (signerAddress !== ownerAddress) {
    throw new Error(
      `Wrong signer. The signer address needed is ${ownerAddress}, but the one provided was ${signerAddress}`
    );
  }

  const TransactorContract = new ethers.Contract(
    transactorContractAddress,
    transactorContractAbi,
    signer
  ) as ITransactorContract;

  // Check we have enough funds on the contract
  let contractBalance: BigNumber;

  if (tokenSymbol === 'ETH') {
    contractBalance = await ethers.provider.getBalance(transactorContractAddress);
  } else {
    const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, signer);
    contractBalance = await wethContract.balanceOf(transactorContractAddress);
  }

  if (contractBalance.lt(amount)) {
    throw new Error(
      `Insufficient funds on contract. Current balance: ${ethers.utils.formatEther(
        contractBalance.toString()
      )} ${tokenSymbol}`
    );
  }

  // Execute trade
  console.log('Executing transaction...');
  let receipt: ContractTransaction;

  if (tokenSymbol === 'ETH') {
    // TODO: define gas price and gas limit
    receipt = await TransactorContract.transferETH(amount, vaultAddress);
  } else {
    // TODO: define gas price and gas limit
    receipt = await TransactorContract.transferERC20(WETH_MAINNET_ADDRESS, amount, vaultAddress);
  }

  console.log('Transaction successfully executed! Human-readable receipt:');
  console.log(formatNestedBN(receipt));

  console.log('\nStringified receipt:');
  console.log(JSON.stringify(receipt));
};

export default withdrawFromTransactorContract;
