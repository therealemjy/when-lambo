import dotenv from 'dotenv';

import contractAddresses from './contractAddresses';

dotenv.config();

export type Network = 'ganache' | 'ropsten' | 'ropsten-fork';

const Owner = artifacts.require('Owner');
const Transactor = artifacts.require('Transactor');

const getTransactorConstructorParameters = (network: Network) => {
  switch (network) {
    case 'ropsten':
    case 'ropsten-fork': // Used by Truffle for dry-run migrations
      return [contractAddresses.ropsten.uniswapV2Router];
    default:
      return [];
  }
};

module.exports = function (deployer, network: Network) {
  deployer.deploy(Owner);
  deployer.link(Owner, Transactor);

  const transactorConstructorParameters = getTransactorConstructorParameters(network);
  // TODO: improve typing
  deployer.deploy<any>(Transactor, ...transactorConstructorParameters);
} as Truffle.Migration;

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {};
