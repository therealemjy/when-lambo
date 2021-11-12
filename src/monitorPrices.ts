import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange } from '@src/types';

import { Token } from './types';

const monitorPrices = async ({
  multicall,
  refTokenDecimalAmounts,
  refToken,
  tradedToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  multicall: Multicall;
  refTokenDecimalAmounts: BigNumber[];
  refToken: Token;
  tradedToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  exchanges: Exchange[];
}) => {
  return [];
};

export default monitorPrices;
