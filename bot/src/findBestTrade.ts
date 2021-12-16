import { Multicall } from '@maxime.julian/ethereum-multicall';
import { BigNumber } from 'ethers';

import { TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE } from '@constants';
import { GasEstimates, Token, GasFees } from '@localTypes';

import { Exchange, Trade } from '@bot/src/types';
import calculateProfit from '@bot/src/utils/calculateProfit';

import findBestPaths from './findBestPaths';

type FindBestTradeArgs = {
  multicall: Multicall;
  fromToken: Token;
  fromTokenDecimalAmounts: BigNumber[];
  toToken: Token;
  slippageAllowancePercent: number;
  gasFees: GasFees;
  gasLimitMultiplicator: number;
  gasEstimates: GasEstimates;
  exchanges: Exchange[];
  currentBlockNumber: number;
};

const findBestTrade = async ({
  multicall,
  fromToken,
  fromTokenDecimalAmounts,
  toToken,
  exchanges,
  slippageAllowancePercent,
  gasFees,
  gasLimitMultiplicator,
  gasEstimates,
  currentBlockNumber,
}: FindBestTradeArgs) => {
  const paths = await findBestPaths({
    multicall,
    fromToken,
    fromTokenDecimalAmounts,
    toToken,
    exchanges,
    slippageAllowancePercent,
    maxFeePerGas: gasFees.maxFeePerGas,
    gasEstimates,
  });

  let bestTradeByAmount!: Trade;
  let bestTradeByPercentage!: Trade;

  // Get the most profitable path
  for (const path of paths) {
    const gasLimit = path[0].gasEstimate
      .add(path[1].gasEstimate)
      .add(TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE)
      // Add gasLimit margin. gasLimitMultiplicator being a decimal number
      // (which BigNumber does not support) with up to 2 decimal place, we
      // transform it into an integer, then back to its original value by first
      // multiplying it by 100, before dividing it by 100
      .mul(gasLimitMultiplicator * 100)
      .div(100);

    const totalGasCost = gasLimit.mul(gasFees.maxFeePerGas);

    const [profitWethAmount, profitPercentage] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.add(totalGasCost),
    });

    const trade: Trade = {
      blockNumber: currentBlockNumber,
      path,
      profitWethAmount,
      profitPercentage,
      totalGasCost,
      gasSettings: {
        gasLimit: gasLimit.toNumber(),
        ...gasFees,
      },
    };

    // Assign trade as best trade if none has been assigned yet
    if (!bestTradeByAmount) {
      bestTradeByAmount = trade;
    }

    if (!bestTradeByPercentage) {
      bestTradeByPercentage = trade;
    }

    // Check if trade is more profitable in terms of amount yielded
    if (trade.profitWethAmount.gt(bestTradeByAmount.profitWethAmount)) {
      bestTradeByAmount = trade;
    }

    // Check if trade is more profitable in terms of profit percentage
    if (trade.profitPercentage > bestTradeByPercentage.profitPercentage) {
      bestTradeByPercentage = trade;
    }
  }

  return {
    bestTradeByAmount,
    bestTradeByPercentage,
  };
};

export default findBestTrade;
