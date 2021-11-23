// @ts-ignore
const Transactor = artifacts.require('Transactor');

contract('WhenLambo', (accounts) => {
  // let evmSnapshotId: string;

  beforeEach(() => {
    // TODO: revert EVM then take snapshot
    // // Reset EVM state if a snapshot exists
    // if (evmSnapshotId) {
    // }
  });

  it('should do a test transfer', async () => {
    // Execute basic transaction
    const deployedTransactor = await Transactor.deployed();

    const accountBalance = await web3.eth.getBalance(accounts[0]);
    console.log('Account balance before test:', accountBalance);

    // Execute test transfer
    await deployedTransactor.execute(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      web3.utils.toBN(web3.utils.toWei('1', 'ether')),
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      web3.utils.toBN(web3.utils.toWei('3000', 'ether')),
      new Date(new Date().getTime() + 5 * 60000).getTime(),
      { from: accounts[0] }
    );

    const updatedAccountBalance = await web3.eth.getBalance(accounts[0]);
    console.log('Account balance after test:', updatedAccountBalance.toString());
  });
});
