import { expect } from 'chai';
import { ethers, deployments, getNamedAccounts } from 'hardhat';

import { Transactor as ITransactorContract } from '../typechain';

const WETH_CONTRACT_MAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor');

  return { TransactorContract };
});

describe('Transactor', function () {
  describe('getBalance', function () {
    it('reverts when being called from an account that is not the owner', async function () {
      const { TransactorContract } = await setup();
      const { deployerAddress, externalUserAddress } = await getNamedAccounts();

      await expect(
        TransactorContract.connect(externalUserAddress).getBalance(WETH_CONTRACT_MAINNET_ADDRESS)
      ).to.be.revertedWith('Owner only');
      expect(await TransactorContract.owner()).to.equal(deployerAddress);
    });
  });

  // it('should execute basic trade', async function () {
  //   const { TransactorContract } = await setup();
  //   const { externalUser } = await getNamedAccounts();

  //   const res = await TransactorContract.connect(externalUser).getBalance(WETH_CONTRACT_MAINNET_ADDRESS);

  //   console.log(res.toString());
  // });
});
