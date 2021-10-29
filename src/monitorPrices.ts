import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';
import calculateProfit from '@src/utils/calculateProfit';

import findBestPath from './findBestPath';
import { Token, Path } from './types';

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

  const paths = await Promise.all(
    refTokenDecimalAmounts.map((refTokenDecimalAmount) =>
      findBestPath(
        {
          refTokenDecimalAmount,
          refToken,
          tradedToken,
        },
        exchanges
      )
    )
  );

  // Calculate profits
  const table = paths
    .filter((path): path is Path => path !== undefined)
    .map((path) => {
      const [profitDec, profitPercent] = calculateProfit(path[1].toTokenDecimalAmount, path[0].fromTokenDecimalAmount);

      return {
        [`${refToken.symbol} decimals borrowed`]: path[0].fromTokenDecimalAmount.toFixed(),
        'Best selling exchange': path[0].exchangeName,
        [`${tradedToken.symbol} decimals bought`]: path[0].toTokenDecimalAmount.toFixed(),
        'Best buying exchange': path[1].exchangeName,
        [`${refToken.symbol} decimals bought back`]: path[1].toTokenDecimalAmount.toFixed(0),
        [`Profit (in ${refToken.symbol} decimals)`]: profitDec.toFixed(0),
        'Profit (%)': profitPercent + '%',
      };
    });

  console.table(table);
};

export default monitorPrices;
