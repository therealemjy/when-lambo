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
import formatError from './src/utils/formatError';
import getWorksheet from './src/utils/getWorksheet';
import sendSlackMessage, { formatErrorToSlackBlock } from './src/utils/sendSlackMessage';

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;

global.isMonitoring = false;

const handleError = (error: unknown, isUncaughtException = false) => {
  // Format the error to a human-readable format and send it to slack
  const formattedError = formatError(error);
  logger.error(isUncaughtException ? 'Uncaught exception:' : 'Emitted error:', formattedError);

  if (config.isProd) {
    const slackBlock = formatErrorToSlackBlock(formattedError, config.serverId);
    sendSlackMessage(slackBlock, 'errors');
  }
};

const init = async () => {
  try {
    const worksheets = await Promise.all(
      config.strategies.map((strategy) => getWorksheet(strategy.googleSpreadSheetId))
    );

    // Pull gas prices every 5 seconds
    gasPriceWatcher.updateEvery(5000);

    // Handle paths found
    eventEmitter.on('paths', (paths, worksheet) => logger.paths(paths, worksheet));

    // Handle errors
    eventEmitter.on('error', handleError);

    const start = () => {
      const provider = new ethers.providers.Web3Provider(
        new AWSWebsocketProvider(config.aws.wsRpcUrl, {
          clientConfig: {
            credentials: {
              accessKeyId: config.aws.accessKeyId,
              secretAccessKey: config.aws.secretAccessKey,
            },
          },
        })
      );

      const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

      // Instantiate exchange services
      const uniswapV2ExchangeService = new UniswapV2Exchange();
      const sushiswapExchangeService = new SushiswapExchange();
      const kyberExchangeService = new KyberExchange();
      const cryptoComExchangeService = new CryptoComExchange();

      provider.addListener(
        'block',
        blockHandler({
          multicall,
          worksheets,
          exchanges: [
            uniswapV2ExchangeService,
            sushiswapExchangeService,
            kyberExchangeService,
            cryptoComExchangeService,
          ],
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
  } catch (error: unknown) {
    handleError(error);
  }
};

init();
