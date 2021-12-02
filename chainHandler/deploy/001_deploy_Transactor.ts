import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import {
  WETH_MAINNET_ADDRESS,
  DYDX_SOLO_MAINNET_ADDRESS,
  UNISWAP_V2_ROUTER_MAINNET_ADDRESS,
  SUSHISWAP_ROUTER_MAINNET_ADDRESS,
  CRYPTO_COM_ROUTER_MAINNET_ADDRESS,
} from '../../constants';

const deployFunc: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { ownerAddress } = await getNamedAccounts();

  await deploy('Transactor', {
    from: ownerAddress,
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    args: [
      WETH_MAINNET_ADDRESS,
      DYDX_SOLO_MAINNET_ADDRESS,
      UNISWAP_V2_ROUTER_MAINNET_ADDRESS,
      SUSHISWAP_ROUTER_MAINNET_ADDRESS,
      CRYPTO_COM_ROUTER_MAINNET_ADDRESS,
    ],
  });
};

deployFunc.tags = ['Transactor'];

export default deployFunc;
