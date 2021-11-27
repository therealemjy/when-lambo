import { expect } from 'chai';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { BigNumber } from 'ethers';

import { Transactor as ITransactorContract } from '../typechain';

import { WETH_MAINNET_ADDRESS } from '../constants';
import { profitableTestTrade } from './constants';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

describe('Transactor', function () {
  describe('receive/fallback', function () {
    it('receives transferred ETH when msg.data is empty', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress } = await getNamedAccounts();
      const deployer = await ethers.getSigner(deployerAddress);

      const contractBalanceBeforeTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceBeforeTransfer.toString()).to.equal('0');

      const transferredEthAmount = '1000000000000000000';

      await deployer.sendTransaction({
        to: TransactorContract.address,
        value: BigNumber.from(transferredEthAmount), // 1 ether
      });

      const contractBalanceAfterTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceAfterTransfer.toString()).to.equal(transferredEthAmount);
    });

    it('receives transferred ETH when msg.data is not empty', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress } = await getNamedAccounts();
      const deployer = await ethers.getSigner(deployerAddress);

      const contractBalanceBeforeTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceBeforeTransfer.toString()).to.equal('0');

      const transferredEthAmount = '1000000000000000000';

      await deployer.sendTransaction({
        to: TransactorContract.address,
        value: BigNumber.from(transferredEthAmount), // 1 ether
        data: [1, 0, 1],
      });

      const contractBalanceAfterTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceAfterTransfer.toString()).to.equal(transferredEthAmount);
    });
  });

  describe('getBalance', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress, externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(TransactorContract.connect(externalUser).getBalance(WETH_MAINNET_ADDRESS)).to.be.revertedWith(
        'Owner only'
      );
      expect(await TransactorContract.owner()).to.equal(deployerAddress);
    });

    it('returns the current balance of the contract for the given token address, when called by the owner', async function () {
      const { TransactorContract } = await setup();

      const contractBalance = await TransactorContract.getBalance(WETH_MAINNET_ADDRESS);
      expect(contractBalance.toString()).to.equal('0');
    });
  });

  describe('trade', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(
        TransactorContract.connect(externalUser).trade(
          profitableTestTrade.wethAmountToBorrow,
          profitableTestTrade.tradedTokenAddress,
          profitableTestTrade.minTradedTokenAmountOut,
          profitableTestTrade.minWethAmountOut,
          profitableTestTrade.sellingExchangeIndex,
          profitableTestTrade.buyingExchangeIndex,
          BigNumber.from(new Date(new Date().getTime() + 120000).getTime()) // Set a deadline to 2 minutes from now
        )
      ).to.be.revertedWith('Owner only');
    });

    it('should execute trade and keep profit on the contract', async function () {
      const { TransactorContract } = await setup();

      // Assert we start with an empty balance on the contract
      const contractBalanceBeforeTrade = await TransactorContract.getBalance(WETH_MAINNET_ADDRESS);
      expect(contractBalanceBeforeTrade.toString()).to.equal('0');

      // Execute trade
      await TransactorContract.trade(
        profitableTestTrade.wethAmountToBorrow,
        profitableTestTrade.tradedTokenAddress,
        profitableTestTrade.minTradedTokenAmountOut,
        profitableTestTrade.minWethAmountOut,
        profitableTestTrade.sellingExchangeIndex,
        profitableTestTrade.buyingExchangeIndex,
        BigNumber.from(new Date(new Date().getTime() + 120000).getTime()) // Set a deadline to 2 minutes from now
      );

      // Assert the contract keeps the expected profit
      const contractBalanceAfterTrade = await TransactorContract.getBalance(WETH_MAINNET_ADDRESS);
      expect(contractBalanceAfterTrade.toString()).to.equal('587029118114948954');
    });

    // TODO: test buying and selling exchanges are correctly defined
  });

  describe('callFunction', function () {
    it('reverts when being called by an account that is not DyDx solo margin contract', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress } = await getNamedAccounts();

      await expect(
        TransactorContract.callFunction(deployerAddress, { owner: deployerAddress, number: BigNumber.from('1') }, [])
      ).to.be.revertedWith('DyDx contract only');
    });
  });
});
