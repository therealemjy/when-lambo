import BigNumber from 'bignumber.js';
import Bunyan from 'bunyan';
import RotatingFileStream from 'bunyan-rotating-file-stream';
import 'console.table';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { TRADE_GAS_ESTIMATE_WITHOUT_SWAPS } from '@constants';
import { ExchangeIndex } from '@localTypes';

import config from '@bot/config';
import eventEmitter from '@bot/src/bootstrap/eventEmitter';
import { WETH } from '@bot/src/tokens';
import { Path } from '@bot/src/types';
import calculateProfit from '@bot/src/utils/calculateProfit';
import formatTimestamp from '@bot/src/utils/formatTimestamp';
import sendSlackMessage from '@bot/src/utils/sendSlackMessage';

import { WorksheetRow } from './types';

const bunyanLogger = Bunyan.createLogger({
  name: 'bot',
  serializers: Bunyan.stdSerializers,
});

// Save logs in files in prod
if (config.isProd) {
  bunyanLogger.addStream({
    // @ts-ignore For some reason, the type definition of RotatingFileStream is incorrect
    stream: new RotatingFileStream({
      path: `/var/tmp/logs.log`,
      period: '1d',
      totalFiles: 3, // Keep up to 3 days worth of logs
      rotateExisting: true,
    }),
  });
}

const log: typeof console.log = (...args) => bunyanLogger.info(...args);
const error: typeof console.error = (...args) => bunyanLogger.error(...args);

const _convertToHumanReadableAmount = (amount: BigNumber, tokenDecimals: number) =>
  amount.dividedBy(10 ** tokenDecimals).toFixed(tokenDecimals);

const paths = async (blockNumber: string, pathsToLog: Path[], spreadsheet: GoogleSpreadsheet) => {
  const slackBlocks: unknown[] = [];
  const tableRows: unknown[] = [];
  const worksheetRows: WorksheetRow[] = [];

  for (const path of pathsToLog) {
    const timestamp = formatTimestamp(path[0].timestamp);
    const borrowedTokens = _convertToHumanReadableAmount(path[0].fromTokenDecimalAmount, path[0].fromToken.decimals);
    const boughtTokens = _convertToHumanReadableAmount(path[0].toTokenDecimalAmount, path[0].toToken.decimals);
    const revenues = _convertToHumanReadableAmount(path[1].toTokenDecimalAmount, path[1].toToken.decimals);

    const bestSellingExchangeName = ExchangeIndex[path[0].exchangeIndex];
    const bestBuyingExchangeName = ExchangeIndex[path[1].exchangeIndex];

    const gasCost = path[0].estimatedGasCost
      .plus(path[1].estimatedGasCost)
      // Add estimated gas to trade with Transactor (without accounting for the swap themselves)
      .plus(TRADE_GAS_ESTIMATE_WITHOUT_SWAPS)
      // Add gasLimit margin
      .multipliedBy(config.gasLimitMultiplicator);
    const gasCostWETH = _convertToHumanReadableAmount(gasCost, WETH.decimals);

    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });

    const profitInTokens = _convertToHumanReadableAmount(profitDec, path[0].fromToken.decimals);

    // Log paths in Slack and Google Spreadsheet in production
    if (config.isProd) {
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
              text: `*Profit (in ${path[0].fromToken.symbol}):*\n${profitInTokens}`,
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

      // Add row
      worksheetRows.push([
        timestamp,
        blockNumber,
        +borrowedTokens,
        bestSellingExchangeName,
        path[0].toToken.symbol,
        +boughtTokens,
        bestBuyingExchangeName,
        +revenues,
        +gasCostWETH,
        +profitInTokens,
        `${profitPercent}%`,
      ]);
    }
    // Log paths in the console in development
    else if (config.isDev) {
      tableRows.push({
        Timestamp: timestamp,
        'Block number': blockNumber,
        [`${path[0].fromToken.symbol} borrowed`]: borrowedTokens,
        'Best selling exchange': bestSellingExchangeName,
        [`${path[0].toToken.symbol} bought`]: boughtTokens,
        'Best buying exchange': bestBuyingExchangeName,
        [`${path[0].fromToken.symbol} bought back`]: revenues,
        'Gas cost (in WETH)': gasCostWETH,
        [`Profit (in ${path[0].fromToken.symbol})`]: profitInTokens,
        'Profit (%)': profitPercent + '%',
      });
    }
  }

  if (config.isDev) {
    console.table(tableRows);
    return;
  }

  // Send paths to slack in prod
  sendSlackMessage(
    {
      blocks: slackBlocks.flat(),
    },
    'deals'
  ).catch((err) => eventEmitter.emit('error', err));

  // And update the Google Spreadsheet document
  const worksheet = spreadsheet.sheetsByIndex[0];
  worksheet.addRows(worksheetRows).catch((err) => eventEmitter.emit('error', err));
};

export default {
  log,
  error,
  paths,
};
