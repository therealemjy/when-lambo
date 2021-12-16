import { Multicall } from '@maxime.julian/ethereum-multicall';
import fs from 'fs';
import hre from 'hardhat';
import 'hardhat-deploy';

import { LoanAmounts } from '@localTypes';
import logger from '@logger';
import { address as MULTICALL_CONTRACT_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/multicall2.json';
import env from '@utils/env';

// @ts-ignore causes bug only on compilation for some reason, removing that would make the deployment fail
import { baseEnvs as prodBaseEnvs, tradedTokens as prodTradedTokens } from '@root/bot.config';

import { DIST_FOLDER_PATH } from '@scripts/constants';
import getTradedTokenAddresses from '@scripts/utils/getTradedTokenAddresses';

import exchanges from '@bot/src/exchanges';
import findBestTrade from '@bot/src/findBestTrade';

import gasEstimates from '@dist/gasEstimates.json';

import findLoanAmount from './findLoanAmount';

// @ts-ignore because this is the only JS file we are using in the project
const ethers = hre.ethers;

const tradedTokenAddresses = getTradedTokenAddresses(
  process.env.USE_PROD_ENV_VARIABLES ? prodTradedTokens.flat() : JSON.parse(env('STRINGIFIED_TRADED_TOKENS'))
);

const gasLimitMultiplicator = process.env.USE_PROD_ENV_VARIABLES
  ? prodBaseEnvs.GAS_LIMIT_MULTIPLICATOR
  : env('GAS_LIMIT_MULTIPLICATOR');

const slippageAllowancePercent = process.env.USE_PROD_ENV_VARIABLES
  ? prodBaseEnvs.SLIPPAGE_ALLOWANCE_PERCENT
  : env('SLIPPAGE_ALLOWANCE_PERCENT');

const LOAN_AMOUNTS_FILE_PATH = `${DIST_FOLDER_PATH}/loanAmounts.json`;

const fetchLoanAmounts = async () => {
  logger.log('Fetching loan amounts...');

  const loanAmounts: LoanAmounts = {};

  const multicall = new Multicall({
    multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
    ethersProvider: ethers.provider,
    tryAggregate: true,
  });

  // TODO: fetch gas fees
  const gasFees = {
    maxPriorityFeePerGas: 1,
    maxFeePerGas: 1,
  };

  const currentBlockNumber = await ethers.provider.getBlockNumber();

  // Find loan amount for each token
  for (let t = 0; t < tradedTokenAddresses.length; t++) {
    const tradedTokenAddress = tradedTokenAddresses[t];
    loanAmounts[tradedTokenAddress] = findLoanAmount({
      multicall,
      currentBlockNumber,
      tradedTokenAddress,
      slippageAllowancePercent,
      gasFees,
      gasLimitMultiplicator,
      gasEstimates,
      exchanges,
    });
  }

  // Create dist folder if it does not exist
  if (!fs.existsSync(DIST_FOLDER_PATH)) {
    fs.mkdirSync(DIST_FOLDER_PATH);
  }

  // Write loan amounts inside a JSON file
  fs.writeFileSync(LOAN_AMOUNTS_FILE_PATH, JSON.stringify(loanAmounts));

  logger.log('Loan amounts fetched successfully.');
  logger.log(loanAmounts);
};

// Note: we voluntarily don't catch errors so that execution stops if this
// script fails, as it is crucial for the loan amounts to have been fetched
// in order for the bot to work
fetchLoanAmounts().then(() => process.exit(0));
