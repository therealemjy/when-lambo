import fs from 'fs';
import hre, { deployments } from 'hardhat';
import 'hardhat-deploy';

import config from '@config';

import wrapEth from '@chainHandler/utils/wrapEth';

import exchanges from '@bot/src/exchanges';
import { Token } from '@bot/src/types';

// @ts-ignore
const ethers = hre.ethers;

const tokens = config.strategies.reduce((allTokens, formattedStrategy) => {
  if (allTokens.find((token) => token.address === formattedStrategy.toToken.address)) {
    return allTokens;
  }

  return [...allTokens, formattedStrategy.toToken];
}, [] as Token[]);

const gasEstimates: {
  [exchangeIndex: number]: {
    [tokenAddress: string]: string;
  };
} = {};

const setup = deployments.createFixture(() => deployments.fixture());

const fetchGasEstimates = async () => {
  console.log('Fetching gas estimates...');

  // Because this script will only ever be run locally on Hardhat's local network, we can use
  // the test owner account as signer
  const testOwner = await ethers.getNamedSigner('ownerAddress');
  const testOwnerAddress = await testOwner.getAddress();
  const testAmountIn = ethers.utils.parseEther('1.0');

  for (let e = 0; e < exchanges.length; e++) {
    const exchange = exchanges[e];
    const exchangeGasEstimates: {
      [swap: string]: string;
    } = {};

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Reset blockchain state
      await setup();

      throw new Error('EXECUTION SHOULD STOP');

      // Wrap ETH to WETH on signer account
      await wrapEth(testOwner, testAmountIn, testOwnerAddress);

      const gasEstimate = await exchange.estimateGetDecimalAmountOut({
        signer: testOwner,
        amountIn: testAmountIn,
        toTokenAddress: token.address,
      });

      // Initialize exchange estimates if it has not been done yet
      if (!gasEstimates[exchange.index]) {
        gasEstimates[exchange.index] = {};
      }

      if (gasEstimate) {
        gasEstimates[exchange.index][token.address] = gasEstimate.toString();
      }

      exchangeGasEstimates[`WETH -> ${token.symbol}`] = gasEstimate ? gasEstimate.toString() : 'N/A';
    }
  }

  console.log('Gas estimates fetched successfully.');
  console.log(gasEstimates);
};

// Note: we voluntarily don't catch errors so that the server is automatically stopped if
// this execution fails
fetchGasEstimates().then(() => process.exit(0));
