import logger from '@logger';

import getSpreadsheet from '@bot/src/utils/getSpreadsheet';
import handleError from '@bot/src/utils/handleError';

import eventEmitter from '.';

export const registerEventListeners = async () => {
  const spreadsheet = await getSpreadsheet();

  // Handle paths found
  eventEmitter.on('trade', (blockNumber, path) => {
    // TODO: execute trade

    logger.path(blockNumber, path, spreadsheet);
  });

  // Handle errors
  eventEmitter.on('error', handleError);
};
