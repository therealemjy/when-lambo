import { BigNumber } from 'ethers';

import { ParsedStrategy } from '@localTypes';

/*
  The amounts returned are calculated as follows:
  incrementsCount represents how many amounts we want to calculate, using
  baseAmount as a reference by making it the value located in the middle of
  the array of amounts returned. Each value is incremented or decremented by
  p * incrementPercentage, where p depends on the position of the amount in
  the array returned.
  For example, calling this function with the arguments:
  baseAmount = 10,
  incrementPercentage = 10,
  incrementsCount = 5
  will output:
  [8, 9, baseAmount (10), 11, 12];
*/
const strategyToWeiAmounts = (
  baseAmount: BigNumber,
  incrementPercentage: number,
  incrementsCount: number
): BigNumber[] => {
  const amounts: BigNumber[] = [];
  const baseIndex = Math.floor((incrementsCount - 1) / 2);

  for (let index = 0; index < incrementsCount; index++) {
    const percentage =
      index < baseIndex
        ? 100 - (baseIndex - index) * incrementPercentage
        : 100 + (index - baseIndex) * incrementPercentage;

    amounts[index] = baseAmount.mul(percentage).div(100);
  }

  return amounts;
};

const formatStrategies = (parsedStrategies: ParsedStrategy[], borrowedAmountsCount: number) =>
  parsedStrategies.map((parsedStrategy: ParsedStrategy) => ({
    borrowedWethAmounts: strategyToWeiAmounts(
      BigNumber.from(parsedStrategy.STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT),
      +parsedStrategy.STRATEGY_BORROWED_INCREMENT_PERCENT,
      borrowedAmountsCount
    ),
    toToken: {
      address: parsedStrategy.TRADED_TOKEN_ADDRESS,
      symbol: parsedStrategy.TRADED_TOKEN_SYMBOL,
      decimals: +parsedStrategy.TRADED_TOKEN_DECIMALS,
    },
  }));

export default formatStrategies;
