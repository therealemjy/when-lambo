import withdrawFromTransactorContract from '@tasks/withdrawTasks/withdrawFromTransactorContract';
import { expect } from 'chai';
import { BigNumber, Signer } from 'ethers';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { address as WETH_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/weth.json';
import { abi as wethAbi } from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import wrapEth from '@chainHandler/utils/wrapEth';

const hre = { ethers, getNamedAccounts } as HardhatRuntimeEnvironment;
const ONE_ETHER = ethers.utils.parseEther('1');
const TEST_GAS_PRICE = BigNumber.from('50000000000'); // 50 Gwei

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
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
  const tokenSymbols: ['ETH', 'WETH'] = ['ETH', 'WETH'];

  for (let t = 0; t < tokenSymbols.length; t++) {
    const tokenSymbol = tokenSymbols[t];

    it(`throws an error when withdrawing ${tokenSymbol} and Transactor contract does not have sufficient funds`, async () => {
      await expect(
        withdrawFromTransactorContract(
          {
            tokenSymbol,
            amount: ONE_ETHER,
            countdownSeconds: 0,
            gasPrice: TEST_GAS_PRICE,
          },
          hre
        )
      ).to.be.rejectedWith(`Insufficient funds on contract. Current balance: 0.0 ${tokenSymbol}`);
    });

    it(`transfers ${tokenSymbol} amount requested from Transactor contract to the vault account`, async () => {
      const { TransactorContract } = await setup();
      const { ownerAddress, vaultAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);
      const vault = await ethers.getSigner(vaultAddress);

      const transferredAmount = ONE_ETHER;
      const vaultBalanceBeforeWithdrawal = await getAccountBalance(vault, tokenSymbol);

      if (tokenSymbol === 'ETH') {
        // Transfer ETH to contract
        await owner.sendTransaction({ to: TransactorContract.address, value: transferredAmount });
      } else {
        // Transfer WETH to contract
        await wrapEth(owner, transferredAmount, TransactorContract.address);
      }

      await withdrawFromTransactorContract(
        {
          tokenSymbol,
          amount: ONE_ETHER,
          countdownSeconds: 0,
          gasPrice: TEST_GAS_PRICE,
        },
        hre
      );

      const vaultBalanceAfterWithdrawal = await getAccountBalance(vault, tokenSymbol);

      expect(vaultBalanceAfterWithdrawal.sub(vaultBalanceBeforeWithdrawal).toString()).to.equal(
        transferredAmount.toString()
      );
    });
  }
});
