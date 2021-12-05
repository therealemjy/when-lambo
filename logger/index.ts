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

const path = async (blockNumber: string, pathToLog: Path, spreadsheet: GoogleSpreadsheet) => {
  const timestamp = formatTimestamp(pathToLog[0].timestamp);
  const borrowedTokens = _convertToHumanReadableAmount(
    pathToLog[0].fromTokenDecimalAmount,
    pathToLog[0].fromToken.decimals
  );
  const boughtTokens = _convertToHumanReadableAmount(pathToLog[0].toTokenDecimalAmount, pathToLog[0].toToken.decimals);
  const revenues = _convertToHumanReadableAmount(pathToLog[1].toTokenDecimalAmount, pathToLog[1].toToken.decimals);

  const bestSellingExchangeName = ExchangeIndex[pathToLog[0].exchangeIndex];
  const bestBuyingExchangeName = ExchangeIndex[pathToLog[1].exchangeIndex];

  const gasCost = pathToLog[0].estimatedGasCost
    .plus(pathToLog[1].estimatedGasCost)
    // Add estimated gas to trade with Transactor (without accounting for the swap themselves)
    .plus(TRADE_GAS_ESTIMATE_WITHOUT_SWAPS)
    // Add gasLimit margin
    .multipliedBy(config.gasLimitMultiplicator);
  const gasCostWETH = _convertToHumanReadableAmount(gasCost, WETH.decimals);

  const [profitDec, profitPercent] = calculateProfit({
    revenueDec: pathToLog[1].toTokenDecimalAmount,
    // Add gas cost to expense. Note that this logic only works because we
    // start and end the path with WETH
    expenseDec: pathToLog[0].fromTokenDecimalAmount.plus(gasCost),
  });

  const profitInTokens = _convertToHumanReadableAmount(profitDec, pathToLog[0].fromToken.decimals);

  // Log paths in Slack and Google Spreadsheet in production
  if (config.isProd) {
    const slackBlock = [
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Timestamp:*\n${timestamp}`,
          },
          {
            type: 'mrkdwn',
            text: `*${pathToLog[0].fromToken.symbol} borrowed:*\n${borrowedTokens}`,
          },
          {
            type: 'mrkdwn',
            text: `*Best selling exchange:*\n${bestSellingExchangeName}`,
          },
          {
            type: 'mrkdwn',
            text: `*${pathToLog[0].toToken.symbol} bought:*\n${boughtTokens}`,
          },
          {
            type: 'mrkdwn',
            text: `*Best buying exchange:*\n${bestBuyingExchangeName}`,
          },
          {
            type: 'mrkdwn',
            text: `*${pathToLog[0].fromToken.symbol} bought back:*\n${revenues}`,
          },
          {
            type: 'mrkdwn',
            text: `*Gas cost (in wei):*\n${gasCost}`,
          },
          {
            type: 'mrkdwn',
            text: `*Profit (in ${pathToLog[0].fromToken.symbol}):*\n${profitInTokens}`,
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
    ];

    // Send path to Slack
    sendSlackMessage(
      {
        blocks: slackBlock.flat(),
      },
      'deals'
    ).catch((err) => eventEmitter.emit('error', err));

    // Add row
    const worksheetRow: WorksheetRow = [
      timestamp,
      blockNumber,
      +borrowedTokens,
      bestSellingExchangeName,
      pathToLog[0].toToken.symbol,
      +boughtTokens,
      bestBuyingExchangeName,
      +revenues,
      +gasCostWETH,
      +profitInTokens,
      `${profitPercent}%`,
    ];

    // And update the Google Spreadsheet document
    const worksheet = spreadsheet.sheetsByIndex[0];
    worksheet.addRow(worksheetRow).catch((err) => eventEmitter.emit('error', err));
  }

  // Log paths in the console in development
  if (config.isDev) {
    const tableRow = {
      Timestamp: timestamp,
      'Block number': blockNumber,
      [`${pathToLog[0].fromToken.symbol} borrowed`]: borrowedTokens,
      'Best selling exchange': bestSellingExchangeName,
      [`${pathToLog[0].toToken.symbol} bought`]: boughtTokens,
      'Best buying exchange': bestBuyingExchangeName,
      [`${pathToLog[0].fromToken.symbol} bought back`]: revenues,
      'Gas cost (in WETH)': gasCostWETH,
      [`Profit (in ${pathToLog[0].fromToken.symbol})`]: profitInTokens,
      'Profit (%)': profitPercent + '%',
    };

    console.table(tableRow);
  }
};

export default {
  log,
  error,
  path,
};
