import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ContractTransaction } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { Strategy } from '@localTypes';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import formatNestedBN from '@chainHandler/utils/formatNestedBN';

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
    const gasFees = services.state.currentGasFees;

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
      maxFeePerGas: gasFees.maxFeePerGas,
    });

    // Get the most profitable path, if any of them is considered profitable
    const mostProfitablePath = getMostProfitablePath({
      paths,
      maxFeePerGas: gasFees.maxFeePerGas,
      gasLimitMultiplicator: services.config.gasLimitMultiplicator,
      gasCostMaximumThresholdWei: services.config.gasCostMaximumThresholdWei,
    });

    let transaction: ContractTransaction | undefined = undefined;

    // Execute trade, in production and test environments only
    if (mostProfitablePath && !services.config.isDev) {
      // Deactivate the bot completely
      services.state.monitoringActivated = false;

      transaction = await executeTrade({
        blockNumber,
        path: mostProfitablePath,
        gasFees,
        gasLimitMultiplicator: services.config.gasLimitMultiplicator,
        TransactorContract,
      });
    }

    // Log trade
    if (mostProfitablePath) {
      await services.logger.transaction({
        blockNumber,
        path: mostProfitablePath,
        transactionHash: transaction?.hash,
        spreadsheet,
      });
    }

    // Watch transaction
    if (transaction) {
      services.logger.log('Watching pending transaction...');
      const receipt = await transaction.wait();
      services.logger.log('Trade successfully executed! Human-readable receipt:');
      services.logger.log(formatNestedBN(receipt));
      services.logger.log('Stringified receipt:');
      services.logger.log(JSON.stringify(receipt));
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
