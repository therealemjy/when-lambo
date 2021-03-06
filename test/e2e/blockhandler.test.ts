import { Multicall } from '@maxime.julian/ethereum-multicall';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { ethers, deployments } from 'hardhat';

import { address as MULTICALL_CONTRACT_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/multicall2.json';
import wethContractInfo from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import blockHandler from '@bot/src/blockHandler';

import { mockedServices, EXPECTED_REVENUE_WETH } from './testData';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

const getContractWethBalance = async (contract: ITransactorContract): Promise<BigNumber> => {
  const wethContract = new ethers.Contract(wethContractInfo.address, wethContractInfo.abi, contract.signer);
  return wethContract.balanceOf(contract.address);
};

describe('blockhandler', function () {
  it('should find opportunity, execute trade and yield profit', async function () {
    const { TransactorContract } = await setup();

    const fakeWorksheet = {
      addRows: () => new Promise((resolve) => resolve(undefined)),
    };

    const fakeSpreadsheet = {
      sheetsByIndex: [fakeWorksheet],
    } as unknown as GoogleSpreadsheet;

    const multicall = new Multicall({
      multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
      ethersProvider: ethers.provider,
      tryAggregate: true,
    });

    const currentBlockNumber = await ethers.provider.getBlockNumber();

    const ownerEthBalanceBeforeTrade = await TransactorContract.signer.getBalance();
    const transactorContractBalanceWethBeforeTrade = await getContractWethBalance(TransactorContract);

    await blockHandler(mockedServices, {
      multicall,
      blockNumber: currentBlockNumber,
      TransactorContract,
      spreadsheet: fakeSpreadsheet,
    });

    const ownerEthBalanceAfterTrade = await TransactorContract.signer.getBalance();
    const transactorContractBalanceWethAfterTrade = await getContractWethBalance(TransactorContract);

    // Check profit accumulated on Transactor contact
    const revenueWeth = transactorContractBalanceWethAfterTrade.sub(transactorContractBalanceWethBeforeTrade);
    expect(revenueWeth.toString()).to.equal(EXPECTED_REVENUE_WETH);

    // Check gas cost was under the maximum threshold configured
    const gasCostEth = ownerEthBalanceBeforeTrade.sub(ownerEthBalanceAfterTrade);
    expect(gasCostEth.lte(mockedServices.config.gasCostMaximumThresholdWei)).to.equal(true);

    // Check profit is at least equal or higher than gas cost
    // Note: gas cost is expressed in ETH and revenue is expressed in WETH, but since 1 ETH = 1 WETH we
    // don't need to do apply any conversion to make calculations between the two
    const profitWeth = revenueWeth.sub(gasCostEth);
    expect(profitWeth.gte(gasCostEth)).to.equal(true);
  });
});
