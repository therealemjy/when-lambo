import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';

import './hardhat.tasks';
import { profitableTestTrade } from './test/constants';

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
      default: 0, // assign the first user as owner
    },
    bankAddress: {
      default: 1,
    },
    externalUserAddress: {
      default: 2, // assign another account as external user (used in tests only)
    },
  },
};

export default config;
