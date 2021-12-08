import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { address as CRYPTO_COM_ROUTER_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/cryptoComRouter.json';
import { address as DYDX_SOLO_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/dydxSoloMargin.json';
import { address as SUSHISWAP_ROUTER_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/sushiswapRouter.json';
import { address as UNISWAP_V2_ROUTER_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/uniswapV2Router.json';
import { address as WETH_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/weth.json';

const deployFunc: DeployFunction = async function ({
  deployments: { deploy },
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  const { ownerAddress } = await getNamedAccounts();

  const gasNecessary = ethers.BigNumber.from('1362533');
  const gasLimit = ethers.BigNumber.from('1780000');

  const baseFee = ethers.BigNumber.from('72000000000');
  const maxPriorityFeePerGas = ethers.BigNumber.from('1500000000');
  const maxFeePerGas = baseFee.add(maxPriorityFeePerGas);

  console.log('Estimated cost', ethers.utils.formatUnits(gasNecessary.mul(maxFeePerGas), 'ether'));
  console.log('Max cost', ethers.utils.formatUnits(gasLimit.mul(maxFeePerGas), 'ether'));

  await deploy('Transactor', {
    from: ownerAddress,
    args: [
      WETH_MAINNET_ADDRESS,
      DYDX_SOLO_MAINNET_ADDRESS,
      UNISWAP_V2_ROUTER_MAINNET_ADDRESS,
      SUSHISWAP_ROUTER_MAINNET_ADDRESS,
      CRYPTO_COM_ROUTER_MAINNET_ADDRESS,
    ],
    gasLimit, // Roughly 30% more than the actual gas needed for the deployment (1362533)
    // Set these manually before doing any deployment to mainnet or rinkeby
    maxPriorityFeePerGas,
    maxFeePerGas,
    log: true,
  });
};

deployFunc.tags = ['Transactor'];

export default deployFunc;
