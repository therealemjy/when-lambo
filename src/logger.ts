import BigNumber from 'bignumber.js';
import 'console.table';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import config from '@src/config';
import eventEmitter from '@src/eventEmitter';
import { WETH } from '@src/tokens';
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

const _convertToHumanReadableAmount = (amount: BigNumber, tokenDecimals: number) =>
  amount.dividedBy(10 ** tokenDecimals).toFixed(tokenDecimals);

const paths = async (pathsToLog: Path[], spreadsheet: GoogleSpreadsheet) => {
  const slackBlocks: unknown[] = [];
  const tableRows: unknown[] = [];
  const worksheetRowsMapping: {
    [key: string]: WorksheetRow[];
  } = {};

  for (const path of pathsToLog) {
    const timestamp = formatTimestamp(path[0].timestamp);
    const borrowedTokens = _convertToHumanReadableAmount(path[0].fromTokenDecimalAmount, path[0].fromToken.decimals);
    const boughtTokens = _convertToHumanReadableAmount(path[0].toTokenDecimalAmount, path[0].toToken.decimals);
    const revenues = _convertToHumanReadableAmount(path[1].toTokenDecimalAmount, path[1].toToken.decimals);

    const bestSellingExchangeName = path[0].exchangeName;
    const bestBuyingExchangeName = path[1].exchangeName;

    const gasCost = path[0].estimatedGasCost
      .plus(path[1].estimatedGasCost)
      // Add gasLimit margin
      .multipliedBy(config.gasLimitMultiplicator);
    const gasCostWETH = _convertToHumanReadableAmount(gasCost, WETH.decimals);

    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });

    const profitTokens = _convertToHumanReadableAmount(profitDec, path[0].fromToken.decimals);

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
              text: `*${path[0].fromToken.symbol} borrowed:*\n${borrowedTokens}`,
            },
            {
              type: 'mrkdwn',
              text: `*Best selling exchange:*\n${bestSellingExchangeName}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].toToken.symbol} bought:*\n${boughtTokens}`,
            },
            {
              type: 'mrkdwn',
              text: `*Best buying exchange:*\n${bestBuyingExchangeName}`,
            },
            {
              type: 'mrkdwn',
              text: `*${path[0].fromToken.symbol} bought back:*\n${revenues}`,
            },
            {
              type: 'mrkdwn',
              text: `*Gas cost (in wei):*\n${gasCost}`,
            },
            {
              type: 'mrkdwn',
              text: `*Profit (in ${path[0].fromToken.symbol}):*\n${profitTokens}`,
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

      // Initialize worksheet if it hasn't been initialized yet
      const worksheetTitle = `${path[0].fromToken.symbol} / ${path[0].toToken.symbol}`;
      worksheetRowsMapping[worksheetTitle] = worksheetRowsMapping[worksheetTitle] || [];

      // Add row
      worksheetRowsMapping[worksheetTitle].push([
        timestamp,
        +borrowedTokens,
        bestSellingExchangeName,
        +boughtTokens,
        bestBuyingExchangeName,
        +revenues,
        +gasCostWETH,
        +profitTokens,
        `${profitPercent}%`,
      ]);
    }
    // Log all paths in the console in development
    else if (config.isDev) {
      tableRows.push({
        Timestamp: timestamp,
        [`${path[0].fromToken.symbol} borrowed`]: borrowedTokens,
        'Best selling exchange': bestSellingExchangeName,
        [`${path[0].toToken.symbol} bought`]: boughtTokens,
        'Best buying exchange': bestBuyingExchangeName,
        [`${path[0].fromToken.symbol} bought back`]: revenues,
        'Gas cost (in WETH)': gasCostWETH,
        [`Profit (in ${path[0].fromToken.symbol})`]: profitTokens,
        'Profit (%)': profitPercent + '%',
      });
    }
  }

  // Log paths in console in dev
  if (config.isDev) {
    table(tableRows);
    return;
  }

  // Send profitable paths to slack in prod
  if (slackBlocks.length > 0) {
    sendSlackMessage(
      {
        blocks: slackBlocks.flat(),
      },
      'deals'
    ).catch((err) => eventEmitter.emit('error', err));
  }

  // Then update the Google Spreadsheet document
  for (const worksheetTitle of Object.keys(worksheetRowsMapping)) {
    const worksheet = spreadsheet.sheetsByTitle[worksheetTitle];

    if (!worksheet) {
      eventEmitter.emit('error', new Error(`Could not find sheet with title ${worksheetTitle}`));
    }

    worksheet.addRows(worksheetRowsMapping[worksheetTitle]).catch((err) => eventEmitter.emit('error', err));
  }
};

export default {
  log,
  error,
  table,
  paths,
};
