import logger from '@bot/src/bootstrap/logger';
import getSpreadsheet from '@bot/src/utils/getSpreadsheet';
import handleError from '@bot/src/utils/handleError';

import eventEmitter from '.';

export const registerEventListeners = async () => {
  const spreadsheet = await getSpreadsheet();

  // Handle paths found
  eventEmitter.on('paths', (blockNumber, paths) => {
    logger.paths(blockNumber, paths, spreadsheet);
  });

  // Handle errors
  eventEmitter.on('error', handleError);
};
