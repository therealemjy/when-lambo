import logger from '@logger';

import { Services } from '@bot/src/bootstrap';
import { Path } from '@bot/src/types';
import getSpreadsheet from '@bot/src/utils/getSpreadsheet';
import handleError from '@bot/src/utils/handleError';

import eventEmitter from '.';
import getProfitablePaths from './getProfitablePaths';

export const registerEventListeners = async ({ config }: Services) => {
  const spreadsheet = await getSpreadsheet();

  // Handle paths found
  eventEmitter.on('paths', (blockNumber, paths) => {
    let filteredPaths: Path[] = paths;

    // Only handle profitable paths in production
    if (config.isProd) {
      filteredPaths = getProfitablePaths(paths);
    }

    if (filteredPaths.length > 0) {
      // TODO: execute trades

      logger.paths(blockNumber, filteredPaths, spreadsheet);
    }
  });

  // Handle errors
  eventEmitter.on('error', handleError);
};
