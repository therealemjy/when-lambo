import { GasFees } from '@communicator/types';
import { BigNumber } from 'ethers';

import { TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE } from '@constants';

import { Trade, Path } from '@bot/src/types';
import calculateProfit from '@bot/src/utils/calculateProfit';

// Go through paths and find the most profitable (if any of them is considered
// profitable according to the rules)
const findTrade = ({
  currentBlockNumber,
  paths,
  gasFees,
  gasLimitMultiplicator,
  gasCostMaximumThresholdWei,
}: {
  currentBlockNumber: number;
  paths: Path[];
  gasFees: GasFees;
  gasLimitMultiplicator: number;
  gasCostMaximumThresholdWei: BigNumber;
}) => {
  const bestTrade = paths.reduce<Trade | undefined>((currentBestTrade, path) => {
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
      blockNumber: currentBlockNumber + 1,
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
    if (!currentBestTrade) {
      return trade;
    }

    /*
      Rules for a trade to be counted as profitable:
      1) Trade musts yield a profit that's equal or superior to the total gas
         cost of the transaction
      2) Total gas cost of the transaction can only go up to a given ETH maximum
         (see config for the actual value)
    */
    // const isMostProfitable = profitWethAmount.gt(totalGasCost) && totalGasCost.lte(gasCostMaximumThresholdWei) && currentBestTrade.profitWethAmount.lt(profitWethAmount);
    // TODO: remove once we start executing real trades
    const isMostProfitable = profitWethAmount.gt(0) && currentBestTrade.profitWethAmount.lt(profitWethAmount);

    if (isMostProfitable) {
      return trade;
    }

    return currentBestTrade;
  }, undefined);

  return bestTrade;
};

export default findTrade;
