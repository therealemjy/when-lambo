import { task, types } from 'hardhat/config';

import transfer from './transfer';

task('transferETH', 'Transfers ETH from Transactor contract to vault account')
  .addParam('eth', 'The amount of ethers to transfer', undefined, types.int)
  .setAction(async ({ eth }, hre) => {
    const weiAmount = hre.ethers.utils.parseEther(eth.toString());

    return transfer(
      {
        tokenSymbol: 'ETH',
        amount: weiAmount,
      },
      hre
    );
  });

task('transferWETH', 'Transfers WETH from Transactor contract to vault account')
  .addParam('weth', 'The amount of WETH to transfer', undefined, types.int)
  .setAction(async ({ weth }, hre) => {
    const wethDecimalAmount = hre.ethers.utils.parseEther(weth.toString());

    return transfer(
      {
        tokenSymbol: 'WETH',
        amount: wethDecimalAmount,
      },
      hre
    );
  });
