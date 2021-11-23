// eslint-disable-next-line
const dotenv = require('dotenv');
dotenv.config();

// eslint-disable-next-line
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    test: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
    },
    // ropsten: {
    //   provider: () =>
    //     new HDWalletProvider(process.env.ROPSTEN_ACCOUNT_PRIVATE_KEY, process.env.INFURA_ROPSTEN_HTTPS_RPC_URL),
    //   from: process.env.ROPSTEN_ACCOUNT_ADDRESS,
    //   network_id: 3,
    //   gas: 4000000,
    // },
    // test: {
    //   host: '127.0.0.1',
    //   port: 8545,
    //   network_id: '999',
    // },
  },
  compilers: {
    solc: {
      version: '0.8.10',
    },
  },
};
