import { task, types } from 'hardhat/config';

import withdrawFromTransactorContract from './withdrawFromTransactorContract';

task('withdrawETH', 'Withdraw ETH from Transactor contract to vault account')
  .addParam('wei', 'The amount of wei (ETH) to withdraw', undefined, types.int)
  .setAction(async ({ wei }, hre) =>
    withdrawFromTransactorContract(
      {
        tokenSymbol: 'ETH',
        amount: hre.ethers.BigNumber.from(wei),
        countdownSeconds: 60,
      },
      hre
    )
  );

task('withdrawWETH', 'Withdraw WETH from Transactor contract to vault account')
  .addParam('wei', 'The amount of wei (WETH) to withdraw', undefined, types.int)
  .setAction(async ({ wei }, hre) =>
    withdrawFromTransactorContract(
      {
        tokenSymbol: 'WETH',
        amount: hre.ethers.BigNumber.from(wei),
        countdownSeconds: 60,
      },
      hre
    )
  );
