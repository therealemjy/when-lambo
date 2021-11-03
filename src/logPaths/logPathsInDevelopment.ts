import formatDate from 'date-fns/format';

import { Path } from '@src/types';
import calculateProfit from '@src/utils/calculateProfit';

const logPathsInDevelopment = async (paths: Path[]) => {
  const tableRows: any[] = [];

  for (const path of paths) {
    const gasCost = path[0].estimatedGasCost.plus(path[1].estimatedGasCost);

    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });

    const borrowedDec = path[0].fromTokenDecimalAmount.toFixed();
    const boughtDec = path[0].toTokenDecimalAmount.toFixed();
    const profitDecAmount = profitDec.toFixed(0);
    const boughtDecBack = path[1].toTokenDecimalAmount.toFixed(0);
    const bestSellingExchange = path[0].exchange.name;
    const bestBuyingExchange = path[1].exchange.name;

    tableRows.push({
      Timestamp: formatDate(path[0].timestamp, 'd/M/yy HH:mm'),
      [`${path[0].fromToken.symbol} decimals borrowed`]: borrowedDec,
      'Best selling exchange': bestSellingExchange,
      [`${path[0].toToken.symbol} decimals bought`]: boughtDec,
      'Best buying exchange': bestBuyingExchange,
      [`${path[0].fromToken.symbol} decimals bought back`]: boughtDecBack,
      'Gas cost (in wei)': gasCost.toFixed(),
      [`Profit (in ${path[0].fromToken.symbol} decimals)`]: profitDecAmount,
      'Profit (%)': profitPercent + '%',
    });
  }

  console.table(tableRows);
};

export default logPathsInDevelopment;
