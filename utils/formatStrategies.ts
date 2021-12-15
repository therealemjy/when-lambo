import { BigNumber } from 'ethers';

import { ParsedStrategy } from '@localTypes';

import multiplyAmounts from './multiplyAmounts';

const formatStrategies = (parsedStrategies: ParsedStrategy[], borrowedAmountCount: number) =>
  parsedStrategies.map((parsedStrategy: ParsedStrategy) => ({
    borrowedWethAmounts: multiplyAmounts(
      BigNumber.from(parsedStrategy.BORROWED_WETH_STARTING_BASE_AMOUNT),
      +parsedStrategy.BORROWED_WETH_AMOUNT_INCREMENT_PERCENT,
      borrowedAmountCount
    ),
    toToken: {
      address: parsedStrategy.TRADED_TOKEN_ADDRESS,
      symbol: parsedStrategy.TRADED_TOKEN_SYMBOL,
      decimals: +parsedStrategy.TRADED_TOKEN_DECIMALS,
    },
  }));

export default formatStrategies;
