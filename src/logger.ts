import 'console.table';
import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

import config from '@src/config';
import eventEmitter from '@src/eventEmitter';
import { Path } from '@src/types';
import calculateProfit from '@src/utils/calculateProfit';
import formatTimestamp from '@src/utils/formatTimestamp';
import sendSlackMessage from '@src/utils/sendSlackMessage';

type WorksheetRow = [string, number, string, number, string, number, number, number, string];

const formatMessage = (message: unknown) => {
  const timestamp = formatTimestamp(new Date());
  return `[${timestamp}] ${message}`;
};

const log: typeof console.log = (message, ...args) => {
  console.log(formatMessage(message), ...args);
};

const error: typeof console.error = (message, ...args) => {
  console.error(formatMessage(message), ...args);
};

const table = console.table;

const paths = async (pathsToLog: Path[], worksheet: GoogleSpreadsheetWorksheet) => {
  const slackBlocks: unknown[] = [];
  const tableRows: unknown[] = [];
  const worksheetRows: WorksheetRow[] = [];

  for (const path of pathsToLog) {
    const timestamp = formatTimestamp(path[0].timestamp);
    const borrowedDec = path[0].fromTokenDecimalAmount.toFixed();
    const boughtDec = path[0].toTokenDecimalAmount.toFixed(0);
    const revenues = path[1].toTokenDecimalAmount.toFixed(0);
    const bestSellingExchangeName = path[0].exchangeName;
    const bestBuyingExchangeName = path[1].exchangeName;
    const gasCost = path[0].estimatedGasCost
      .plus(path[1].estimatedGasCost)
      // Added gasLimit margin
      .multipliedBy(config.gasLimitMultiplicator);

    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });

    // Only log profitable paths in production
    if (config.isProd && profitDec.isGreaterThan(0)) {
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
    else if (config.isDev) {
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
    if (config.isProd && slackBlocks.length > 0) {
      // Send alert to slack
      await sendSlackMessage(
        {
          blocks: slackBlocks.flat(),
        },
        'deals'
      );
    }

    if (config.isProd && worksheetRows.length > 0) {
      // Send row to Google Spreadsheet
      await worksheet.addRows(worksheetRows);
    }

    if (config.isDev) {
      // Log paths in console
      table(tableRows);
    }
  } catch (err: unknown) {
    eventEmitter.emit('error', err);
  }
};

export default {
  log,
  error,
  table,
  paths,
};
