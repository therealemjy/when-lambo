import { Multicall } from '@maxime.julian/ethereum-multicall';
import TypedEmitter from 'typed-emitter';

import { Strategy, GasEstimates, EnvConfig } from '@config';

import { State } from './bootstrap';
import { MessageEvents } from './bootstrap/eventEmitter';
import findBestPaths from './findBestPaths';
import { WETH } from './tokens';
import { Exchange } from './types';
import registerExecutionTime from './utils/registerExecutionTime';

const executeStrategy = async ({
  blockNumber,
  multicall,
  strategy,
  exchanges,
  gasEstimates,
  state,
  eventEmitter,
  config,
}: {
  blockNumber: string;
  multicall: Multicall;
  strategy: Strategy;
  exchanges: Exchange[];
  gasEstimates: GasEstimates;
  state: State;
  eventEmitter: TypedEmitter<MessageEvents>;
  config: EnvConfig;
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
      gasEstimates,
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
  gasEstimates,
  state,
  eventEmitter,
  config,
}: {
  multicall: Multicall;
  strategies: Strategy[];
  exchanges: Exchange[];
  blockNumber: string;
  gasEstimates: GasEstimates;
  state: State;
  eventEmitter: TypedEmitter<MessageEvents>;
  config: EnvConfig;
}) => {
  // Record time for perf monitoring
  state.botExecutionMonitoringTick = new Date().getTime();

  // Execute all strategies simultaneously
  const paths = await Promise.all(
    strategies.map((strategy) =>
      executeStrategy({
        blockNumber,
        multicall,
        strategy,
        exchanges,
        gasEstimates,
        state,
        eventEmitter,
        config,
      })
    )
  );

  registerExecutionTime(state);

  return paths.flat();
};

export default blockHandler;
