import { GoogleSpreadsheet } from 'google-spreadsheet';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers } from 'ethers';
import * as Sentry from '@sentry/node';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import blockHandler from './src/blockHandler';
import { bootstrap, Services } from './src/bootstrap';
import eventEmitter from './src/eventEmitter';
import CancelablePromise from './src/utils/cancelablePromise';
import handleError from './src/utils/handleError';
import botConfig from './config';

Sentry.init({
  dsn: botConfig.sentryDNS,
});

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

// Handle errors
eventEmitter.on('error', handleError);

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
    let cancelablePromise: CancelablePromise | undefined = undefined;

    provider.addListener('block', async (blockNumber: number) => {
      services.logger.log(`New block received. Block # ${blockNumber}`);

      if (!services.state.monitoringActivated) {
        services.logger.log(`--- Block skipped, monitoring not activated ---`);
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
          services.logger.log(`--- Block ${blockNumber} cancelled ---`);
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
