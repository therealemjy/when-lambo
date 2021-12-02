import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as dotenv from 'dotenv';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/config';
import moduleAlias from 'module-alias';
// TS paths don't seem to be working with Hardhat, although the version of
// Hardhat we use just implemented that feature
// (https://github.com/nomiclabs/hardhat/pull/1992), so we use module-alias to
// map the paths when using Hardhat commands.
import 'module-alias/register';
import 'solidity-coverage';

import { OWNER_ACCOUNT_MAINNET_ADDRESS, profitableTestTrade } from './constants';
import './hardhatTasks';

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
  paths: {
    sources: './chainHandler/contracts',
    tests: './test',
    cache: './chainHandler/cache',
    artifacts: './chainHandler/artifacts',
    deploy: './chainHandler/deploy',
  },
  typechain: {
    outDir: './chainHandler/typechain',
  },
};

export default config;
