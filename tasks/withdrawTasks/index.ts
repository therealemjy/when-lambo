import { LedgerSigner } from '@ethersproject/hardware-wallets';
import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { LEDGER_OWNER_ACCOUNT_PATH, VAULT_ACCOUNT_MAINNET_ADDRESS } from '@constants';
// TODO: import mainnet info once contract has been deployed on it
import { address as transactorContractAddress } from '@deployments/localhost/Transactor.json';

import withdrawFromTransactorContract from './withdrawFromTransactorContract';

const withdraw = async (
  {
    tokenSymbol,
    tokenAmount,
  }: {
    tokenSymbol: 'ETH' | 'WETH';
    tokenAmount: string;
  },
  hre: HardhatRuntimeEnvironment
) => {
  // Display transaction information
  console.log('Review and confirm the next transaction. Press ctrl + c to cancel.\n');
  console.log(`Amount: ${tokenAmount} ${tokenSymbol}`);
  console.log(`From: Transactor contract (${transactorContractAddress})`);
  console.log(`To: vault account (${VAULT_ACCOUNT_MAINNET_ADDRESS})\n`);

  // Connect to ledger to retrieve signer
  const signer = new LedgerSigner(hre.ethers.provider, 'hid', LEDGER_OWNER_ACCOUNT_PATH);

  // Convert amount to wei
  const weiAmount = hre.ethers.utils.parseEther(tokenAmount.toString());

  return withdrawFromTransactorContract(
    {
      signer,
      tokenSymbol,
      amount: weiAmount,
      transactorContractAddress,
    },
    hre
  );
};

task('withdrawETH', 'Withdraw ETH from Transactor contract to vault account')
  .addParam('eth', 'The amount of ethers to withdraw', undefined, types.int)
  .setAction(async ({ eth }, hre) =>
    withdraw(
      {
        tokenSymbol: 'ETH',
        tokenAmount: eth,
      },
      hre
    )
  );

task('withdrawWETH', 'Withdraw WETH from Transactor contract to vault account')
  .addParam('weth', 'The amount of WETH to withdraw', undefined, types.int)
  .setAction(async ({ weth }, hre) =>
    withdraw(
      {
        tokenSymbol: 'WETH',
        tokenAmount: weth,
      },
      hre
    )
  );
