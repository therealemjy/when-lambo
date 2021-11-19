import { Multicall } from '@maxime.julian/ethereum-multicall';

import config from './config';
import eventEmitter from './eventEmitter';
import findBestPaths from './findBestPaths';
import logger from './logger';
import { WETH } from './tokens';
import { Exchange, Strategy } from './types';

const executeStrategy = async ({
  multicall,
  strategy,
  exchanges,
}: {
  multicall: Multicall;
  strategy: Strategy;
  exchanges: Exchange[];
}) => {
  try {
    const paths = await findBestPaths({
      multicall,
      fromTokenDecimalAmounts: strategy.borrowedAmounts,
      fromToken: WETH,
      toToken: {
        symbol: strategy.toToken.symbol,
        address: strategy.toToken.address,
        decimals: strategy.toToken.decimals,
      },
      exchanges,
      slippageAllowancePercent: config.slippageAllowancePercent,
      gasPriceWei: global.currentGasPrices.rapid,
    });

    eventEmitter.emit('paths', paths);
  } catch (error: unknown) {
    eventEmitter.emit('error', error);
  }
};

const blockHandler =
  ({ multicall, exchanges }: { multicall: Multicall; exchanges: Exchange[] }) =>
  async (blockNumber: string) => {
    if (config.isDev) {
      logger.log(`New block received. Block # ${blockNumber}`);
    }

    if (global.isMonitoring && config.isDev) {
      logger.log('Block skipped! Price monitoring ongoing.');
    } else if (config.isDev) {
      console.time('monitorPrices');
    }

    // Check script isn't currently running
    if (global.isMonitoring) {
      return;
    }

    global.isMonitoring = true;

    // Execute all strategies simultaneously
    await Promise.all(
      config.strategies.map((strategy) =>
        executeStrategy({
          multicall,
          strategy,
          exchanges,
        })
      )
    );

    if (config.isDev) {
      console.timeEnd('monitorPrices');
    }

    // Reset monitoring status so the script doesn't stop
    global.isMonitoring = false;
  };

export default blockHandler;
