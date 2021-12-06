import { Multicall } from '@maxime.julian/ethereum-multicall';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { ethers, deployments } from 'hardhat';

import { MULTICALL_CONTRACT_MAINNET_ADDRESS } from '@constants';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import blockHandler from '@bot/src/blockHandler';

import mockServices from './utils/mockServices';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

describe.only('Bot', function () {
  it('Should find opportunity and call smart contract', async function () {
    const { TransactorContract } = await setup();
    const mockedServices = mockServices();
    const fakeSpreadsheet = new GoogleSpreadsheet(mockedServices.config.googleSpreadSheet.id);

    const multicall = new Multicall({
      multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
      ethersProvider: ethers.provider,
      tryAggregate: true,
    });

    const currentBlockNumber = await ethers.provider.getBlockNumber();

    await blockHandler(mockedServices, {
      multicall,
      blockNumber: currentBlockNumber,
      TransactorContract,
      spreadsheet: fakeSpreadsheet,
    });
  });
});
