import { Multicall } from '@maxime.julian/ethereum-multicall';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { Strategy } from '@localTypes';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import { Services } from './bootstrap';
import executeTrade from './executeTrade';
import findBestPaths from './findBestPaths';
import getMostProfitablePath from './getMostProfitablePath';
import { WETH } from './tokens';
import registerExecutionTime from './utils/registerExecutionTime';

type ExecuteStrategyArgs = {
  strategy: Strategy;
  blockNumber: number;
  multicall: Multicall;
  spreadsheet: GoogleSpreadsheet;
  TransactorContract: ITransactorContract;
};

type BlockHandlerArgs = {
  blockNumber: number;
  multicall: Multicall;
  spreadsheet: GoogleSpreadsheet;
  TransactorContract: ITransactorContract;
};

const executeStrategy = async (
  services: Services,
  { blockNumber, multicall, strategy, TransactorContract, spreadsheet }: ExecuteStrategyArgs
) => {
  try {
    const gasPriceWei = services.state.currentGasPrices.rapid;

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
      gasPriceWei,
    });

    // Get the most profitable path, if any of them is considered profitable
    const mostProfitablePath = getMostProfitablePath({
      paths,
      gasPriceWei,
      gasLimitMultiplicator: services.config.gasLimitMultiplicator,
      gasCostMaximumThresholdWei: services.config.gasCostMaximumThresholdWei,
    });

    let transactionHash: string | undefined = undefined;

    console.log('services.config.isDev', services.config.isDev);

    // Only execute trades in production
    if (mostProfitablePath && !services.config.isDev) {
      // Deactivate the bot completely
      services.state.monitoringActivated = false;

      const transaction = await executeTrade({
        blockNumber,
        path: mostProfitablePath,
        gasPriceWei,
        gasLimitMultiplicator: services.config.gasLimitMultiplicator,
        TransactorContract,
      });

      transactionHash = transaction.hash;
    }

    if (mostProfitablePath) {
      await services.logger.transaction({ blockNumber, path: mostProfitablePath, transactionHash, spreadsheet });
    }
  } catch (error: unknown) {
    services.eventEmitter.emit('error', error);
  }
};

const blockHandler = async (
  services: Services,
  { multicall, blockNumber, TransactorContract, spreadsheet }: BlockHandlerArgs
) => {
  // Record time for perf monitoring
  services.state.botExecutionMonitoringTick = new Date().getTime();

  // Execute all strategies simultaneously
  const res = await Promise.allSettled(
    services.strategies.map((strategy) =>
      executeStrategy(services, {
        blockNumber,
        multicall,
        strategy,
        TransactorContract,
        spreadsheet,
      })
    )
  );

  // Log eventual errors
  res.forEach((result) => {
    if (result.status === 'rejected') {
      services.eventEmitter.emit('error', result.reason);
    }
  });

  registerExecutionTime(services);
};

export default blockHandler;
