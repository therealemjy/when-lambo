import BigNumber from 'bignumber.js';

import config from '@src/config';
import { Exchange } from '@src/exchanges/types';

import findBestPath from './findBestPath';
import logPaths from './logPaths';
import { Token, Path } from './types';

let isMonitoring = false;

const monitorPrices = async ({
  refTokenDecimalAmounts,
  refToken,
  tradedToken,
  exchanges,
  slippageAllowancePercent,
}: {
  refTokenDecimalAmounts: BigNumber[];
  refToken: Token;
  tradedToken: Token;
  exchanges: Exchange[];
  slippageAllowancePercent: number;
}) => {
  if (isMonitoring && config.environment === 'development') {
    console.log('Block skipped! Price monitoring ongoing.');
  }

  if (isMonitoring) {
    return;
  }

  isMonitoring = true;

  const paths = await Promise.all(
    refTokenDecimalAmounts.map((refTokenDecimalAmount) =>
      findBestPath({
        refTokenDecimalAmount,
        refToken,
        tradedToken,
        exchanges,
        slippageAllowancePercent,
      })
    )
  );

  isMonitoring = false;

  const validPaths = paths.filter((path): path is Path => path !== undefined);

  // Log the valid paths
  logPaths(validPaths);
};

export default monitorPrices;
