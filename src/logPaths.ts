import formatDate from 'date-fns/format';

import config from '@src/config';
import { Path } from '@src/types';
import calculateProfit from '@src/utils/calculateProfit';
import sendSlackMessage from '@src/utils/sendSlackMessage';

const getLogValues = (path: Path) => ({
  borrowedDec: path[0].fromTokenDecimalAmount.toFixed(),
  boughtDec: path[0].toTokenDecimalAmount.toFixed(),
  boughtDecBack: path[1].toTokenDecimalAmount.toFixed(0),
  bestSellingExchange: path[0].exchange.name,
  bestBuyingExchange: path[1].exchange.name,
});

const logPaths = async (paths: Path[]) => {
  const slackBlocks: any[] = [];
  const tableRows: any[] = [];

  for (const path of paths) {
    const gasCost = path[0].estimatedGasCost.plus(path[1].estimatedGasCost);

    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });

    // Only log profitable paths in production
    if (config.environment === 'production' && profitDec.isGreaterThan(0)) {
      const { borrowedDec, boughtDec, boughtDecBack, bestSellingExchange, bestBuyingExchange } = getLogValues(path);

      slackBlocks.push([
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${path[0].timestamp}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].fromToken.symbol} decimals borrowed:*\n${borrowedDec}`,
            },
            {
              type: 'mrkdwn',
              text: `*Best selling exchange:*\n${bestSellingExchange}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].toToken.symbol} decimals bought:*\n${boughtDec}`,
            },
            {
              type: 'mrkdwn',
              text: `*Best buying exchange:*\n${bestBuyingExchange}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].fromToken.symbol} decimals bought back:*\n${boughtDecBack}`,
            },
            {
              type: 'mrkdwn',
              text: `*Gas cost (in wei):*\n${gasCost.toFixed()}`,
            },
            {
              type: 'mrkdwn',
              text: `*Profit (in ${path[0].fromToken.symbol} decimals):*\n${profitDec.toFixed(0)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Profit (%):*\n${profitPercent}%`,
            },
          ],
        },
        {
          type: 'divider',
        },
      ]);
    }

    // Log all paths in development
    if (config.environment === 'development') {
      const { borrowedDec, boughtDec, boughtDecBack, bestSellingExchange, bestBuyingExchange } = getLogValues(path);

      tableRows.push({
        Timestamp: formatDate(path[0].timestamp, 'd/M/yy HH:mm'),
        [`${path[0].fromToken.symbol} decimals borrowed`]: borrowedDec,
        'Best selling exchange': bestSellingExchange,
        [`${path[0].toToken.symbol} decimals bought`]: boughtDec,
        'Best buying exchange': bestBuyingExchange,
        [`${path[0].fromToken.symbol} decimals bought back`]: boughtDecBack,
        'Gas cost (in wei)': gasCost.toFixed(),
        [`Profit (in ${path[0].fromToken.symbol} decimals)`]: profitDec.toFixed(0),
        'Profit (%)': profitPercent + '%',
      });
    }
  }

  if (config.environment === 'production' && slackBlocks.length > 0) {
    // Send alerts to slack
    await sendSlackMessage({
      blocks: slackBlocks.flat(),
    });
  } else if (config.environment === 'development') {
    console.table(tableRows);
  }
};

export default logPaths;
