import { Multicall } from '@maxime.julian/ethereum-multicall';

import config from '@src/config';

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

    // Reset monitoring status so the script doesn't stop
    global.isMonitoring = false;
    registerExecutionTime();
  };

export default blockHandler;
