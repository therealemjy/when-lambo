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
    const deployedTransactor = await Transactor.deployed();

    const accountBalance = await web3.eth.getBalance(accounts[0]);
    const balance = await web3.eth.getBalance('0x573dB59bdc52A1Fdd45B11de9045904Ca6AFcBed');
    console.log('Account balance before test:', accountBalance);
    console.log('Contract', balance.toString());

    const contractBalance = await deployedTransactor.getETHBalance();

    console.log('ETH on contract:', contractBalance.toString());

    // Try withdrawing money
    const res = await deployedTransactor.withdraw('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', web3.utils.toBN(3));

    console.log('res', res);

    // Execute test transfer
    // await deployedTransactor.execute(
    //   '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    //   web3.utils.toWei('1', 'ether'),
    //   '0x6b175474e89094c44da98b954eedeac495271d0f',
    //   web3.utils.toWei('3000', 'ether'), // Represents 3000 DAI decimals (sine DAI has 18 decimals like ETH)
    //   new Date(new Date().getTime() + 5 * 60000).getTime(),
    //   { from: accounts[0] }
    // );

    // const updatedAccountBalance = await web3.eth.getBalance(accounts[0]);
    // console.log('Account balance after test:', updatedAccountBalance.toString());
  });
});
