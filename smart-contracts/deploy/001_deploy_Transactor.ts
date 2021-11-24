import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// TODO: move somewhere else for reusability
const UNISWAP_V2_ROUTER_MAINNET_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const deployFunc: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy('Transactor', {
    from: deployer,
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    args: [UNISWAP_V2_ROUTER_MAINNET_ADDRESS],
  });
};

deployFunc.tags = ['Transactor'];

export default deployFunc;
