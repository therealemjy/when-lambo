import { Multicall } from '@maxime.julian/ethereum-multicall';

import config from '@config';

import logger from '@logger';

import blockHandler from './src/blockHandler';
import { bootstrap } from './src/bootstrap';
import getAwsWSProvider from './src/bootstrap/aws/getProvider';
import eventEmitter from './src/bootstrap/eventEmitter';
import exchanges from './src/exchanges';
import handleError from './src/utils/handleError';

// const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

const init = async () => {
  const start = async () => {
    const provider = getAwsWSProvider();
    // const ownerAccount = new ethers.Wallet(secrets.ownerAccountPrivateKey, provider);
    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

    // Instantiate exchange services
    provider.addListener(
      'block',
      blockHandler({
        multicall,
        strategies: config.strategies,
        exchanges,
      })
    );

    logger.log('Price monitoring bot started.');

    // // Regularly restart the bot so the websocket connection doesn't idle
    // setTimeout(() => {
    //   logger.log('Restarting bot...');

    //   // Shut down bot
    //   provider.removeAllListeners();

    //   start();
    // }, THIRTY_MINUTES_IN_MILLISECONDS);
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
