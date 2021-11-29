import AWSWebsocketProvider from '@aws/web3-ws-provider';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers } from 'ethers';

import './@moduleAliases';
import blockHandler from './src/blockHandler';
import { bootstrap } from './src/bootstrap';
import config from './src/bootstrap/config';
import eventEmitter from './src/bootstrap/eventEmitter';
import logger from './src/bootstrap/logger';
import CryptoComExchange from './src/exchanges/cryptoCom';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import handleError from './src/utils/handleError';

const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

const init = async () => {
  const start = () => {
    const provider = new ethers.providers.Web3Provider(
      new AWSWebsocketProvider(config.aws.mainnetWssRpcUrl, {
        clientConfig: {
          maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
          maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
          keepalive: true,
          keepaliveInterval: 60000, // ms
          credentials: {
            accessKeyId: config.aws.accessKeyIdEthNode,
            secretAccessKey: config.aws.secretAccessKeyEthNode,
          },
          // Enable auto reconnection
          reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: 5,
            onTimeout: false,
          },
        },
      })
    );

    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

    // Instantiate exchange services
    const uniswapV2ExchangeService = new UniswapV2Exchange();
    const sushiswapExchangeService = new SushiswapExchange();
    const cryptoComExchangeService = new CryptoComExchange();

    provider.addListener(
      'block',
      blockHandler({
        multicall,
        exchanges: [uniswapV2ExchangeService, sushiswapExchangeService, cryptoComExchangeService],
      })
    );

    logger.log('Price monitoring bot started.');

    // Regularly restart the bot so the websocket connection doesn't idle
    setTimeout(() => {
      logger.log('Restarting bot...');

      // Shut down bot
      provider.removeAllListeners();

      start();
    }, THIRTY_MINUTES_IN_MILLISECONDS);
  };

  // Start bot
  start();
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
