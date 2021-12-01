import { task, types } from 'hardhat/config';
import delay from './utils/delay';

// TODO: import mainnet info once contract has been deployed on it
import transactorContractInfo from './deployments/localhost/Transactor.json';
import { Transactor as ITransactorContract } from './typechain';

const COUNTDOWN_SECONDS = 60;

task('transferETH', 'Prints balances of the owner and vault accounts')
  .addParam('eth', 'The amount of ethers to transfer', 0, types.int)
  .setAction(async ({ eth }, { ethers, getNamedAccounts }) => {
    // Get owner signer
    // TODO: use ledger
    const { ownerAddress, vaultAddress } = await getNamedAccounts();
    const owner = await ethers.getSigner(ownerAddress);

    const TransactorContract = new ethers.Contract(
      transactorContractInfo.address,
      transactorContractInfo.abi,
      owner
    ) as ITransactorContract;

    // DEV ONLY: remove once this task is connected to the contract on the mainnet
    // Transfer funds to contract (in tests its funds will always be 0 since it just got deployed)
    await owner.sendTransaction({ to: TransactorContract.address, value: ethers.utils.parseEther(eth.toString()) });
    // END DEV ONLY

    // Check we have enough funds on the contract
    const contractEthBalance = await ethers.provider.getBalance(transactorContractInfo.address);
    const weiAmountToTransfer = ethers.utils.parseEther(eth.toString());

    if (contractEthBalance.lt(weiAmountToTransfer)) {
      throw new Error(
        `Insufficient funds on contract. Current balance: ${ethers.utils.parseEther(contractEthBalance.toString())} ETH`
      );
    }

    // Display transaction information and add a countdown
    console.log('Review and confirm the next transaction. Press on ctrl + c to cancel.\n');
    console.log(`Amount: ${eth} ethers`);
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
    const receipt = await TransactorContract.connect(owner).transferETH(weiAmountToTransfer, vaultAddress);
    console.log('Transaction successfully executed! Receipt:');
    console.log(JSON.stringify(receipt));
  });
