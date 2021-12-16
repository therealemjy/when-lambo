import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import logger from '@logger';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import blockHandler from './src/blockHandler';
import { bootstrap } from './src/bootstrap';
import eventEmitter from './src/eventEmitter';
import { Services } from './src/types';
import CancelablePromise from './src/utils/cancelablePromise';

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});

// Handle errors
eventEmitter.on('error', logger.error);

const init = async ({
  services,
  provider,
  TransactorContract,
  spreadsheet,
  multicall,
}: {
  services: Services;
  provider: ethers.providers.Web3Provider;
  TransactorContract: ITransactorContract;
  spreadsheet: GoogleSpreadsheet;
  multicall: Multicall;
}) => {
  const start = async () => {
    let isMonitoring = false;
    let hasPassedFirstBlock = false;
    let cancelablePromise: CancelablePromise | undefined = undefined;

    provider.addListener('block', async (blockNumber: number) => {
      // Skip first block to avoid potential expired deals
      if (!hasPassedFirstBlock) {
        hasPassedFirstBlock = true;
        return;
      }

      services.logger.log(`New block: #${blockNumber}`);

      if (!services.state.isMonitoringActivated) {
        services.logger.log(`Block skipped: #${blockNumber} (monitoring is deactivated)`);
        return;
      }

      // Abort previous execution
      if (isMonitoring && cancelablePromise) {
        cancelablePromise.abort();
      }

      cancelablePromise = new CancelablePromise();
      isMonitoring = true;

      try {
        await cancelablePromise.wrap(
          blockHandler(services, {
            blockNumber,
            multicall,
            TransactorContract,
            spreadsheet,
          })
        );
      } catch (err: any) {
        // Means we intentionally cancelled the promise
        if (err.message === 'aborted') {
          services.logger.log(`Block cancelled: #${blockNumber}`);
          return;
        }

        // Unwanted error
        throw err;
      } finally {
        isMonitoring = false;
      }
    });

    services.logger.log('Price monitoring bot started.');
  };

  // Start bot
  await start();
};

(async () => {
  try {
    const res = await bootstrap();
    await init(res);
  } catch (err) {
    eventEmitter.emit('error', err);
    process.exit(1);
  }
})();
