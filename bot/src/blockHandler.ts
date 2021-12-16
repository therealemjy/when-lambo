import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ContractTransaction } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { Strategy } from '@localTypes';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import formatNestedBN from '@chainHandler/utils/formatNestedBN';

import executeTrade from './executeTrade';
import findBestTrade from './findBestTrade';
import { WETH } from './tokens';
import { Services } from './types';
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

const EIGHT_SECONDS_IN_MS = 8000;

const executeStrategy = async (
  services: Services,
  { blockNumber, multicall, strategy, TransactorContract, spreadsheet }: ExecuteStrategyArgs
) => {
  try {
    const gasFees = services.state.gasFees;

    if (!gasFees) {
      throw new Error('Gas fees missing');
    }

    const { bestTradeByAmount, bestTradeByPercentage } = await findBestTrade({
      multicall,
      currentBlockNumber: blockNumber,
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
      gasFees,
      gasLimitMultiplicator: services.config.gasLimitMultiplicator,
    });

    // TODO: update state base loan amount using bestTradeByPercentage

    /*
      Check if trade follows our rules. Rules for a trade to be counted as
      executable:
      1) Trade musts yield a profit that's equal or superior to the total gas
          cost of the transaction
      2) Total gas cost of the transaction can only go up to a given ETH maximum
          (see config for the actual value)

      Note that we use the best trade by amount of profit yielded for trade
      executions. The best trade by percentage is used to define the base loan
      amount to use for the next block
    */
    const isTradeExecutable =
      bestTradeByAmount &&
      bestTradeByAmount.profitWethAmount.gt(bestTradeByAmount.totalGasCost) &&
      bestTradeByAmount.totalGasCost.lte(services.config.gasCostMaximumThresholdWei);

    if (!isTradeExecutable) {
      return;
    }

    let transaction: ContractTransaction | undefined = undefined;

    // Execute trade, in production and test environments only
    if (!services.config.isDev) {
      // Deactivate the bot completely
      services.state.isMonitoringActivated = false;
      // Stop all monitoring servers
      services.messenger?.sendStopMonitoringSignal();

      transaction = await executeTrade({
        trade: bestTradeByAmount,
        TransactorContract,
      });
    }

    // Log trade
    await services.logger.transaction({
      trade: bestTradeByAmount,
      transactionHash: transaction?.hash,
      spreadsheet,
    });

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

  if (!services.state.gasFees || !services.state.lastGasPriceUpdateDateTime) {
    services.logger.log(`Block skipped: #${blockNumber} (gas fees missing)`);
    return;
  }

  // Check if gas fees aren't outdated
  const dateNow = new Date().getTime();
  if (dateNow - services.state.lastGasPriceUpdateDateTime > EIGHT_SECONDS_IN_MS) {
    services.logger.log(`Block skipped: #${blockNumber} (gas fees outdated)`);
    return;
  }

  // Execute all strategies simultaneously
  const res = await Promise.allSettled(
    services.strategies.map((strategy) =>
      executeStrategy(services, {
        blockNumber,
        strategy,
        TransactorContract,
        multicall,
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
