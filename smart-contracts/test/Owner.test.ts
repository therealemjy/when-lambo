import { expect } from 'chai';
import { ethers } from 'hardhat';

// TODO: remove

describe('Owner', function () {
  it('should set sender as the owner when deploying', async function () {
    const [sender] = await ethers.getSigners();

    const OwnerContractFactory = await ethers.getContractFactory('Owner');
    const deployedOwnerContract = await OwnerContractFactory.deploy();

    expect(await deployedOwnerContract.owner()).to.equal(sender.address);
  });

  it('should revert when an another account than the owner calls setOwner', async function () {
    const [sender, otherUser] = await ethers.getSigners();

    const OwnerContractFactory = await ethers.getContractFactory('Owner');
    const deployedOwnerContract = await OwnerContractFactory.deploy();

    await expect(deployedOwnerContract.connect(otherUser).setOwner(otherUser.address)).to.be.revertedWith('Owner only');

    expect(await deployedOwnerContract.owner()).to.equal(sender.address);
  });

  it('should update the owner when setOwner is called by the current owner', async function () {
    const [sender, otherUser] = await ethers.getSigners();

    const OwnerContractFactory = await ethers.getContractFactory('Owner');
    const deployedOwnerContract = await OwnerContractFactory.deploy();

    expect(await deployedOwnerContract.owner()).to.equal(sender.address);

    // Make call to update owner
    await deployedOwnerContract.setOwner(otherUser.address);

    expect(await deployedOwnerContract.owner()).to.equal(otherUser.address);
  });
});
