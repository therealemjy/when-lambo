import { BigNumber } from 'ethers';
import { task, types } from 'hardhat/config';

import withdrawFromTransactorContract from './withdrawFromTransactorContract';

const COUNTDOWN_SECONDS = 60;

task('withdrawETH', 'Withdraw ETH from Transactor contract to vault account')
  .addParam('wei', 'The amount of wei (ETH) to withdraw', undefined, types.string)
  .addParam('gasprice', 'Gas price (in wei) for the transaction', undefined, types.string)
  .setAction(async ({ wei, gasprice }, hre) =>
    withdrawFromTransactorContract(
      {
        tokenSymbol: 'ETH',
        amount: BigNumber.from(wei),
        countdownSeconds: COUNTDOWN_SECONDS,
        gasPrice: BigNumber.from(gasprice),
      },
      hre
    )
  );

task('withdrawWETH', 'Withdraw WETH from Transactor contract to vault account')
  .addParam('wei', 'The amount of wei (WETH) to withdraw', undefined, types.string)
  .addParam('gasprice', 'Gas price (in wei) for the transaction', undefined, types.string)
  .setAction(async ({ wei, gasprice }, hre) =>
    withdrawFromTransactorContract(
      {
        tokenSymbol: 'WETH',
        amount: BigNumber.from(wei),
        countdownSeconds: COUNTDOWN_SECONDS,
        gasPrice: BigNumber.from(gasprice),
      },
      hre
    )
  );
