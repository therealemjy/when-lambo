import { Multicall } from '@maxime.julian/ethereum-multicall';

import { GasEstimates } from '@localTypes';

import { GasFees } from '@communicator/types';

import { Exchange } from '@bot/src/types';

const findLoanAmount = ({
  multicall,
  tradedTokenAddress,
  slippageAllowancePercent,
  gasFees,
  gasLimitMultiplicator,
  gasEstimates,
  exchanges,
  currentBlockNumber,
}: {
  multicall: Multicall;
  tradedTokenAddress: string;
  slippageAllowancePercent: number;
  gasFees: GasFees;
  gasLimitMultiplicator: number;
  gasEstimates: GasEstimates;
  exchanges: Exchange[];
  currentBlockNumber: number;
}) => {
  return '';
};

export default findLoanAmount;
