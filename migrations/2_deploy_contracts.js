// eslint-disable-next-line
const dotenv = require('dotenv');
dotenv.config();

const Owner = artifacts.require('Owner');
const Transactor = artifacts.require('Transactor');

const contractAddresses = require('./contractAddresses');

const getTransactorConstructorParameters = (network) => {
  switch (network) {
    case 'ropsten':
    case 'ropsten-fork': // Used by Truffle for dry-run migrations
      return [contractAddresses.ROPSTEN_UNISWAP_V2_ROUTER_ADDRESS];
    default:
      return [];
  }
};

module.exports = async function (deployer, network) {
  await deployer.deploy(Owner);
  await deployer.link(Owner, Transactor);

  const transactorConstructorParameters = getTransactorConstructorParameters(network);
  await deployer.deploy(Transactor, ...transactorConstructorParameters);
};
