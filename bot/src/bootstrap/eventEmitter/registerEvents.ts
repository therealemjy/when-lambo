import { Signer } from 'ethers';

import logger from '@logger';

import handleError from '@bot/src/utils/handleError';

import eventEmitter from '.';
import getSpreadsheet from './getSpreadsheet';
import getTransactorContract from './getTransactorContract';

export const registerEventListeners = async (signer: Signer) => {
  const spreadsheet = await getSpreadsheet();
  const TransactorContract = getTransactorContract(signer);

  console.log(TransactorContract);

  // Handle paths found
  eventEmitter.on('trade', async (blockNumber, path) => {
    // TODO: call contract

    logger.path(blockNumber, path, spreadsheet);
  });

  // Handle errors
  eventEmitter.on('error', handleError);
};
