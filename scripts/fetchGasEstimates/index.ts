import fs from 'fs';
import hre from 'hardhat';
import 'hardhat-deploy';

import localGasEstimates from '@dist/gasEstimates.json';
import { GasEstimates } from '@localTypes';
import logger from '@logger';
import env from '@utils/env';
import wrapEth from '@utils/wrapEth';

// @ts-ignore causes bug only on compilation for some reason, removing that would make the deployment fail
import { baseEnvs as prodBaseEnvs, tradedTokens as prodTradedTokens } from '@root/bot.config';
import { DIST_FOLDER_PATH } from '@scripts/constants';
import getTradedTokenAddresses from '@scripts/utils/getTradedTokenAddresses';

import exchanges from '@bot/src/exchanges';

// @ts-ignore because this is the only JS file we are using in the project
const ethers = hre.ethers;

const GAS_ESTIMATES_FILE_PATH = `${DIST_FOLDER_PATH}/gasEstimates.json`;
const isProd = process.env.NODE_ENV === 'production';
const tradedTokenAddresses = getTradedTokenAddresses(
  process.env.USE_PROD_ENV_VARIABLES ? prodTradedTokens.flat() : JSON.parse(env('STRINGIFIED_TRADED_TOKENS'))
);

const fetchGasEstimates = async () => {
  if (isProd) {
    throw new Error(
      'fetchGasEstimates script can only be called in non-production environments, as it sends real transactions to the node! Make sure to only run this script on a test/forked network only using fake ETH.'
    );
  }

  logger.log('Fetching gas estimates...');

  // Initialize with existing gas estimates
  const gasEstimates: GasEstimates = localGasEstimates;

  // Because this script will only ever be run locally on Hardhat's local
  // network, we can use the test owner account as signer
  const testOwnerSigner = await ethers.getNamedSigner('ownerAddress');
  const testOwnerAddress = await testOwnerSigner.getAddress();
  const testAmountIn = ethers.utils.parseEther('1.0');

  for (let e = 0; e < exchanges.length; e++) {
    const exchange = exchanges[e];
    logger.log(`Exchange #${exchange.index}: ${exchange.name}`);

    for (let i = 0; i < tradedTokenAddresses.length; i++) {
      const toTokenAddress = tradedTokenAddresses[i];

      logger.log(`Token address: ${toTokenAddress}`);

      let gasEstimate: string | undefined =
        gasEstimates[exchange.index] && gasEstimates[exchange.index][toTokenAddress];

      // Skip if an estimate already exists for this token on the exchange
      if (gasEstimates[exchange.index] && gasEstimates[exchange.index][toTokenAddress]) {
        logger.log(`Token skipped (estimate already exists)`);
      } else {
        // Wrap ETH to WETH on signer account
        await wrapEth(testOwnerSigner, testAmountIn, testOwnerAddress);

        const gasEstimateBN = await exchange.estimateGetDecimalAmountOut({
          signer: testOwnerSigner,
          amountIn: testAmountIn,
          toTokenAddress,
          isProd,
        });

        gasEstimate = gasEstimateBN?.toString();
      }

      if (gasEstimate) {
        gasEstimates[exchange.index] = {
          // Initialize exchange estimates if it has not been done yet
          ...(gasEstimates[exchange.index] || {}),
          [toTokenAddress]: gasEstimate.toString(),
        };
      }
    }
  }

  // Create dist folder if it does not exist
  if (!fs.existsSync(DIST_FOLDER_PATH)) {
    fs.mkdirSync(DIST_FOLDER_PATH);
  }

  // Write gas estimates inside a JSON file
  fs.writeFileSync(GAS_ESTIMATES_FILE_PATH, JSON.stringify(gasEstimates));

  // Go through estimates and throw error if a token is only present on one
  // exchange. Note that we do this check after writing the gas estimates inside
  // the JSON file, so that the results can be analyzed even if an error is
  // thrown.
  tradedTokenAddresses.forEach((tokenAddress) => {
    let exchangeCount = 0;

    Object.keys(gasEstimates)
      .filter((key) => Object.prototype.hasOwnProperty.call(gasEstimates, key))
      .forEach((exchangeIndex) => {
        if (Object.prototype.hasOwnProperty.call(gasEstimates[+exchangeIndex], tokenAddress)) {
          exchangeCount++;
        }
      });

    if (exchangeCount < 2) {
      throw new Error(
        `Token with address ${tokenAddress} is only present on one exchange, meaning we can't trade it and so it should be removed from the strategies.`
      );
    }
  });

  logger.log('Gas estimates fetched successfully.');
  logger.log(gasEstimates);
};

// Note: we voluntarily don't catch errors so that execution stops if this
// script fails, as it is crucial for the estimates to have been fetched in
// order for the bot to work
fetchGasEstimates().then(() => process.exit(0));
