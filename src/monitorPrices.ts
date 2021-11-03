import BigNumber from 'bignumber.js';

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
}: {
  refTokenDecimalAmounts: BigNumber[];
  refToken: Token;
  tradedToken: Token;
  exchanges: Exchange[];
}) => {
  if (isMonitoring) {
    console.log('Block skipped! Price monitoring ongoing.');
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
      })
    )
  );

  isMonitoring = false;

  const validPaths = paths.filter((path): path is Path => path !== undefined);

  // Log the valid paths
  logPaths(validPaths);
};

export default monitorPrices;
