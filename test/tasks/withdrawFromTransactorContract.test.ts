import { expect } from 'chai';
import { Signer } from 'ethers';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { WETH_MAINNET_ADDRESS } from '@constants';

import withdraw from '@chainHandler/tasks/utils/withdrawFromTransactorContract';
import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import swapEthForWeth from '@chainHandler/utils/swapEthForWeth';
import wethAbi from '@chainHandler/utils/wethAbi.json';

const HRE = { ethers, getNamedAccounts } as HardhatRuntimeEnvironment;
const ONE_ETHER = ethers.utils.parseEther('1');

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { transactorContractAddress: TransactorContract.address };
});

const getAccountBalance = async (account: Signer, tokenSymbol: 'ETH' | 'WETH') => {
  if (tokenSymbol === 'ETH') {
    return account.getBalance();
  }

  const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, account);
  const accountAddress = await account.getAddress();
  return wethContract.balanceOf(accountAddress);
};

describe('tasks/withdrawFromTransactorContract', function () {
  it('throws an error when signing transaction with an account that is not the owner of Transactor contract', async function () {
    const { transactorContractAddress } = await setup();
    const { ownerAddress, externalUserAddress } = await getNamedAccounts();
    const externalUser = await ethers.getSigner(externalUserAddress);

    await expect(
      withdraw(
        {
          signer: externalUser,
          tokenSymbol: 'ETH',
          amount: ONE_ETHER,
          transactorContractAddress,
        },
        HRE
      )
    ).to.be.rejectedWith(
      `Wrong signer. The signer address needed is ${ownerAddress}, but the one provided was ${externalUserAddress}`
    );
  });

  const tokenSymbols: ['ETH', 'WETH'] = ['ETH', 'WETH'];

  for (let t = 0; t < tokenSymbols.length; t++) {
    const tokenSymbol = tokenSymbols[t];

    it(`throws an error when withdrawing ${tokenSymbol} and Transactor contract does not have sufficient funds`, async () => {
      const { transactorContractAddress } = await setup();
      const { ownerAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);

      await expect(
        withdraw(
          {
            signer: owner,
            tokenSymbol,
            amount: ONE_ETHER,
            transactorContractAddress,
          },
          HRE
        )
      ).to.be.rejectedWith(`Insufficient funds on contract. Current balance: 0.0 ${tokenSymbol}`);
    });

    it(`transfers ${tokenSymbol} amount requested from Transactor contract to the vault account`, async () => {
      const { transactorContractAddress } = await setup();
      const { ownerAddress, vaultAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);
      const vault = await ethers.getSigner(vaultAddress);

      console.log(transactorContractAddress);

      const transferredAmount = ONE_ETHER;
      const vaultBalanceBeforeWithdrawal = await getAccountBalance(vault, tokenSymbol);

      if (tokenSymbol === 'ETH') {
        // Transfer ETH to contract
        await owner.sendTransaction({ to: transactorContractAddress, value: transferredAmount });
      } else {
        // Transfer WETH to contract
        await swapEthForWeth(ethers, owner, transferredAmount, transactorContractAddress);
      }

      await withdraw(
        {
          signer: owner,
          tokenSymbol,
          amount: ONE_ETHER,
          transactorContractAddress,
        },
        HRE
      );

      const vaultBalanceAfterWithdrawal = await getAccountBalance(vault, tokenSymbol);

      expect(vaultBalanceAfterWithdrawal.sub(vaultBalanceBeforeWithdrawal).toString()).to.equal(
        transferredAmount.toString()
      );
    });
  }
});
