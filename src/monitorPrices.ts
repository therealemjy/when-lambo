import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';

// import calculateProfit from '@src/utils/calculateProfit';
import findBestPath from './findBestPath';
import { Token } from './types';

let isMonitoring = false;

const monitorPrices = async (
  {
    refTokenDecimalAmounts,
    refToken,
    tradedToken,
  }: {
    refTokenDecimalAmounts: BigNumber[];
    refToken: Token;
    tradedToken: Token;
  },
  exchanges: Array<{
    name: string;
    service: Exchange;
  }>
) => {
  if (isMonitoring) {
    console.log('Block skipped! Price monitoring ongoing.');
    return;
  }

  isMonitoring = true;

  console.log(
    await findBestPath(
      {
        refTokenDecimalAmount: refTokenDecimalAmounts[0],
        refToken,
        tradedToken,
      },
      exchanges
    )
  );
};

export default monitorPrices;
