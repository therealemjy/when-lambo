import { Multicall } from '@maxime.julian/ethereum-multicall';

import config from './bootstrap/config';
import eventEmitter from './bootstrap/eventEmitter';
import logger from './bootstrap/logger';
import findBestPaths from './findBestPaths';
import { WETH } from './tokens';
import { Exchange, Strategy } from './types';

const executeStrategy = async ({
  blockNumber,
  multicall,
  strategy,
  exchanges,
}: {
  blockNumber: string;
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

    eventEmitter.emit('paths', blockNumber, paths);
  } catch (error: unknown) {
    eventEmitter.emit('error', error);
  }
};

const blockHandler =
  ({ multicall, exchanges }: { multicall: Multicall; exchanges: Exchange[] }) =>
  async (blockNumber: string) => {
    logger.log(`New block received. Block # ${blockNumber}`);

    if (global.isMonitoring) {
      logger.log('Block skipped! Price monitoring ongoing.');
    }

    // Check script isn't currently running
    if (global.isMonitoring) {
      return;
    }

    global.isMonitoring = true;

    if (config.isDev) {
      console.time('monitorPrices');
    }

    // Execute all strategies simultaneously
    await Promise.all(
      config.strategies.map((strategy) =>
        executeStrategy({
          blockNumber,
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
    global.lastMonitoringDateTime = new Date().getTime();
  };

export default blockHandler;