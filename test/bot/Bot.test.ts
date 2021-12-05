import { Multicall } from '@maxime.julian/ethereum-multicall';
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

    console.log('SERVICES');
    const blockNumber = await ethers.provider.getBlockNumber();

    const eventEmitterOnSpy = sinon.spy(services.eventEmitter, 'emit');

    const multicall = new Multicall({
      multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
      ethersProvider: ethers.provider,
      tryAggregate: true,
    });

    await blockHandler(services, { multicall, blockNumber });

    console.log('BLOCKHANDLER');

    const args = eventEmitterOnSpy.lastCall.args;

    // We test that the event emitter is called with the correct arguments
    expect(args[0]).equal('trade'); // Event name
    expect(args[1]).equal(blockNumber); // block number

    const path = args[2]; // best path
    expect(path.length).equal(2);

    expect(args[3].isEqualTo(services.state.currentGasPrices.rapid)).equal(true); // current gas price

    // We check the if the deal path is correct
    expect(path[0].exchangeIndex).equal(chainHandlerConfig.testProfitableTrade.sellingExchangeIndex);
    expect(path[1].exchangeIndex).equal(chainHandlerConfig.testProfitableTrade.buyingExchangeIndex);

    console.log('PATH');
    console.log(formatNestedBN(path));

    // Bot must be deactivated because a deal was found
    expect(services.state.monitoringActivated).equal(false);

    // // Call function of event emitter with correct arguments
    const spreadsheet = new GoogleSpreadsheet(services.config.googleSpreadSheet.id);
    const transaction = await executeTrade({
      blockNumber: args[1],
      path,
      gasPriceWei: args[3],
      gasLimitMultiplicator: services.config.gasLimitMultiplicator,
      spreadsheet,
      TransactorContract,
    });

    console.log('transaction', transaction);
  });
});
