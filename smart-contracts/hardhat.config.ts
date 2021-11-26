import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.4',
  networks: {
    hardhat: {
      // TODO: check if we need to pass undefined once we'll deploy the contracts onto the mainnet
      forking: {
        url: process.env.MAINNET_FORKING_RPC_URL || '',
        blockNumber: 13679843, // Juicy deal (see tests)
      },
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'ETH',
  },
  namedAccounts: {
    deployerAddress: {
      default: 0, // assign the first user as deployer
    },
    externalUserAddress: {
      default: 1, // assign another account as external user (used in tests only)
    },
  },
};

export default config;
