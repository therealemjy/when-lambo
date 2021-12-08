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

import chainHandlerConfig from './chainHandler/config';
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
        url: chainHandlerConfig.networks.hardhat.rpcUrl,
        blockNumber:
          chainHandlerConfig.environment === 'test' ? chainHandlerConfig.networks.hardhat.blockNumber : undefined,
      },
    },
    rinkeby: {
      url: chainHandlerConfig.networks.rinkeby.rpcUrl,
      accounts: [chainHandlerConfig.networks.rinkeby.accounts.owner.privateKey],
    },
    mainnet: {
      url: chainHandlerConfig.networks.mainnet.rpcUrl,
      accounts: [chainHandlerConfig.networks.mainnet.accounts.owner.privateKey],
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'ETH',
  },
  namedAccounts: {
    ownerAddress: {
      hardhat: chainHandlerConfig.networks.hardhat.accounts.owner.address,
      rinkeby: chainHandlerConfig.networks.rinkeby.accounts.owner.address,
      mainnet: chainHandlerConfig.networks.mainnet.accounts.owner.address,
    },
    vaultAddress: {
      hardhat: chainHandlerConfig.networks.hardhat.accounts.vault.address,
      rinkeby: chainHandlerConfig.networks.rinkeby.accounts.vault.address,
      mainnet: chainHandlerConfig.networks.mainnet.accounts.vault.address,
    },
    // assign another account as external user (used in tests only)
    externalUserAddress: {
      hardhat: chainHandlerConfig.networks.hardhat.accounts.externalUser.address,
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
