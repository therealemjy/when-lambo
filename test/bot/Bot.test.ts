import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';
import { expect } from 'chai';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { ethers, deployments } from 'hardhat';
import sinon from 'sinon';

import { MULTICALL_CONTRACT_MAINNET_ADDRESS } from '@constants';

import chainHandlerConfig from '@chainHandler/config';
import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import formatNestedBN from '@chainHandler/utils/formatNestedBN';

import blockHandler from '@bot/src/blockHandler';
import executeTrade from '@bot/src/bootstrap/eventEmitter/executeTrade';
import { Path } from '@bot/src/types';

import { getTestServices } from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

describe.only('Bot', function () {
  it('Should find opportunity and call smart contract', async function () {
    const { TransactorContract } = await setup();
    const services = getTestServices();

    const eventEmitterOnSpy = sinon.spy(services.eventEmitter, 'emit');

    const multicall = new Multicall({
      multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
      ethersProvider: ethers.provider,
      tryAggregate: true,
    });

    const currentBlockNumber = await ethers.provider.getBlockNumber();
    await blockHandler(services, { multicall, blockNumber: currentBlockNumber });

    const [eventName, blockNumber, path, gasPriceWei] = eventEmitterOnSpy.lastCall.args as [
      string,
      number,
      Path,
      BigNumber
    ];

    // We test that the event emitter is called with the correct arguments
    expect(eventName).equal('trade');
    expect(blockNumber).equal(currentBlockNumber);

    expect(path.length).equal(2);
    expect(path[0].exchangeIndex).equal(chainHandlerConfig.testProfitableTrade.sellingExchangeIndex);
    expect(path[1].exchangeIndex).equal(chainHandlerConfig.testProfitableTrade.buyingExchangeIndex);
    // TODO: check other props of the deals contained in the path

    expect(gasPriceWei.isEqualTo(services.state.currentGasPrices.rapid)).equal(true); // current gas price

    // Check bot was deactivated, since it found a tradable opportunity
    expect(services.state.monitoringActivated).equal(false);

    // Simulate trade execution
    const spreadsheet = new GoogleSpreadsheet(services.config.googleSpreadSheet.id);
    const transaction = await executeTrade({
      blockNumber,
      path,
      gasPriceWei,
      gasLimitMultiplicator: services.config.gasLimitMultiplicator,
      spreadsheet,
      TransactorContract,
    });

    console.log('transaction', transaction);
  });
});
