import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import './tasks';
import { OWNER_ACCOUNT_MAINNET_ADDRESS, profitableTestTrade } from './constants';

chai.use(chaiAsPromised);
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_FORKING_RPC_URL || '',
        blockNumber: profitableTestTrade.blockNumber, // Juicy deal (see tests)
      },
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'ETH',
  },
  namedAccounts: {
    ownerAddress: {
      // hardhat: 0, // assign the first user as owner
      // DEV ONLY
      hardhat: 0, // assign the first user as owner
      // END DEV ONLY
      mainnet: OWNER_ACCOUNT_MAINNET_ADDRESS,
    },
    vaultAddress: {
      hardhat: 1,
      // TODO: add mainnet address
    },
    externalUserAddress: {
      hardhat: 2, // assign another account as external user (used in tests only)
    },
  },
};

export default config;
