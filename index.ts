import AWSWebsocketProvider from '@aws/web3-ws-provider';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers } from 'ethers';
import http from 'http';

import './@moduleAliases';
import blockHandler from './src/blockHandler';
import config from './src/config';
import eventEmitter from './src/eventEmitter';
import { registerEventListeners } from './src/eventEmitter/registerEvents';
import CryptoComExchange from './src/exchanges/cryptoCom';
import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import gasPriceWatcher from './src/gasPriceWatcher';
import { setupGlobalStateVariables } from './src/globalState';
import logger from './src/logger';
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
      new AWSWebsocketProvider(config.aws.wsRpcUrl, {
        clientConfig: {
          maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
          maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
          credentials: {
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey,
          },
          keepalive: true,
          keepaliveInterval: 60000, // ms
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
    const kyberExchangeService = new KyberExchange();

    provider.addListener(
      'block',
      blockHandler({
        multicall,
        exchanges: [uniswapV2ExchangeService, sushiswapExchangeService, kyberExchangeService, cryptoComExchangeService],
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

const server = http.createServer(function (req, res) {
  if (req.url === '/health') {
    if (!global.lastMonitoringDateTime) {
      res.writeHead(500);
      res.end('Monitoring not started yet');
      return;
    }

    const currentDateTime = new Date().getTime();
    const secondsElapsedSinceLastMonitoring = (currentDateTime - global.lastMonitoringDateTime) / 1000;

    if (secondsElapsedSinceLastMonitoring >= 60) {
      res.writeHead(500);
      res.end(`Last monitoring was more than 60 seconds ago (${secondsElapsedSinceLastMonitoring}s)`);
      return;
    }

    res.writeHead(200);
    res.end(`Last monitoring was ${secondsElapsedSinceLastMonitoring} seconds ago`);
  }
});

server.listen(3000, async () => {
  console.log(`Server running at port 3000.`);

  try {
    // Register event listeners
    await registerEventListeners();

    // Setup the global state
    setupGlobalStateVariables();

    // Pull gas prices every 5 seconds
    gasPriceWatcher.start(5000);

    await init();
  } catch (err) {
    eventEmitter.emit('error', err);
    process.exit(1);
  }
});
