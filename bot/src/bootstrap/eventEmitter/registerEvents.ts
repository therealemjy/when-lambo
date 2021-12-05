import { Signer } from 'ethers';

import handleError from '@bot/src/utils/handleError';

import eventEmitter from '.';
import executeTrade from './executeTrade';
import getSpreadsheet from './getSpreadsheet';
import getTransactorContract from './getTransactorContract';

export const registerEventListeners = async (signer: Signer) => {
  const spreadsheet = await getSpreadsheet();
  const TransactorContract = getTransactorContract(signer);

  // Handle paths found
  eventEmitter.on('trade', (blockNumber, path) =>
    executeTrade({
      blockNumber,
      path,
      spreadsheet,
      TransactorContract,
    })
  );

  // Handle errors
  eventEmitter.on('error', handleError);
};
