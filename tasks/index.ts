import { task, types } from 'hardhat/config';

import withdraw from './utils/withdraw';

task('withdrawETH', 'Withdraw ETH from Transactor contract to vault account')
  .addParam('eth', 'The amount of ethers to withdraw', undefined, types.int)
  .setAction(async ({ eth }, hre) => {
    const weiAmount = hre.ethers.utils.parseEther(eth.toString());

    return withdraw(
      {
        tokenSymbol: 'ETH',
        amount: weiAmount,
      },
      hre
    );
  });

task('withdrawWETH', 'Withdraw WETH from Transactor contract to vault account')
  .addParam('weth', 'The amount of WETH to withdraw', undefined, types.int)
  .setAction(async ({ weth }, hre) => {
    const wethDecimalAmount = hre.ethers.utils.parseEther(weth.toString());

    return withdraw(
      {
        tokenSymbol: 'WETH',
        amount: wethDecimalAmount,
      },
      hre
    );
  });
