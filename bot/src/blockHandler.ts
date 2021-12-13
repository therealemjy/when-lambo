import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ContractTransaction } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { Strategy } from '@localTypes';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';
import formatNestedBN from '@chainHandler/utils/formatNestedBN';

import executeTrade from './executeTrade';
import findBestPaths from './findBestPaths';
import findTrade from './findTrade';
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
    const trade = findTrade({
      currentBlockNumber: blockNumber,
      paths,
      gasFees,
      gasLimitMultiplicator: services.config.gasLimitMultiplicator,
      gasCostMaximumThresholdWei: services.config.gasCostMaximumThresholdWei,
    });

    // TODO: uncomment once we're confident the script can start executing real
    // trades

    let transaction: ContractTransaction | undefined = undefined;

    // Execute trade, in production and test environments only
    if (trade && !services.config.isDev) {
      // Deactivate the bot completely
      services.state.isMonitoringActivated = false;

      transaction = await executeTrade({
        trade,
        TransactorContract,
      });
    }

    // Log trade
    if (trade) {
      await services.logger.transaction({
        trade,
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
