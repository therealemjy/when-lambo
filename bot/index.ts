import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers } from 'ethers';

import blockHandler from './src/blockHandler';
import { bootstrap, Services } from './src/bootstrap';
import eventEmitter from './src/bootstrap/eventEmitter';
import CancelablePromise from './src/utils/cancelablePromise';
import handleError from './src/utils/handleError';

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

const init = async ({ services, provider }: { services: Services; provider: ethers.providers.Web3Provider }) => {
  const start = async () => {
    let isMonitoring = false;
    let cancelablePromise: CancelablePromise | undefined = undefined;

    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

    provider.addListener('block', async (blockNumber: string) => {
      services.logger.log(`New block received. Block # ${blockNumber}`);

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
    const { services, provider } = await bootstrap();

    await init({ services, provider });
  } catch (err) {
    eventEmitter.emit('error', err);
    process.exit(1);
  }
})();
