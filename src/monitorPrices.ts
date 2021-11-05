import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

import findBestPath from './findBestPath';
import { Token, Path } from './types';

const monitorPrices = async ({
  refTokenDecimalAmounts,
  refToken,
  tradedToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  refTokenDecimalAmounts: BigNumber[];
  refToken: Token;
  tradedToken: Token;
  exchanges: Exchange[];
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
}) => {
  const paths = await Promise.all(
    refTokenDecimalAmounts.map((refTokenDecimalAmount) =>
      findBestPath({
        refTokenDecimalAmount,
        refToken,
        tradedToken,
        exchanges,
        slippageAllowancePercent,
        gasPriceWei,
      })
    )
  );

  const validPaths = paths.filter((path): path is Path => path !== undefined);
  return validPaths;
};

export default monitorPrices;
