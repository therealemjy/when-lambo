import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// TODO: move somewhere else for reusability
const WETH_MAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const DYDX_SOLO_MAINNET_ADDRESS = '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e';
const UNISWAP_V2_ROUTER_MAINNET_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const deployFunc: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployerAddress } = await getNamedAccounts();

  await deploy('Transactor', {
    from: deployerAddress,
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    args: [WETH_MAINNET_ADDRESS, DYDX_SOLO_MAINNET_ADDRESS, UNISWAP_V2_ROUTER_MAINNET_ADDRESS],
  });
};

deployFunc.tags = ['Transactor'];

export default deployFunc;
