import { Multicall } from '@maxime.julian/ethereum-multicall';

import config from '@config';
import { Strategy } from '@config';

import eventEmitter from './bootstrap/eventEmitter';
import logger from './bootstrap/logger';
import findBestPaths from './findBestPaths';
import { WETH } from './tokens';
import { Exchange } from './types';
import registerExecutionTime from './utils/registerExecutionTime';
import { State } from './bootstrap';

const executeStrategy = async ({
  blockNumber,
  multicall,
  strategy,
  exchanges,
  state,
}: {
  blockNumber: string;
  multicall: Multicall;
  strategy: Strategy;
  exchanges: Exchange[];
  state: State;
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
      gasPriceWei: state.currentGasPrices.rapid,
    });

    eventEmitter.emit('paths', blockNumber, paths);
    return paths;
  } catch (error: unknown) {
    eventEmitter.emit('error', error);
    return [];
  }
};

const blockHandler = async ({
  multicall,
  strategies,
  exchanges,
  blockNumber,
  state,
}: {
  multicall: Multicall;
  strategies: Strategy[];
  exchanges: Exchange[];
  blockNumber: string;
  state: State;
}) => {
  // Record time for perf monitoring
  state.botExecutionMonitoringTick = new Date().getTime();

  logger.log(`New block received. Block # ${blockNumber}`);

  // Execute all strategies simultaneously
  const paths = await Promise.all(
    strategies.map((strategy) =>
      executeStrategy({
        blockNumber,
        multicall,
        strategy,
        exchanges,
        state,
      })
    )
  );

  registerExecutionTime(state);

  return paths.flat();
};

export default blockHandler;
