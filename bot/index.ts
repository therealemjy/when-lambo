import { Multicall } from '@maxime.julian/ethereum-multicall';
import config from '@config';

import blockHandler from './src/blockHandler';
import { bootstrap } from './src/bootstrap';
import getAwsWSProvider from './src/bootstrap/aws/getProvider';
import eventEmitter from './src/bootstrap/eventEmitter';
import logger from './src/bootstrap/logger';
import exchanges from './src/exchanges';
import handleError from './src/utils/handleError';
import CancelablePromise from './src/utils/cancelablePromise';

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

const init = async () => {
  const start = async () => {
    let isMonitoring = false;
    let cancelablePromise: CancelablePromise | undefined = undefined;

    const provider = getAwsWSProvider();
    // const ownerAccount = new ethers.Wallet(secrets.ownerAccountPrivateKey, provider);
    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

    provider.addListener('block', async (blockNumber: string) => {
      try {
        // Abort previous execution
        if (isMonitoring && cancelablePromise) {
          cancelablePromise.abort();
        }

        cancelablePromise = new CancelablePromise();
        isMonitoring = true;

        await cancelablePromise.wrap(
          blockHandler({
            blockNumber,
            multicall,
            strategies: config.strategies,
            exchanges,
          })
        );
      } catch (err: any) {
        // Means we intentionally cancelled the promise
        if (err.message === 'aborted') {
          logger.log(`--- Block ${blockNumber} cancelled ---`);
          return;
        }

        // Unwanted error
        throw err;
      } finally {
        isMonitoring = false;
      }
    });

    logger.log('Price monitoring bot started.');
  };

  // Start bot
  await start();
};

(async () => {
  try {
    await bootstrap();

    await init();
  } catch (err) {
    eventEmitter.emit('error', err);
    process.exit(1);
  }
})();
