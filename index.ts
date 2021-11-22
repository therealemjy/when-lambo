import AWSWebsocketProvider from '@aws/web3-ws-provider';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers } from 'ethers';

import './@moduleAliases';
import blockHandler from './src/blockHandler';
import config from './src/config';
import eventEmitter from './src/eventEmitter';
import CryptoComExchange from './src/exchanges/cryptoCom';
import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import gasPriceWatcher from './src/gasPriceWatcher';
import logger from './src/logger';
import getSpreadsheet from './src/utils/getSpreadsheet';
import handleError from './src/utils/handleError';

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

global.isMonitoring = false;

const init = async () => {
  try {
    const spreadsheet = await getSpreadsheet();

    // Pull gas prices every 5 seconds
    gasPriceWatcher.start(5000);

    // Handle paths found
    eventEmitter.on('paths', (paths) => logger.paths(paths, spreadsheet));

    // Handle errors
    eventEmitter.on('error', handleError);

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
          exchanges: [
            uniswapV2ExchangeService,
            sushiswapExchangeService,
            kyberExchangeService,
            cryptoComExchangeService,
          ],
        })
      );

      logger.log('Price monitoring bot started.');
    };

    // Start bot
    start();
  } catch (error: unknown) {
    handleError(error);
  }
};

init();
