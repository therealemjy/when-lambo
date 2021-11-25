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

  it('should execute fake trade', async function () {
    const { TransactorContract } = await setup();
    const [deployer] = await ethers.getSigners();

    // Send 1 ether to contract to cover flashloan fee (2 wei) TODO: chacal
    // mode, send exactly 2 wei and check contract's balance is 0 after
    // executing trade
    await deployer.sendTransaction({
      to: TransactorContract.address,
      value: ethers.utils.parseEther('1.0'),
    });

    const contractBalanceBeforeTrade = await TransactorContract.provider.getBalance(TransactorContract.address);
    console.log('Contract balance before trade: ', contractBalanceBeforeTrade.toString());

    // Execute trade (borrow 100000 WETH)
    await TransactorContract.execute(ethers.utils.parseEther('100000'));

    // console.log(res.toString());
  });
});
