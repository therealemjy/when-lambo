import { expect } from 'chai';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { BigNumber } from 'ethers';

import { Transactor as ITransactorContract } from '../typechain';

import { WETH_MAINNET_ADDRESS } from '../constants';
import { profitableTestTrade } from './constants';
import exchangeEthForWeth from './utils/exchangeEthForWeth';
import getWethContract from './utils/getWethContract';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

const ONE_ETH = '1000000000000000000';
const ONE_WETH = ONE_ETH;

describe('Transactor', function () {
  describe('receive/fallback', function () {
    it('receives transferred ETH when msg.data is empty', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress } = await getNamedAccounts();
      const deployer = await ethers.getSigner(deployerAddress);

      const contractBalanceBeforeTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceBeforeTransfer.toString()).to.equal('0');

      const transferredEthAmount = ONE_ETH;

      await deployer.sendTransaction({
        to: TransactorContract.address,
        value: BigNumber.from(transferredEthAmount),
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

      const transferredEthAmount = ONE_ETH;

      await deployer.sendTransaction({
        to: TransactorContract.address,
        value: BigNumber.from(transferredEthAmount),
        data: [1, 0, 1],
      });

      const contractBalanceAfterTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceAfterTransfer.toString()).to.equal(transferredEthAmount);
    });
  });

  describe('transferERC20', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress, externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(
        TransactorContract.connect(externalUser).transferERC20(WETH_MAINNET_ADDRESS, ONE_WETH, externalUserAddress)
      ).to.be.revertedWith('Owner only');
      expect(await TransactorContract.owner()).to.equal(deployerAddress);
    });

    it('transfers the amount of tokens specified from the contract to the provided address', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress, externalUserAddress } = await getNamedAccounts();
      const deployer = await ethers.getSigner(deployerAddress);

      const wethContract = getWethContract(deployer);
      const externalUserBalanceBeforeTransfer = await wethContract.balanceOf(deployerAddress);

      // Assert contract's WETH balance is 0
      const transactorContractBalanceBeforeTransfer = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceBeforeTransfer.toString()).to.equal('0');

      // Transfer 1 WETH to the contract
      const wethTransferred = ONE_WETH;
      await exchangeEthForWeth(deployer, ethers.BigNumber.from(wethTransferred), TransactorContract.address);

      // Assert contract received the WETH
      const transactorContractBalance = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalance.toString()).to.equal(wethTransferred);

      // Transfer 1 WETH from the contract to a user who's not the owner of the contract
      await TransactorContract.transferERC20(WETH_MAINNET_ADDRESS, ONE_WETH, externalUserAddress);

      // Assert user received the WETH
      const externalUserBalanceAfterTransfer = await wethContract.balanceOf(externalUserAddress);
      expect(externalUserBalanceAfterTransfer.sub(externalUserBalanceBeforeTransfer).toString()).to.equal(
        wethTransferred
      );

      // Assert contract WETH balance is back to 0
      const transactorContractBalanceAfterTransfer = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceAfterTransfer.toString()).to.equal('0');
    });
  });

  describe('transferETH', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress, externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(
        TransactorContract.connect(externalUser).transferETH(ONE_ETH, externalUserAddress)
      ).to.be.revertedWith('Owner only');
      expect(await TransactorContract.owner()).to.equal(deployerAddress);
    });

    it('transfers the amount of tokens specified from the contract to the provided address', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress, externalUserAddress } = await getNamedAccounts();
      const deployer = await ethers.getSigner(deployerAddress);
      const externalUser = await ethers.getSigner(externalUserAddress);

      const externalUserBalanceBeforeTransfer = await externalUser.getBalance();

      // Assert contract's ETH balance is 0
      const transactorContractBalanceBeforeTransfer = await TransactorContract.provider.getBalance(
        TransactorContract.address
      );
      expect(transactorContractBalanceBeforeTransfer.toString()).to.equal('0');

      // Transfer 1 ETH to the contract
      // Note: we send the ETH from the deployer signer so the external user balance isn't affected
      const ethTransferred = BigNumber.from(ONE_ETH);
      await deployer.sendTransaction({ to: TransactorContract.address, value: ethTransferred });

      // Assert contract received the ETH
      const transactorContractBalance = await TransactorContract.provider.getBalance(TransactorContract.address);
      expect(transactorContractBalance.toString()).to.equal(ethTransferred);

      // Transfer 1 ETH from the contract to a user who's not the owner of the contract
      await TransactorContract.transferETH(ONE_ETH, externalUserAddress);

      // Assert user received the ETH
      const externalUserBalanceAfterTransfer = await externalUser.getBalance();
      expect(externalUserBalanceAfterTransfer.sub(externalUserBalanceBeforeTransfer).toString()).to.equal(
        ethTransferred
      );

      // Assert contract's ETH balance is back to 0
      const transactorContractBalanceAfterTransfer = await TransactorContract.provider.getBalance(
        TransactorContract.address
      );
      expect(transactorContractBalanceAfterTransfer.toString()).to.equal('0');
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
      const { deployerAddress } = await getNamedAccounts();
      const deployer = await ethers.getSigner(deployerAddress);
      const wethContract = getWethContract(deployer);

      // Assert we start with an empty balance on the contract
      const transactorContractBalanceBeforeTransfer = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceBeforeTransfer.toString()).to.equal('0');

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
      const transactorContractBalanceAfterTrade = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceAfterTrade.toString()).to.equal('587029118114948954');
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
