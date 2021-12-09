import fs from 'fs';
import hre, { deployments } from 'hardhat';
import 'hardhat-deploy';

import { GasEstimates } from '@localTypes';
import logger from '@logger';
import env from '@utils/env';
import formatStrategies from '@utils/formatStrategies';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import wrapEth from '@chainHandler/utils/wrapEth';

import exchanges from '@bot/src/exchanges';

import prodStrategies from '../../strategies.json';

// @ts-ignore
const ethers = hre.ethers;

function getStrategies() {
  if (process.env.BEFORE_DEPLOY === 'true') {
    const mergedStrategies = prodStrategies.flat();
    return formatStrategies(mergedStrategies, +env('STRATEGY_BORROWED_AMOUNT_COUNT'));
  }

  return formatStrategies(JSON.parse(env('STRINGIFIED_STRATEGIES')), +env('STRATEGY_BORROWED_AMOUNT_COUNT'));
}

const DIST_FOLDER_PATH = `${process.cwd()}/dist`;
const SWAP_GAS_ESTIMATES_FILE_PATH = `${DIST_FOLDER_PATH}/gasEstimates.json`;

const strategies = formatStrategies(JSON.parse(env('STRINGIFIED_STRATEGIES')), +env('STRATEGY_BORROWED_AMOUNT_COUNT'));
const isProd = process.env.NODE_ENV === 'production';

const tokenAddresses = strategies.reduce((allTokenAddresses, formattedStrategy) => {
  if (allTokenAddresses.find((tokenAddress) => tokenAddress === formattedStrategy.toToken.address)) {
    return allTokenAddresses;
  }

  return [...allTokenAddresses, formattedStrategy.toToken.address];
}, [] as string[]);

const setup = deployments.createFixture(() => deployments.fixture());

const fetchGasEstimates = async () => {
  logger.log('Fetching gas estimates...');

  const gasEstimates: GasEstimates = {};

  // Because this script will only ever be run locally on Hardhat's local
  // network, we can use the test owner account as signer
  const testOwnerSigner = await ethers.getNamedSigner('ownerAddress');
  const testOwnerAddress = await testOwnerSigner.getAddress();
  const testAmountIn = ethers.utils.parseEther('1.0');

  for (let e = 0; e < exchanges.length; e++) {
    const exchange = exchanges[e];
    logger.log(`Exchange #${exchange.index}: ${exchange.name}`);

    for (let i = 0; i < tokenAddresses.length; i++) {
      const toTokenAddress = tokenAddresses[i];

      logger.log(`Token address: ${toTokenAddress}`);

      // Reset blockchain state
      await setup();

      // Wrap ETH to WETH on signer account
      await wrapEth(testOwnerSigner, testAmountIn, testOwnerAddress);

      const gasEstimate = await exchange.estimateGetDecimalAmountOut({
        signer: testOwnerSigner,
        amountIn: testAmountIn,
        toTokenAddress,
        isProd,
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

  // Execute test trade on Transactor contract (locally only)
  logger.log('Execute fake trade locally to estimate gas cost ');
  const TransactorContract: ITransactorContract = await ethers.getContract('Transactor', testOwnerSigner);

  // const transaction = await TransactorContract.trade(
  //   // This transaction should be mined at currentBlockNumber + 1, so passing currentBlockNumber should
  //   // trigger a revert
  //   currentBlockNumber,
  //   config.testProfitableTrade.wethAmountToBorrow,
  //   config.testProfitableTrade.sellingExchangeIndex,
  //   config.testProfitableTrade.tradedTokenAddress,
  //   config.testProfitableTrade.tradedTokenAmountOutMin,
  //   config.testProfitableTrade.buyingExchangeIndex,
  //   config.testProfitableTrade.wethAmountOutMin,
  //   new Date(new Date().getTime() + 120000).getTime() // Set a deadline to 2 minutes from now
  // )

  // Create dist folder if it does not exist
  if (!fs.existsSync(DIST_FOLDER_PATH)) {
    fs.mkdirSync(DIST_FOLDER_PATH);
  }

  // Write gas estimates inside a JSON file
  fs.writeFileSync(SWAP_GAS_ESTIMATES_FILE_PATH, JSON.stringify(gasEstimates));

  // Go through estimates and throw error if a token is only present on one
  // exchange. Note that we do this check after writing the gas estimates inside
  // the JSON file, so that the results can be analyzed even if an error is
  // thrown.
  tokenAddresses.forEach((tokenAddress) => {
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
