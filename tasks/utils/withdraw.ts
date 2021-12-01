import { BigNumber, ContractTransaction } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { LedgerSigner } from '@ethersproject/hardware-wallets';

// TODO: import mainnet info once contract has been deployed on it
import transactorContractInfo from '../../deployments/localhost/Transactor.json';
import delay from '../../utils/delay';
import { Transactor as ITransactorContract } from '../../typechain';
import { WETH_MAINNET_ADDRESS } from '../../constants';
import wethAbi from '../../utils/wethAbi.json';
import formatNestedBN from '../../utils/formatNestedBN';
// import swapEthForWeth from '../../utils/swapEthForWeth';

const COUNTDOWN_SECONDS = 60;

// TODO: add tests

const withdraw = async (
  { tokenSymbol, amount }: { tokenSymbol: 'ETH' | 'WETH'; amount: BigNumber },
  { ethers, getNamedAccounts }: HardhatRuntimeEnvironment
) => {
  // Connect to ledger to retrieve owner signer
  const owner = new LedgerSigner(ethers.provider, 'hid', process.env.LEDGER_PATH);
  const ownerAddressLedger = await owner.getAddress();
  const { ownerAddress, vaultAddress } = await getNamedAccounts();

  // Check ownerAddress corresponds to address of owner retrieved from ledger
  if (ownerAddressLedger !== ownerAddress) {
    throw new Error(
      `Wrong signer. The signer address needed is ${ownerAddress}, but the one detected was ${ownerAddressLedger}`
    );
  }

  const TransactorContract = new ethers.Contract(
    transactorContractInfo.address,
    transactorContractInfo.abi,
    owner
  ) as ITransactorContract;

  // DEV ONLY: remove once this task is connected to the contract on the mainnet
  // Transfer funds to contract (in tests its funds will always be 0 since it just got deployed)
  // if (tokenSymbol === 'ETH') {
  //   await owner.sendTransaction({ to: TransactorContract.address, value: amount });
  // } else {
  //   await swapEthForWeth(ethers, owner, amount, TransactorContract.address);
  // }
  // END DEV ONLY

  // Check we have enough funds on the contract
  let contractBalance: BigNumber;

  if (tokenSymbol === 'ETH') {
    contractBalance = await ethers.provider.getBalance(transactorContractInfo.address);
  } else {
    const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, owner);
    contractBalance = await wethContract.balanceOf(transactorContractInfo.address);
  }

  if (contractBalance.lt(amount)) {
    throw new Error(
      `Insufficient funds on contract. Current balance: ${ethers.utils.formatEther(
        contractBalance.toString()
      )} ${tokenSymbol}`
    );
  }

  // Display transaction information and add a countdown
  console.log('Review and confirm the next transaction. Press on ctrl + c to cancel.\n');
  console.log(`Amount: ${ethers.utils.formatEther(amount.toString())} ${tokenSymbol}`);
  console.log(`From: Transactor contract (${transactorContractInfo.address})`);
  console.log(`To: vault account (${vaultAddress})\n`);

  for (let t = 0; t < COUNTDOWN_SECONDS; t++) {
    if (t > 0) {
      process.stdout.clearLine(-1);
      process.stdout.cursorTo(0);
    }
    process.stdout.write(`Seconds before execution: ${COUNTDOWN_SECONDS - t}`);

    await delay(1000);
  }

  // Remove timer line
  process.stdout.clearLine(-1);
  process.stdout.cursorTo(0);

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

export default withdraw;
