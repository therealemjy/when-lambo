import AWSWebsocketProvider from '@aws/web3-ws-provider';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import 'console.table';
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
import logPaths from './src/logPaths';
import getWorksheet from './src/utils/getWorksheet';
import sendSlackMessage, { formatErrorToSlackBlock } from './src/utils/sendSlackMessage';

const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;

global.isMonitoring = false;

const init = async () => {
  const worksheet = await getWorksheet();

  // Pull gas prices every 5 seconds
  gasPriceWatcher.updateEvery(5000);

  // Handle paths found
  eventEmitter.on('paths', (paths) => logPaths(paths, worksheet));

  // Handle errors
  eventEmitter.on('error', (error) => {
    // Format the error to a human-readable format and send it to slack
    const formattedError = formatErrorToSlackBlock(error, config.toToken.symbol);
    sendSlackMessage(formattedError, 'errors');
  });

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
      blockHandler(multicall, [
        uniswapV2ExchangeService,
        sushiswapExchangeService,
        kyberExchangeService,
        cryptoComExchangeService,
      ])
    );

    console.log('Price monitoring bot started.');

    // Regularly restart the bot so the websocket connection doesn't idle
    setTimeout(() => {
      console.log('Restarting bot...');

      // Shut down bot
      provider.removeAllListeners();

      start();
    }, THIRTY_MINUTES_IN_MILLISECONDS);
  };

  // Start bot
  start();
};

init();
