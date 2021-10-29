import formatDate from 'date-fns/format';

import { Path } from '@src/types';
import calculateProfit from '@src/utils/calculateProfit';

const logPathsInDevelopment = async (paths: Path[]) => {
  const tableRows: any[] = [];

  for (const path of paths) {
    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      expenseDec: path[0].fromTokenDecimalAmount,
    });

    const borrowedDec = path[0].fromTokenDecimalAmount.toFixed();
    const boughtDec = path[0].toTokenDecimalAmount.toFixed();
    const profitDecAmount = profitDec.toFixed(0);
    const boughtDecBack = path[1].toTokenDecimalAmount.toFixed(0);
    const bestSellingExchange = path[0].exchangeName;
    const bestBuyingExchange = path[1].exchangeName;

    tableRows.push({
      Timestamp: formatDate(path[0].timestamp, 'd/M/yy HH:mm'),
      [`${path[0].fromToken.symbol} decimals borrowed`]: borrowedDec,
      'Best selling exchange': bestSellingExchange,
      [`${path[0].toToken.symbol} decimals bought`]: boughtDec,
      'Best buying exchange': bestBuyingExchange,
      [`${path[0].fromToken.symbol} decimals bought back`]: boughtDecBack,
      [`Profit (in ${path[0].fromToken.symbol} decimals)`]: profitDecAmount,
      'Profit (%)': profitPercent + '%',
    });
  }

  console.table(tableRows);
};

export default logPathsInDevelopment;
