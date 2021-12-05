import { Multicall } from '@maxime.julian/ethereum-multicall';
import { expect } from 'chai';
import { ethers, deployments } from 'hardhat';
import sinon from 'sinon';

import { MULTICALL_CONTRACT_MAINNET_ADDRESS } from '@constants';

import chainHandlerConfig from '@chainHandler/config';
import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import blockHandler from '@bot/src/blockHandler';
import { Path } from '@bot/src/types';

import { getTestServices } from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

describe('Bot', function () {
  it('Should find opportunity and call smart contract', async function () {
    await setup();
    const services = getTestServices();
    const blockNumber = chainHandlerConfig.testProfitableTrade.blockNumber.toString();

    const eventEmitterOn = sinon.spy(services.eventEmitter, 'emit');

    const multicall = new Multicall({
      multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
      ethersProvider: ethers.provider,
      tryAggregate: true,
    });

    await blockHandler(services, { multicall, blockNumber });

    const args = eventEmitterOn.lastCall.args;

    expect(args[0]).equal('trade'); // Event name
    expect(args[1]).equal(blockNumber); // block number

    const paths = args[2];

    // Find the right path with the right exchanges
    expect(paths[0].exchangeIndex).equal(chainHandlerConfig.testProfitableTrade.sellingExchangeIndex);
    expect(paths[1].exchangeIndex).equal(chainHandlerConfig.testProfitableTrade.buyingExchangeIndex);

    // trade must be deactivated
    expect(services.state.monitoringActivated).equal(false);

    // Call function of event emitter with correct arguments
  });
});
