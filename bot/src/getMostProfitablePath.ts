import BigNumber from 'bignumber.js';

import { TRADE_GAS_ESTIMATE_WITHOUT_SWAPS } from '@constants';

import { Path } from '@bot/src/types';
import calculateProfit from '@bot/src/utils/calculateProfit';

// Go through paths and find the most profitable (if any of them is considered
// profitable according to the rules)
const getMostProfitablePath = (paths: Path[], gasLimitMultiplicator: number, gasCostMaximumThresholdWei: BigNumber) => {
  const res = paths.reduce<
    | {
        profitWethAmount: BigNumber;
        path: Path;
      }
    | undefined
  >((mostProfitablePath, path) => {
    const totalGasCost = path[0].estimatedGasCost
      .plus(path[1].estimatedGasCost)
      // Add estimated gas to trade with Transactor (without accounting for the swap themselves)
      .plus(TRADE_GAS_ESTIMATE_WITHOUT_SWAPS)
      // Add gasLimit margin
      .multipliedBy(gasLimitMultiplicator);

    const [profitWethAmount] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(totalGasCost),
    });

    /*
      Rules for a trade to be counted as profitable:
      1) Trade musts yield a profit that's equal or superior the total gas cost of the transaction
      2) Total gas cost of the transaction can only go up to a given ETH maximum (see config for the actual value)
    */
    const isMostProfitable = !mostProfitablePath || mostProfitablePath.profitWethAmount.lt(profitWethAmount);

    if (profitWethAmount.gt(totalGasCost) && totalGasCost.lte(gasCostMaximumThresholdWei) && isMostProfitable) {
      return {
        profitWethAmount,
        path,
      };
    }

    return mostProfitablePath;
  }, undefined);

  return res?.path;
};

export default getMostProfitablePath;
