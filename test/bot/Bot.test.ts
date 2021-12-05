import { Multicall } from '@maxime.julian/ethereum-multicall';
import { expect } from 'chai';
import { ethers, deployments } from 'hardhat';
import sinon from 'sinon';

import { MULTICALL_CONTRACT_MAINNET_ADDRESS } from '@constants';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import blockHandler from '@bot/src/blockHandler';

import { getTestServices } from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

describe.only('Bot', function () {
  it('Should find opportunity and call smart contract', async function () {
    const contract = await setup();
    const services = getTestServices();

    const eventEmitterOn = sinon.spy(services.eventEmitter, 'emit');

    const multicall = new Multicall({
      multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
      ethersProvider: ethers.provider,
      tryAggregate: true,
    });

    await blockHandler(services, { multicall, blockNumber: '10000000000' });

    const args = eventEmitterOn.lastCall.args;

    expect(args[0]).equal('paths'); // Event name
    expect(args[1]).equal('10000000000'); // block number

    console.log('eventEmitterOn', args[2]);
  });
});
