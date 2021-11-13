import formatDate from 'date-fns/format';
import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

import config from '@src/config';
import { Path } from '@src/types';
import calculateProfit from '@src/utils/calculateProfit';
import sendSlackMessage, { formatErrorToSlackBlock } from '@src/utils/sendSlackMessage';

type WorksheetRow = [string, number, string, number, string, number, number, number, string];

const logPaths = async (paths: Path[], worksheet: GoogleSpreadsheetWorksheet) => {
  const slackBlocks: any[] = [];
  const tableRows: any[] = [];
  const worksheetRows: WorksheetRow[] = [];

  for (const path of paths) {
    const timestamp = formatDate(path[0].timestamp, 'd/M/yy HH:mm:ss');
    const borrowedDec = path[0].fromTokenDecimalAmount.toFixed();
    const boughtDec = path[0].toTokenDecimalAmount.toFixed(0);
    const revenues = path[1].toTokenDecimalAmount.toFixed(0);
    const bestSellingExchangeName = path[0].exchangeName;
    const bestBuyingExchangeName = path[1].exchangeName;
    const gasCost = path[0].estimatedGasCost.plus(path[1].estimatedGasCost);

    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });

    // Only log profitable paths in production
    if (config.environment === 'production' && profitDec.isGreaterThan(0)) {
      slackBlocks.push([
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${timestamp}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].fromToken.symbol} decimals borrowed:*\n${borrowedDec}`,
            },
            {
              type: 'mrkdwn',
              text: `*Best selling exchange:*\n${bestSellingExchangeName}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].toToken.symbol} decimals bought:*\n${boughtDec}`,
            },
            {
              type: 'mrkdwn',
              text: `*Best buying exchange:*\n${bestBuyingExchangeName}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].fromToken.symbol} decimals bought back:*\n${revenues}`,
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

      worksheetRows.push([
        timestamp,
        +borrowedDec,
        bestSellingExchangeName,
        +boughtDec,
        bestBuyingExchangeName,
        +revenues,
        +gasCost.toFixed(),
        +profitDec.toFixed(0),
        `${profitPercent}%`,
      ]);
    }
    // Log all paths in the console in development
    else if (config.environment === 'development') {
      tableRows.push({
        Timestamp: timestamp,
        [`${path[0].fromToken.symbol} decimals borrowed`]: borrowedDec,
        'Best selling exchange': bestSellingExchangeName,
        [`${path[0].toToken.symbol} decimals bought`]: boughtDec,
        'Best buying exchange': bestBuyingExchangeName,
        [`${path[0].fromToken.symbol} decimals bought back`]: revenues,
        'Gas cost (in wei)': gasCost.toFixed(),
        [`Profit (in ${path[0].fromToken.symbol} decimals)`]: profitDec.toFixed(0),
        'Profit (%)': profitPercent + '%',
      });
    }
  }

  try {
    if (config.environment === 'production' && slackBlocks.length > 0) {
      // Send alert to slack
      await sendSlackMessage(
        {
          blocks: slackBlocks.flat(),
        },
        'deals'
      );
    }

    if (config.environment === 'production' && worksheetRows.length > 0) {
      // Send row to Google Spreadsheet
      await worksheet.addRows(worksheetRows);
    }

    if (config.environment === 'development') {
      // Log paths in console
      console.table(tableRows);
    }
  } catch (err: any) {
    const formattedError = formatErrorToSlackBlock(err, config.toToken.symbol);
    sendSlackMessage(formattedError, 'errors');
  }
};

export default logPaths;
