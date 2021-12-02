import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers, deployments, getNamedAccounts } from 'hardhat';

import {
  WETH_MAINNET_ADDRESS,
  UNISWAP_V2_ROUTER_MAINNET_ADDRESS,
  SUSHISWAP_ROUTER_MAINNET_ADDRESS,
  CRYPTO_COM_ROUTER_MAINNET_ADDRESS,
  profitableTestTrade,
} from '@constants';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import swapEthForWeth from '@chainHandler/utils/swapEthForWeth';
import wethAbi from '@chainHandler/utils/wethAbi.json';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

const ONE_ETHER = ethers.utils.parseEther('1');

describe('contracts/Transactor', function () {
  describe('destruct', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(TransactorContract.connect(externalUser).destruct(externalUserAddress)).to.be.revertedWith(
        'Owner only'
      );

      // Check contract still exists
      const contractCode = await ethers.provider.getCode(TransactorContract.address);
      expect(contractCode).to.not.equal('0x');
    });

    it('destructs the contract and sends the remaining ETH and WETH to the provided account', async function () {
      const { TransactorContract } = await setup();
      const { ownerAddress, externalUserAddress } = await getNamedAccounts();

      const owner = await ethers.getSigner(ownerAddress);
      const externalUser = await ethers.getSigner(externalUserAddress);
      const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, owner);

      // Send 1 ETH to the contract
      const transferredEthAmount = ONE_ETHER;
      await owner.sendTransaction({
        to: TransactorContract.address,
        value: BigNumber.from(transferredEthAmount),
      });

      // Check contract received the ETH
      const contractEthBalanceBeforeDestruct = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractEthBalanceBeforeDestruct.toString()).to.equal(transferredEthAmount);

      // Send 1 WETH to the contract
      const transferredWethAmount = ONE_ETHER;
      await swapEthForWeth(ethers, owner, ethers.BigNumber.from(transferredWethAmount), TransactorContract.address);

      // Check contract received the WETH
      const contractWethBalanceBeforeDestruct = await wethContract.balanceOf(TransactorContract.address);
      expect(contractWethBalanceBeforeDestruct.toString()).to.equal(transferredWethAmount);

      // Keep references of the user balances before the contract gets destructed
      const externalUserEthBalanceBeforeDestruct = await externalUser.getBalance();
      const externalUserWethBalanceBeforeDestruct = await wethContract.balanceOf(externalUserAddress);

      await TransactorContract.destruct(externalUserAddress);

      // Check contract has been destructed
      const contractCode = await ethers.provider.getCode(TransactorContract.address);
      expect(contractCode).to.equal('0x');

      // Check user received the ETH that was on the contract
      const externalUserEthBalanceAfterDestruct = await externalUser.getBalance();

      expect(externalUserEthBalanceAfterDestruct.sub(externalUserEthBalanceBeforeDestruct).toString()).to.equal(
        contractEthBalanceBeforeDestruct.toString()
      );

      // Check user received the WETH that was on the contract
      const externalUserWethBalanceAfterDestruct = await wethContract.balanceOf(externalUserAddress);
      expect(externalUserWethBalanceAfterDestruct.sub(externalUserWethBalanceBeforeDestruct).toString()).to.equal(
        contractWethBalanceBeforeDestruct.toString()
      );
    });
  });

  describe('receive/fallback', function () {
    it('receives transferred ETH when msg.data is empty', async function () {
      const { TransactorContract } = await setup();
      const { ownerAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);

      const contractBalanceBeforeTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceBeforeTransfer.toString()).to.equal('0');

      const transferredEthAmount = ONE_ETHER;

      await owner.sendTransaction({
        to: TransactorContract.address,
        value: BigNumber.from(transferredEthAmount),
      });

      const contractBalanceAfterTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceAfterTransfer.toString()).to.equal(transferredEthAmount);
    });

    it('receives transferred ETH when msg.data is not empty', async function () {
      const { TransactorContract } = await setup();
      const { ownerAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);

      const contractBalanceBeforeTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(contractBalanceBeforeTransfer.toString()).to.equal('0');

      const transferredEthAmount = ONE_ETHER;

      await owner.sendTransaction({
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
      const { externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(
        TransactorContract.connect(externalUser).transferERC20(WETH_MAINNET_ADDRESS, ONE_ETHER, externalUserAddress)
      ).to.be.revertedWith('Owner only');
    });

    it('transfers the amount of tokens specified from the contract to the provided address', async function () {
      const { TransactorContract } = await setup();
      const { ownerAddress, externalUserAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);

      const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, owner);
      const externalUserBalanceBeforeTransfer = await wethContract.balanceOf(ownerAddress);

      // Check contract's WETH balance is 0
      const transactorContractBalanceBeforeTransfer = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceBeforeTransfer.toString()).to.equal('0');

      // Transfer 1 WETH to the contract
      const transferredWethAmount = ONE_ETHER;
      await swapEthForWeth(ethers, owner, ethers.BigNumber.from(transferredWethAmount), TransactorContract.address);

      // Check contract received the WETH
      const transactorContractBalance = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalance.toString()).to.equal(transferredWethAmount);

      // Transfer 1 WETH from the contract to a user who's not the owner of the contract
      await TransactorContract.transferERC20(WETH_MAINNET_ADDRESS, ONE_ETHER, externalUserAddress);

      // Check user received the WETH
      const externalUserBalanceAfterTransfer = await wethContract.balanceOf(externalUserAddress);
      expect(externalUserBalanceAfterTransfer.sub(externalUserBalanceBeforeTransfer).toString()).to.equal(
        transferredWethAmount
      );

      // Check contract WETH balance is back to 0
      const transactorContractBalanceAfterTransfer = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceAfterTransfer.toString()).to.equal('0');
    });
  });

  describe('transferETH', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(
        TransactorContract.connect(externalUser).transferETH(ONE_ETHER, externalUserAddress)
      ).to.be.revertedWith('Owner only');
    });

    it('sends the correct error if transfer fails', async function () {
      const { TransactorContract } = await setup();
      const { externalUserAddress } = await getNamedAccounts();

      // Transfer 1 ETH from the contract to a user who's not the owner of the contract
      await expect(TransactorContract.transferETH(ONE_ETHER, externalUserAddress)).to.be.revertedWith(
        'Transfer failed'
      );
    });

    it('transfers the amount of tokens specified from the contract to the provided address', async function () {
      const { TransactorContract } = await setup();
      const { ownerAddress, externalUserAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);
      const externalUser = await ethers.getSigner(externalUserAddress);

      const externalUserBalanceBeforeTransfer = await externalUser.getBalance();

      // Check contract's ETH balance is 0
      const transactorContractBalanceBeforeTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(transactorContractBalanceBeforeTransfer.toString()).to.equal('0');

      // Transfer 1 ETH to the contract
      // Note: we send the ETH from the owner signer so the external user balance isn't affected
      const transferredEthAmount = BigNumber.from(ONE_ETHER);
      await owner.sendTransaction({ to: TransactorContract.address, value: transferredEthAmount });

      // Check contract received the ETH
      const transactorContractBalance = await ethers.provider.getBalance(TransactorContract.address);
      expect(transactorContractBalance.toString()).to.equal(transferredEthAmount);

      // Transfer 1 ETH from the contract to a user who's not the owner of the contract
      await TransactorContract.transferETH(ONE_ETHER, externalUserAddress);

      // Check user received the ETH
      const externalUserBalanceAfterTransfer = await externalUser.getBalance();
      expect(externalUserBalanceAfterTransfer.sub(externalUserBalanceBeforeTransfer).toString()).to.equal(
        transferredEthAmount
      );

      // Check contract's ETH balance is back to 0
      const transactorContractBalanceAfterTransfer = await ethers.provider.getBalance(TransactorContract.address);
      expect(transactorContractBalanceAfterTransfer.toString()).to.equal('0');
    });
  });

  describe('getExchange', function () {
    it('returns the correct contract based on the passed exchangeIndex', async function () {
      const { TransactorContract } = await setup();

      const expectedUniswapV2RouterAddress = await TransactorContract.getExchange(0);
      const expectedSushiswapRouterAddress = await TransactorContract.getExchange(1);
      const expectedCryptoComRouterAddress = await TransactorContract.getExchange(2);

      expect(expectedUniswapV2RouterAddress).to.equal(UNISWAP_V2_ROUTER_MAINNET_ADDRESS);
      expect(expectedSushiswapRouterAddress).to.equal(SUSHISWAP_ROUTER_MAINNET_ADDRESS);
      expect(expectedCryptoComRouterAddress).to.equal(CRYPTO_COM_ROUTER_MAINNET_ADDRESS);
    });
  });

  describe('trade', function () {
    it('reverts when being called by an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      const { externalUserAddress } = await getNamedAccounts();
      const externalUser = await ethers.getSigner(externalUserAddress);

      await expect(
        TransactorContract.connect(externalUser).trade(
          currentBlockNumber + 1,
          profitableTestTrade.wethAmountToBorrow,
          profitableTestTrade.sellingExchangeIndex,
          profitableTestTrade.wethAmountOutMin,
          profitableTestTrade.buyingExchangeIndex,
          profitableTestTrade.tradedTokenAddress,
          profitableTestTrade.tradedTokenAmountOutMin,
          BigNumber.from(new Date(new Date().getTime() + 120000).getTime()) // Set a deadline to 2 minutes from now
        )
      ).to.be.revertedWith('Owner only');
    });

    it('reverts when expectedBlockNumber does not correspond to the block number the transaction is being mined for', async function () {
      const { TransactorContract } = await setup();
      const currentBlockNumber = await ethers.provider.getBlockNumber();

      await expect(
        TransactorContract.trade(
          // This transaction should be mined at currentBlockNumber + 1, so passing currentBlockNumber should
          // trigger a revert
          currentBlockNumber,
          profitableTestTrade.wethAmountToBorrow,
          profitableTestTrade.sellingExchangeIndex,
          profitableTestTrade.wethAmountOutMin,
          profitableTestTrade.buyingExchangeIndex,
          profitableTestTrade.tradedTokenAddress,
          profitableTestTrade.tradedTokenAmountOutMin,
          BigNumber.from(new Date(new Date().getTime() + 120000).getTime()) // Set a deadline to 2 minutes from now
        )
      ).to.be.revertedWith('Trade expired');
    });

    it('should execute trade, keeping the profit on the contract and sending a SuccessfulTrade event', async function () {
      const { TransactorContract } = await setup();
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      const { ownerAddress } = await getNamedAccounts();
      const owner = await ethers.getSigner(ownerAddress);
      const wethContract = new ethers.Contract(WETH_MAINNET_ADDRESS, wethAbi, owner);

      // Check we start with an empty balance on the contract
      const transactorContractBalanceBeforeTransfer = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceBeforeTransfer.toString()).to.equal('0');

      // Execute trade
      await expect(
        TransactorContract.trade(
          currentBlockNumber + 1,
          profitableTestTrade.wethAmountToBorrow,
          profitableTestTrade.sellingExchangeIndex,
          profitableTestTrade.wethAmountOutMin,
          profitableTestTrade.buyingExchangeIndex,
          profitableTestTrade.tradedTokenAddress,
          profitableTestTrade.tradedTokenAmountOutMin,
          BigNumber.from(new Date(new Date().getTime() + 120000).getTime()) // Set a deadline to 2 minutes from now
        )
      )
        // Check a SuccessfulTrade event was emitted
        .to.emit(TransactorContract, 'SuccessfulTrade')
        .withArgs(
          profitableTestTrade.tradedTokenAddress,
          profitableTestTrade.wethAmountToBorrow,
          profitableTestTrade.sellingExchangeIndex,
          profitableTestTrade.tradedTokenAmountOutExpected,
          profitableTestTrade.buyingExchangeIndex,
          profitableTestTrade.wethAmountOutExpected
        );

      // Check the contract keeps the expected profit
      const transactorContractBalanceAfterTrade = await wethContract.balanceOf(TransactorContract.address);
      expect(transactorContractBalanceAfterTrade.toString()).to.equal('587029118114948954');
    });
  });

  describe('callFunction', function () {
    it('reverts when being called by an account that is not DyDx solo margin contract', async function () {
      const { TransactorContract } = await setup();
      const { ownerAddress } = await getNamedAccounts();

      await expect(
        TransactorContract.callFunction(ownerAddress, { owner: ownerAddress, number: BigNumber.from('1') }, [])
      ).to.be.revertedWith('VM Exception while processing transaction: reverted with panic code 0x1 (Assertion error)');
    });
  });
});
