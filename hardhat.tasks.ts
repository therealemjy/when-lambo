import { task, types } from 'hardhat/config';

task('transferETH', 'Prints balances of the owner and bank accounts')
  .addParam('eth', 'The amount of ethers to transfer', 0, types.int)
  .setAction(async ({ eth }, hre) => {
    // Get owner signer
    // TODO: get using ledger
    const { ownerAddress } = await hre.getNamedAccounts();
    const owner = hre.ethers.getSigner(ownerAddress);
  });
