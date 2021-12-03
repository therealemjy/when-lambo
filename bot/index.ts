import { Multicall } from '@maxime.julian/ethereum-multicall';
import ethers from 'ethers';

import config from './src/config';
import blockHandler from './src/blockHandler';
import { bootstrap } from './src/bootstrap';
import getAwsWSProvider from './src/bootstrap/aws/getProvider';
import eventEmitter from './src/bootstrap/eventEmitter';
import { WLSecrets } from './src/bootstrap/fetchSecrets';
import logger from './src/bootstrap/logger';
import { EstimateTransaction } from './src/exchanges/types';
import CryptoComExchange from './src/exchanges/cryptoCom';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import handleError from './src/utils/handleError';

// const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  handleError(error, true);
  process.exit(1);
});

const init = async (secrets: WLSecrets) => {
  const start = async () => {
    const provider = getAwsWSProvider();
    const ownerAccount = new ethers.Wallet(secrets.ownerAccountPrivateKey, provider);
    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

    // Instantiate exchange services
    const uniswapV2ExchangeService = new UniswapV2Exchange();
    const sushiswapExchangeService = new SushiswapExchange();
    const cryptoComExchangeService = new CryptoComExchange();

    // Extract estimate transactions from strategies
    const estimateTransactions = config.strategies.reduce((allEstimateTransactions, strategy) => {
      // Skip if we already have an estimate transaction for the toToken in the strategy
      if (
        allEstimateTransactions.find(
          (estimateTransaction) => estimateTransaction.toToken.address === strategy.toToken.address
        )
      ) {
        return allEstimateTransactions;
      }

      return [
        ...allEstimateTransactions,
        {
          // We only need to check for one amount in order to get an estimate
          wethDecimalAmount: strategy.borrowedWethAmounts[0],
          toToken: strategy.toToken,
        },
      ];
    }, [] as EstimateTransaction[]);

    const initArgs = { estimateTransactions, signer: ownerAccount };
    await Promise.all([
      uniswapV2ExchangeService.initialize(initArgs),
      sushiswapExchangeService.initialize(initArgs),
      cryptoComExchangeService.initialize(initArgs),
    ]);

    provider.addListener(
      'block',
      blockHandler({
        multicall,
        strategies: config.strategies,
        exchanges: [uniswapV2ExchangeService, sushiswapExchangeService, cryptoComExchangeService],
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
    const secrets = await bootstrap();

    await init(secrets);
  } catch (err) {
    eventEmitter.emit('error', err);
    process.exit(1);
  }
})();
