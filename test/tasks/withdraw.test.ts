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

  describe('throws an error when contract does not have sufficient funds', async function () {
    const tokenSymbols: ['ETH', 'WETH'] = ['ETH', 'WETH'];

    for (let t = 0; t < tokenSymbols.length; t++) {
      const tokenSymbol = tokenSymbols[t];

      it(`when withdrawing ${tokenSymbol}`, async () => {
        await setup();
        const { ownerAddress } = await getNamedAccounts();
        const owner = await ethers.getSigner(ownerAddress);

        await expect(
          withdraw(
            {
              signer: owner,
              tokenSymbol,
              amount: ONE_ETH,
            },
            HRE
          )
        ).to.be.rejectedWith(`Insufficient funds on contract. Current balance: 0.0 ${tokenSymbol}`);
      });
    }
  });
});
