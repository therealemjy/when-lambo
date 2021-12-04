import BigNumber from 'bignumber.js';

import { ParsedStrategy } from '@localTypes';

const strategyToWeiAmounts = (baseWei: string, incrementPercent: number, incrementAmount: number): BigNumber[] => {
  const strategy = Array.from(Array(incrementAmount).keys()) as unknown as BigNumber[];
  const middleIndex = Math.round(strategy.length / 2);

  strategy.forEach((_, index) => {
    strategy[index] = new BigNumber(baseWei);

    // If middle value we set the base value
    if (index === middleIndex) {
      return;
    }

    const positionFromBase = index - middleIndex;
    const percent = (incrementPercent * positionFromBase) / 100 + 1;

    strategy[index] = new BigNumber(strategy[index].multipliedBy(percent).toFixed(0));
  });

  return strategy;
};

const formatStrategies = (parsedStrategies: ParsedStrategy[], borrowedAmountsCount: number) =>
  parsedStrategies.map((parsedStrategy: ParsedStrategy) => ({
    borrowedWethAmounts: strategyToWeiAmounts(
      parsedStrategy.STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT,
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
