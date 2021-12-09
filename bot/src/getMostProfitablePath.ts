import { BigNumber } from 'ethers';

import { TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE } from '@constants';

import { Path } from '@bot/src/types';
import calculateProfit from '@bot/src/utils/calculateProfit';

// Go through paths and find the most profitable (if any of them is considered
// profitable according to the rules)
const getMostProfitablePath = ({
  paths,
  maxFeePerGas,
  gasLimitMultiplicator,
  gasCostMaximumThresholdWei,
}: {
  paths: Path[];
  maxFeePerGas: BigNumber;
  gasLimitMultiplicator: number;
  gasCostMaximumThresholdWei: BigNumber;
}) => {
  const res = paths.reduce<
    | {
        profitWethAmount: BigNumber;
        path: Path;
      }
    | undefined
  >((mostProfitablePath, path) => {
    const tradeWithoutSwapsGasCostEstimate = maxFeePerGas.mul(TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE);

    const totalGasCost = path[0].gasCostEstimate
      .add(path[1].gasCostEstimate)
      // Add estimated gas to trade with Transactor (without accounting for the
      // swap themselves)
      .add(tradeWithoutSwapsGasCostEstimate)
      // Add gasLimit margin. gasLimitMultiplicator being a decimal number
      // (which BigNumber does not support) with up to 2 decimal place, we
      // transform it into an integer, then back to its original value by first
      // multiplying it by 100, before dividing it by 100
      .mul(gasLimitMultiplicator * 100)
      .div(100);

    const [profitWethAmount] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.add(totalGasCost),
    });

    /*
      Rules for a trade to be counted as profitable:
      1) Trade musts yield a profit that's equal or superior to the total gas
         cost of the transaction
      2) Total gas cost of the transaction can only go up to a given ETH maximum
         (see config for the actual value)
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
