import { Signer } from 'ethers';

import handleError from '@bot/src/utils/handleError';

import eventEmitter from '.';
import executeTrade from './executeTrade';
import getSpreadsheet from './getSpreadsheet';
import getTransactorContract from './getTransactorContract';

export const registerEventListeners = async ({
  signer,
  gasLimitMultiplicator,
}: {
  signer: Signer;
  gasLimitMultiplicator: number;
}) => {
  const spreadsheet = await getSpreadsheet();
  const TransactorContract = getTransactorContract(signer);

  // Handle paths found
  eventEmitter.on('trade', async (blockNumber, path, gasPriceWei) => {
    await executeTrade({
      blockNumber,
      path,
      gasPriceWei,
      gasLimitMultiplicator,
      spreadsheet,
      TransactorContract,
    });
  });

  // Handle errors
  eventEmitter.on('error', handleError);
};
