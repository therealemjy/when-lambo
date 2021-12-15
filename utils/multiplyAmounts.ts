import { BigNumber } from 'ethers';

/*
  The amounts returned are calculated as follows:
  incrementCount represents how many amounts we want to calculate, using
  baseAmount as a reference by making it the value located in the middle of
  the array of amounts returned. Each value is incremented or decremented by
  p * incrementPercentage, where p depends on the position of the amount in
  the array returned.
  For example, calling this function with the arguments:
  baseAmount = 10,
  incrementPercentage = 10,
  incrementCount = 5
  will output:
  [8, 9, baseAmount (10), 11, 12];
*/
const multiplyAmounts = (baseAmount: BigNumber, incrementPercentage: number, incrementCount: number): BigNumber[] => {
  const amounts: BigNumber[] = [];
  const baseIndex = Math.floor((incrementCount - 1) / 2);

  for (let index = 0; index < incrementCount; index++) {
    const percentage =
      index < baseIndex
        ? 100 - (baseIndex - index) * incrementPercentage
        : 100 + (index - baseIndex) * incrementPercentage;

    amounts[index] = baseAmount.mul(percentage).div(100);
  }

  return amounts;
};

export default multiplyAmounts;
