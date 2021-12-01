import { expect } from 'chai';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers, deployments, getNamedAccounts } from 'hardhat';

import withdraw from '../../tasks/utils/withdraw';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
});

const HRE = { ethers, getNamedAccounts } as HardhatRuntimeEnvironment;

const ONE_ETH = ethers.utils.parseEther('1');
// const ONE_WETH = ONE_ETH;

describe('tasks/withdraw', function () {
  it('throws an error when signing transaction with an account that is not the owner', async function () {
    await setup();
    const { ownerAddress, externalUserAddress } = await getNamedAccounts();
    const externalUser = await ethers.getSigner(externalUserAddress);

    await expect(
      withdraw(
        {
          signer: externalUser,
          tokenSymbol: 'ETH',
          amount: ONE_ETH,
        },
        HRE
      )
    ).to.be.rejectedWith(
      `Wrong signer. The signer address needed is ${ownerAddress}, but the one provided was ${externalUserAddress}`
    );
  });
});
