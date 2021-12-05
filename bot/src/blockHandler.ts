import { Multicall } from '@maxime.julian/ethereum-multicall';

import { Strategy } from '@localTypes';

import { Services } from './bootstrap';
import findBestPaths from './findBestPaths';
import getMostProfitablePath from './getMostProfitablePath';
import { WETH } from './tokens';
import registerExecutionTime from './utils/registerExecutionTime';

type ExecuteStrategyArgs = {
  blockNumber: string;
  multicall: Multicall;
  strategy: Strategy;
};

type BlockHandlerArgs = {
  multicall: Multicall;
  blockNumber: string;
};

const executeStrategy = async (services: Services, { blockNumber, multicall, strategy }: ExecuteStrategyArgs) => {
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
      exchanges: services.exchanges,
      slippageAllowancePercent: services.config.slippageAllowancePercent,
      gasEstimates: services.config.gasEstimates,
      gasPriceWei: services.state.currentGasPrices.rapid,
    });

    // Get the most profitable paths, if any of them is considered profitable
    const mostProfitablePath = getMostProfitablePath(
      paths,
      services.config.gasLimitMultiplicator,
      services.config.gasCostMaximumThresholdWei
    );

    if (mostProfitablePath) {
      // Handler will take care of the trade
      services.eventEmitter.emit('trade', blockNumber, mostProfitablePath);

      // We deactivate the bot while the trade is ongoing
      services.state.monitoringActivated = false;
    }
  } catch (error: unknown) {
    services.eventEmitter.emit('error', error);
  }
};

const blockHandler = async (services: Services, { multicall, blockNumber }: BlockHandlerArgs) => {
  // Record time for perf monitoring
  services.state.botExecutionMonitoringTick = new Date().getTime();

  // Execute all strategies simultaneously
  await Promise.all(
    services.strategies.map((strategy) =>
      executeStrategy(services, {
        blockNumber,
        multicall,
        strategy,
      })
    )
  );

  registerExecutionTime(services);
};

export default blockHandler;
