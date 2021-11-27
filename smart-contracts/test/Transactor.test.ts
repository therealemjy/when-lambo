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
  describe('getBalance', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress, externalUserAddress } = await getNamedAccounts();

      await expect(TransactorContract.connect(externalUserAddress).getBalance(WETH_MAINNET_ADDRESS)).to.be.revertedWith(
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

  it('should execute trade and yield expected profit', async function () {
    const { TransactorContract } = await setup();

    // Assert we start with an empty balance on the contract
    const contractBalanceBeforeTrade = await TransactorContract.getBalance(WETH_MAINNET_ADDRESS);
    expect(contractBalanceBeforeTrade.toString()).to.equal('0');

    // Execute trade
    await TransactorContract.execute(
      profitableTestTrade.wethAmountToBorrow,
      profitableTestTrade.tradedTokenAddress,
      profitableTestTrade.minTradedTokenAmountOut,
      profitableTestTrade.minWethAmountOut,
      profitableTestTrade.sellingExchangeIndex,
      profitableTestTrade.buyingExchangeIndex,
      BigNumber.from(new Date(new Date().getTime() + 120000).getTime()) // Set a deadline 2 minutes fro now
    );

    const contractBalanceAfterTrade = await TransactorContract.getBalance(WETH_MAINNET_ADDRESS);
    expect(contractBalanceAfterTrade.toString()).to.equal('587029118114948954');
  });
});
