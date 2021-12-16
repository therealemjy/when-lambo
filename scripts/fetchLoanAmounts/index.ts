import { Multicall } from '@maxime.julian/ethereum-multicall';
import fs from 'fs';
import hre from 'hardhat';
import 'hardhat-deploy';

import gasEstimates from '@dist/gasEstimates.json';
import { LoanAmounts, Token, ParsedTradedToken } from '@localTypes';
import logger from '@logger';
import { address as MULTICALL_CONTRACT_MAINNET_ADDRESS } from '@resources/thirdPartyContracts/mainnet/multicall2.json';
import env from '@utils/env';

// @ts-ignore causes bug only on compilation for some reason, removing that would make the deployment fail
import { baseEnvs as prodBotBaseEnvs, tradedTokens as prodTradedTokens } from '@root/bot.config';
// @ts-ignore causes bug only on compilation for some reason, removing that would make the deployment fail
import { baseEnvs as prodCommunicatorEnvs } from '@root/communicator.config';
import { DIST_FOLDER_PATH } from '@scripts/constants';

import GasFeesWatcher from '@communicator/GasFeesWatcher';

import exchanges from '@bot/src/exchanges';

import findLoanAmount from './findLoanAmount';

// @ts-ignore because this is the only JS file we are using in the project
const ethers = hre.ethers;

const unformattedTokens = (
  process.env.USE_PROD_ENV_VARIABLES ? prodTradedTokens.flat() : JSON.parse(env('STRINGIFIED_TRADED_TOKENS'))
) as ParsedTradedToken[];

const tradedTokens: Token[] = unformattedTokens.map((parsedTradedToken) => ({
  address: parsedTradedToken.ADDRESS,
  symbol: parsedTradedToken.SYMBOL,
  decimals: +parsedTradedToken.DECIMALS,
}));

const gasLimitMultiplicator = process.env.USE_PROD_ENV_VARIABLES
  ? prodBotBaseEnvs.GAS_LIMIT_MULTIPLICATOR
  : env('GAS_LIMIT_MULTIPLICATOR');

const slippageAllowancePercent = process.env.USE_PROD_ENV_VARIABLES
  ? prodBotBaseEnvs.SLIPPAGE_ALLOWANCE_PERCENT
  : env('SLIPPAGE_ALLOWANCE_PERCENT');

const maxPriorityFeePerGasMultiplicator = process.env.USE_PROD_ENV_VARIABLES
  ? prodCommunicatorEnvs.MAX_PRIORITY_FEE_PER_GAS_MULTIPLICATOR
  : env('MAX_PRIORITY_FEE_PER_GAS_MULTIPLICATOR');

const LOAN_AMOUNTS_FILE_PATH = `${DIST_FOLDER_PATH}/loanAmounts.json`;

const blocknativeApiKey = env('BLOCKNATIVE_API_KEY_SCRIPTS');

const gasFeesWatcher = new GasFeesWatcher(blocknativeApiKey, maxPriorityFeePerGasMultiplicator);

const fetchLoanAmounts = async () => {
  logger.log('Fetching loan amounts...');

  const loanAmounts: LoanAmounts = {};

  const multicall = new Multicall({
    multicallCustomContractAddress: MULTICALL_CONTRACT_MAINNET_ADDRESS,
    ethersProvider: ethers.provider,
    tryAggregate: true,
  });

  const gasFees = await gasFeesWatcher.getGasFees();
  const currentBlockNumber = await ethers.provider.getBlockNumber();

  // Find loan amount for each token
  for (let t = 0; t < tradedTokens.length; t++) {
    const tradedToken = tradedTokens[t];

    logger.log(`Searching for best loan amount for ${tradedToken.symbol} token`);

    loanAmounts[tradedToken.address] = await findLoanAmount({
      multicall,
      currentBlockNumber,
      tradedToken,
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
