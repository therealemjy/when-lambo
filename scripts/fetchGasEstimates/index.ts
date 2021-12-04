import fs from 'fs';
import hre, { deployments } from 'hardhat';
import 'hardhat-deploy';

import config from '@config';
import { DIST_FOLDER_PATH, SWAP_GAS_ESTIMATES_FILE_PATH } from '@constants';
import { GasEstimates } from '@localTypes';
import logger from '@logger';

import wrapEth from '@chainHandler/utils/wrapEth';

import exchanges from '@bot/src/exchanges';

// @ts-ignore
const ethers = hre.ethers;

const tokenAddresses = config.strategies.reduce((allTokenAddresses, formattedStrategy) => {
  if (allTokenAddresses.find((tokenAddress) => tokenAddress === formattedStrategy.toToken.address)) {
    return allTokenAddresses;
  }

  return [...allTokenAddresses, formattedStrategy.toToken.address];
}, [] as string[]);

const setup = deployments.createFixture(() => deployments.fixture());

const fetchGasEstimates = async () => {
  logger.log('Fetching gas estimates...');

  const gasEstimates: GasEstimates = {};

  // Because this script will only ever be run locally on Hardhat's local network, we can use
  // the test owner account as signer
  const testOwner = await ethers.getNamedSigner('ownerAddress');
  const testOwnerAddress = await testOwner.getAddress();
  const testAmountIn = ethers.utils.parseEther('1.0');

  for (let e = 0; e < exchanges.length; e++) {
    const exchange = exchanges[e];

    for (let i = 0; i < tokenAddresses.length; i++) {
      const toTokenAddress = tokenAddresses[i];

      // Reset blockchain state
      await setup();

      // Wrap ETH to WETH on signer account
      await wrapEth(testOwner, testAmountIn, testOwnerAddress);

      const gasEstimate = await exchange.estimateGetDecimalAmountOut({
        signer: testOwner,
        amountIn: testAmountIn,
        toTokenAddress,
      });

      // Initialize exchange estimates if it has not been done yet
      if (!gasEstimates[exchange.index]) {
        gasEstimates[exchange.index] = {};
      }

      if (gasEstimate) {
        gasEstimates[exchange.index][toTokenAddress] = gasEstimate.toString();
      }
    }
  }

  // Create dist folder if it does not exist
  if (!fs.existsSync(DIST_FOLDER_PATH)) {
    fs.mkdirSync(DIST_FOLDER_PATH);
  }

  // Write gas estimates inside a JSON file
  fs.writeFileSync(SWAP_GAS_ESTIMATES_FILE_PATH, JSON.stringify(gasEstimates));

  logger.log('Gas estimates fetched successfully.');
  logger.log(gasEstimates);
};

// Note: we voluntarily don't catch errors so that execution stops if this script fails, as
// it is crucial for the estimates to have been fetched in order for the bot to work
fetchGasEstimates().then(() => process.exit(0));
