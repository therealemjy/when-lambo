import fs from 'fs';
import hre, { deployments } from 'hardhat';
import 'hardhat-deploy';

import { LoanAmounts } from '@localTypes';
import logger from '@logger';

import { DIST_FOLDER_PATH } from '@scripts/constants';
import getTradedTokenAddresses from '@scripts/utils/getTradedTokenAddresses';

import exchanges from '@bot/src/exchanges';

// @ts-ignore because this is the only JS file we are using in the project
const ethers = hre.ethers;

const LOAN_AMOUNTS_FILE_PATH = `${DIST_FOLDER_PATH}/loanAmounts.json`;
const isProd = process.env.NODE_ENV === 'production';
const tradedTokenAddresses = getTradedTokenAddresses(!!process.env.USE_PROD_TRADED_TOKENS);

const setup = deployments.createFixture(() => deployments.fixture());

const fetchLoanAmounts = async () => {
  if (isProd) {
    throw new Error(
      'fetchLoanAmounts script can only be called in non-production environments, as it sends real transactions to the node! Make sure to only run this script on a test/forked network only using fake ETH.'
    );
  }

  logger.log('Fetching loan amounts...');

  // Because this script will only ever be run locally on Hardhat's local
  // network, we can use the test owner account as signer
  const testOwnerSigner = await ethers.getNamedSigner('ownerAddress');
  const testOwnerAddress = await testOwnerSigner.getAddress();

  let loanAmounts: LoanAmounts = {};

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
