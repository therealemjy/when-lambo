import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/config';
// TS paths don't seem to be working with Hardhat, although the version of
// Hardhat we use just implemented that feature
// (https://github.com/nomiclabs/hardhat/pull/1992), so we use module-alias to
// map the paths when using Hardhat commands.
import 'module-alias/register';
import 'solidity-coverage';

import config from '@config';

import { OWNER_ACCOUNT_MAINNET_ADDRESS } from './constants';
import './tasks';

chai.use(chaiAsPromised);

const hardhatConfig: HardhatUserConfig = {
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
        url: config.mainnetForkingRpcUrl || '',
        blockNumber: config.environment === 'test' ? config.testProfitableTrade.blockNumber : undefined,
      },
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'ETH',
  },
  namedAccounts: {
    ownerAddress: {
      hardhat: config.testAccountAddresses.owner, // assign the first user as owner
      mainnet: OWNER_ACCOUNT_MAINNET_ADDRESS,
    },
    vaultAddress: {
      hardhat: config.testAccountAddresses.vault,
      // TODO: add mainnet address
    },
    externalUserAddress: {
      hardhat: config.testAccountAddresses.externalUser, // assign another account as external user (used in tests only)
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

export default hardhatConfig;
