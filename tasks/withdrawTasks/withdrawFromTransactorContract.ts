import { BigNumber, ContractTransaction, Signer } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { address as WETH_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/weth.json';
import { abi as wethAbi } from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import formatNestedBN from '@chainHandler/utils/formatNestedBN';

import delay from './delay';

const TRANSFER_ERC20_GAS_LIMIT = 69000; // Average gas used: 52831
const TRANSFER_ETH_GAS_LIMIT = 45000; // Average gas used: 33584

const withdrawFromTransactorContract = async (
  {
    tokenSymbol,
    amount,
    countdownSeconds,
    gasPrice,
  }: {
    tokenSymbol: 'ETH' | 'WETH';
    amount: BigNumber;
    countdownSeconds: number;
    gasPrice: BigNumber;
  },
  { ethers, getNamedAccounts }: HardhatRuntimeEnvironment
) => {
  // Get Transactor contract, signed with owner account
  const { ownerAddress, vaultAddress } = await getNamedAccounts();
  const ownerSigner = await ethers.getSigner(ownerAddress);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor', ownerSigner);

  // Display transaction information
  console.log('Review and confirm the next transaction. Press ctrl + c to cancel.\n');
  console.log(`Amount: ${ethers.utils.formatEther(amount)} ${tokenSymbol}`);
  console.log(`From: Transactor contract (${TransactorContract.address})`);
  console.log(`To: vault account (${vaultAddress})\n`);

  for (let t = 0; t < countdownSeconds; t++) {
    if (t > 0) {
      process.stdout.clearLine(-1);
      process.stdout.cursorTo(0);
    }
    process.stdout.write(`Seconds before execution: ${countdownSeconds - t}`);

    await delay(1000);
  }

  // Check we have enough funds on the contract
  let contractBalance: BigNumber;

  if (tokenSymbol === 'ETH') {
    contractBalance = await ethers.provider.getBalance(TransactorContract.address);
  } else {
    const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, TransactorContract.signer);
    contractBalance = await wethContract.balanceOf(TransactorContract.address);
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
    receipt = await TransactorContract.transferETH(amount, vaultAddress, {
      gasPrice,
      gasLimit: TRANSFER_ETH_GAS_LIMIT,
    });
  } else {
    receipt = await TransactorContract.transferERC20(WETH_MAINNET_ADDRESS, amount, vaultAddress, {
      gasPrice,
      gasLimit: TRANSFER_ERC20_GAS_LIMIT,
    });
  }

  console.log('Transaction successfully executed! Human-readable receipt:');
  console.log(formatNestedBN(receipt));

  console.log('\nStringified receipt:');
  console.log(JSON.stringify(receipt));
};

export default withdrawFromTransactorContract;
