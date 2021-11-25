import logger from '@src/bootstrap/logger';
import getSpreadsheet from '@src/utils/getSpreadsheet';
import handleError from '@src/utils/handleError';

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
