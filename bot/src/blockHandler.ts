import { Multicall } from '@maxime.julian/ethereum-multicall';

import config from '@bot/src/config';

import eventEmitter from './bootstrap/eventEmitter';
import logger from './bootstrap/logger';
import findBestPaths from './findBestPaths';
import { WETH } from './tokens';
import { Exchange, Strategy } from './types';
import registerExecutionTime from './utils/registerExecutionTime';

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
      fromTokenDecimalAmounts: strategy.borrowedWethAmounts,
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
    return paths;
  } catch (error: unknown) {
    eventEmitter.emit('error', error);
    return [];
  }
};

const blockHandler =
  ({ multicall, strategies, exchanges }: { multicall: Multicall; strategies: Strategy[]; exchanges: Exchange[] }) =>
  async (blockNumber: string) => {
    // Record time for perf monitoring
    global.botExecutionMonitoringTick = new Date().getTime();

    logger.log(`New block received. Block # ${blockNumber}`);

    if (global.isMonitoring) {
      logger.log('Block skipped! Price monitoring ongoing.');
    }

    // Check script isn't currently running
    if (global.isMonitoring) {
      return;
    }

    global.isMonitoring = true;

    // Execute all strategies simultaneously
    const paths = await Promise.all(
      strategies.map((strategy) =>
        executeStrategy({
          blockNumber,
          multicall,
          strategy,
          exchanges,
        })
      )
    );

    // Reset monitoring status so the script doesn't stop
    global.isMonitoring = false;
    registerExecutionTime();

    return paths.flat();
  };

export default blockHandler;
