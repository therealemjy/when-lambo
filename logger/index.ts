import * as Sentry from '@sentry/node';
import Bunyan from 'bunyan';
import RotatingFileStream from 'bunyan-rotating-file-stream';
import 'console.table';
import { BigNumber } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { ExchangeIndex } from '@localTypes';

import eventEmitter from '@bot/src/eventEmitter';
import { WETH } from '@bot/src/tokens';
import { Trade } from '@bot/src/types';
import formatTimestamp from '@bot/src/utils/formatTimestamp';

import config from './config';
import sendSlackMessage from './sendSlackMessage';
import { WorksheetRow } from './types';

const bunyanLogger = Bunyan.createLogger({
  name: 'bot',
  serializers: Bunyan.stdSerializers,
  src: true,
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

  Sentry.init({
    dsn: config.sentryDNS,
    environment: config.environment,
  });
}

const log: typeof console.log = (...args) => {
  if (config.environment !== 'test') {
    bunyanLogger.info(...args);
  }
};

const error = (newError: unknown) => {
  bunyanLogger.error(newError);

  if (config.isProd) {
    Sentry.captureException(newError, {
      tags: {
        serverId: config.serverId,
      },
    });
  }
};

const _convertToHumanReadableAmount = (amount: BigNumber, tokenDecimals: number) => {
  let sign = '';
  let amountString = amount.toString();

  if (amountString[0] === '-') {
    sign = '-';
    amountString = amountString.substring(1);
  }

  if (amountString.length < tokenDecimals + 1) {
    const zerosToAddCount = tokenDecimals + 1 - amountString.length;
    let zeros = '';

    for (let z = 0; z < zerosToAddCount; z++) {
      zeros += '0';
    }

    amountString = zeros + amountString;
  }

  const periodIndex = amountString.length - tokenDecimals;
  return sign + amountString.substring(0, periodIndex) + '.' + amountString.substr(periodIndex);
};

const transaction = async ({
  trade,
  spreadsheet,
  transactionHash = 'None',
}: {
  trade: Trade;
  spreadsheet: GoogleSpreadsheet;
  transactionHash?: string;
}) => {
  const timestamp = formatTimestamp(trade.path[0].timestamp);
  const borrowedTokens = _convertToHumanReadableAmount(
    trade.path[0].fromTokenDecimalAmount,
    trade.path[0].fromToken.decimals
  );
  const boughtTokens = _convertToHumanReadableAmount(
    trade.path[0].toTokenDecimalAmount,
    trade.path[0].toToken.decimals
  );
  const revenues = _convertToHumanReadableAmount(trade.path[1].toTokenDecimalAmount, trade.path[1].toToken.decimals);

  const bestSellingExchangeName = ExchangeIndex[trade.path[0].exchangeIndex];
  const bestBuyingExchangeName = ExchangeIndex[trade.path[1].exchangeIndex];

  const gasCostETH = _convertToHumanReadableAmount(trade.totalGasCost, 18);
  const profitInTokens = _convertToHumanReadableAmount(trade.profitWethAmount, WETH.decimals);

  // Log paths in Slack and Google Spreadsheet in production
  if (config.isProd) {
    const slackBlock = [
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Transaction hash:*\n${transactionHash}`,
          },
          {
            type: 'mrkdwn',
            text: `*Block number:*\n${trade.blockNumber}`,
          },
          {
            type: 'mrkdwn',
            text: `*Timestamp:*\n${timestamp}`,
          },
          {
            type: 'mrkdwn',
            text: `*${trade.path[0].fromToken.symbol} borrowed:*\n${borrowedTokens}`,
          },
          {
            type: 'mrkdwn',
            text: `*Best selling exchange:*\n${bestSellingExchangeName}`,
          },
          {
            type: 'mrkdwn',
            text: `*${trade.path[0].toToken.symbol} bought:*\n${boughtTokens}`,
          },
          {
            type: 'mrkdwn',
            text: `*Best buying exchange:*\n${bestBuyingExchangeName}`,
          },
          {
            type: 'mrkdwn',
            text: `*${trade.path[0].fromToken.symbol} bought back:*\n${revenues}`,
          },
          {
            type: 'mrkdwn',
            text: `*Gas cost (in ETH):*\n${gasCostETH}`,
          },
          {
            type: 'mrkdwn',
            text: `*Profit (in ${trade.path[0].fromToken.symbol}):*\n${profitInTokens} (${trade.profitPercentage}%)`,
          },
        ],
      },
      {
        type: 'divider',
      },
    ];

    const worksheetRow: WorksheetRow = [
      timestamp,
      transactionHash,
      trade.blockNumber,
      +borrowedTokens,
      bestSellingExchangeName,
      trade.path[0].toToken.symbol,
      +boughtTokens,
      bestBuyingExchangeName,
      +revenues,
      +gasCostETH,
      +profitInTokens,
      `${trade.profitPercentage}%`,
    ];

    // And update the Google Spreadsheet document
    const worksheet = spreadsheet.sheetsByIndex[0];

    const res = await Promise.allSettled([
      // Send path to Slack
      sendSlackMessage({
        text: 'New transaction 😍',
        blocks: slackBlock.flat(),
      }),
      // Add row
      worksheet.addRows([worksheetRow]),
    ]);

    // Log eventual errors
    res.forEach((result) => {
      if (result.status === 'rejected') {
        eventEmitter.emit('error', result.reason);
      }
    });
  }
  // Log paths in the console in development
  else {
    const tableRow = {
      Timestamp: timestamp,
      'Block number': trade.blockNumber,
      [`${trade.path[0].fromToken.symbol} borrowed`]: borrowedTokens,
      'Best selling exchange': bestSellingExchangeName,
      [`${trade.path[0].toToken.symbol} bought`]: boughtTokens,
      'Best buying exchange': bestBuyingExchangeName,
      [`${trade.path[0].fromToken.symbol} bought back`]: revenues,
      'Gas cost (in ETH)': gasCostETH,
      [`Profit (in ${trade.path[0].fromToken.symbol})`]: profitInTokens,
      'Profit (%)': trade.profitPercentage + '%',
    };

    console.table([tableRow]);
  }
};

export default {
  log,
  error,
  transaction,
};
