import { LedgerSigner } from '@ethersproject/hardware-wallets';
import { task, types } from 'hardhat/config';

import { LEDGER_OWNER_ACCOUNT_PATH } from '../constants';
import withdraw from './utils/withdraw';

task('withdrawETH', 'Withdraw ETH from Transactor contract to vault account')
  .addParam('eth', 'The amount of ethers to withdraw', undefined, types.int)
  .setAction(async ({ eth }, hre) => {
    // Connect to ledger to retrieve signer
    const signer = new LedgerSigner(hre.ethers.provider, 'hid', LEDGER_OWNER_ACCOUNT_PATH);
    const weiAmount = hre.ethers.utils.parseEther(eth.toString());

    return withdraw(
      {
        signer,
        tokenSymbol: 'ETH',
        amount: weiAmount,
      },
      hre
    );
  });

task('withdrawWETH', 'Withdraw WETH from Transactor contract to vault account')
  .addParam('weth', 'The amount of WETH to withdraw', undefined, types.int)
  .setAction(async ({ weth }, hre) => {
    // Connect to ledger to retrieve signer
    const signer = new LedgerSigner(hre.ethers.provider, 'hid', LEDGER_OWNER_ACCOUNT_PATH);
    const wethDecimalAmount = hre.ethers.utils.parseEther(weth.toString());

    return withdraw(
      {
        signer,
        tokenSymbol: 'WETH',
        amount: wethDecimalAmount,
      },
      hre
    );
  });
