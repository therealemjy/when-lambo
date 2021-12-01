import { task, types } from 'hardhat/config';
import delay from './utils/delay';

// TODO: import from mainnet once contract has been deployed
import { address as transactorContractAddress } from './deployments/localhost/Transactor.json';

task('transferETH', 'Prints balances of the owner and vault accounts')
  .addParam('eth', 'The amount of ethers to transfer', 0, types.int)
  .setAction(async ({ eth }, { ethers, getNamedAccounts }) => {
    // Check we have enough funds on the contract
    const contractEthBalance = await ethers.provider.getBalance(transactorContractAddress);

    console.log(contractEthBalance);

    if (contractEthBalance.lt(ethers.utils.parseEther(eth.toString()))) {
      throw new Error(
        `Insufficient funds on contract. Current balance: ${ethers.utils.parseEther(contractEthBalance.toString())} ETH`
      );
    }

    // Get owner signer
    // TODO: get using ledger
    const { ownerAddress, vaultAddress } = await getNamedAccounts();
    const owner = ethers.getSigner(ownerAddress);

    // 20 seconds countdown to make sure we validate the action
    console.log(
      `About to transfer ${eth} ethers from Transactor contract to vault account (${vaultAddress}). Press on ctrl + c to cancel.`
    );

    const countdownSeconds = 30;
    for (let t = 0; t < countdownSeconds; t++) {
      console.log(countdownSeconds - t);
      await delay(1000);
    }
  });
