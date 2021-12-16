import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers, BigNumber } from 'ethers';

import { GasEstimates, Token } from '@localTypes';
import logger from '@logger';
import multiplyAmounts from '@utils/multiplyAmounts';

import findBestTrade from '@root/bot/src/findBestTrade';

import { GasFees } from '@communicator/types';

import { WETH } from '@bot/src/tokens';
import { Exchange } from '@bot/src/types';

const MAX_ITERATIONS = 20;
const PROFIT_PERCENTAGE_DELTA = 0.01;
const LOAN_BASE_AMOUNT = ethers.utils.parseEther('10');
const INCREMENT_PERCENTAGE = 1;
const incrementCount = ((100 - INCREMENT_PERCENTAGE) / INCREMENT_PERCENTAGE) * 2 + 1;

const findLoanAmount = async ({
  multicall,
  tradedToken,
  slippageAllowancePercent,
  gasFees,
  gasLimitMultiplicator,
  gasEstimates,
  exchanges,
  currentBlockNumber,
  lastBestLoanAmount = LOAN_BASE_AMOUNT,
  lastBestTradeProfitPercentage,
  iterationCount = 0,
}: {
  multicall: Multicall;
  tradedToken: Token;
  slippageAllowancePercent: number;
  gasFees: GasFees;
  gasLimitMultiplicator: number;
  gasEstimates: GasEstimates;
  exchanges: Exchange[];
  currentBlockNumber: number;
  lastBestLoanAmount?: BigNumber;
  lastBestTradeProfitPercentage?: number;
  iterationCount?: number;
}): Promise<string> => {
  if (iterationCount >= MAX_ITERATIONS) {
    logger.log(
      `Max iteration count reached (${iterationCount}) while fetching loan amounts for ${tradedToken.symbol} token`
    );
    return lastBestLoanAmount.toString();
  }

  const fromTokenDecimalAmounts = multiplyAmounts(lastBestLoanAmount, INCREMENT_PERCENTAGE, incrementCount);

  const { bestTradeByPercentage } = await findBestTrade({
    multicall,
    fromToken: WETH,
    fromTokenDecimalAmounts,
    toToken: tradedToken,
    exchanges,
    slippageAllowancePercent,
    gasFees,
    gasLimitMultiplicator,
    gasEstimates,
    currentBlockNumber,
  });

  logger.log(
    `Iteration #${iterationCount}`,
    `${bestTradeByPercentage.path[0].fromTokenDecimalAmount.toString()} wei (${
      bestTradeByPercentage.profitPercentage
    }% profit)`
  );

  const bestTradeLoanAmount = bestTradeByPercentage.path[0].fromTokenDecimalAmount;

  if (
    lastBestTradeProfitPercentage &&
    Math.abs(lastBestTradeProfitPercentage - bestTradeByPercentage.profitPercentage) <= PROFIT_PERCENTAGE_DELTA
  ) {
    logger.log(
      'Best trade loan amount found',
      `${bestTradeLoanAmount.toString()} wei (${bestTradeByPercentage.profitPercentage}% profit)`
    );
    return bestTradeLoanAmount.toString();
  }

  return findLoanAmount({
    multicall,
    tradedToken,
    slippageAllowancePercent,
    gasFees,
    gasLimitMultiplicator,
    gasEstimates,
    exchanges,
    currentBlockNumber,
    lastBestLoanAmount: bestTradeLoanAmount,
    lastBestTradeProfitPercentage: bestTradeByPercentage.profitPercentage,
    iterationCount: iterationCount + 1,
  });
};

export default findLoanAmount;
