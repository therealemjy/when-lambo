import Bunyan from 'bunyan';
import RotatingFileStream from 'bunyan-rotating-file-stream';
import 'console.table';
import { BigNumber } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE } from '@constants';
import { ExchangeIndex } from '@localTypes';

import config from '@bot/config';
import eventEmitter from '@bot/src/eventEmitter';
import { WETH } from '@bot/src/tokens';
import { Path } from '@bot/src/types';
import calculateProfit from '@bot/src/utils/calculateProfit';
import formatTimestamp from '@bot/src/utils/formatTimestamp';
import sendSlackMessage from '@bot/src/utils/sendSlackMessage';

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
}

const log: typeof console.log = (...args) => {
  if (config.environment !== 'test') {
    bunyanLogger.info(...args);
  }
};

const error: typeof console.error = (...args) => bunyanLogger.error(...args);

const _convertToHumanReadableAmount = (amount: BigNumber, _tokenDecimals: number) => {
  // TODO: refactor

  return amount.toString();
  // let amountString = amount.toString();

  // console.log('amountString', amountString);
  // console.log('amountString.length', amountString.length);
  // console.log('tokenDecimals', tokenDecimals);
  // if (amountString.length < tokenDecimals + 1) {
  //   const zerosToAddCount = tokenDecimals + 1 - amountString.length;
  //   const zeros = new Array(zerosToAddCount).reduce((acc) => `${acc}0`, '');
  //   console.log(amountString, zeros);
  //   amountString = zeros + amountString;
  // }

  // const periodIndex = amountString.length - tokenDecimals;

  // return amountString.substr(0, periodIndex) + amountString.substr(periodIndex);
};

const transaction = async ({
  blockNumber,
  path,
  maxFeePerGas,
  spreadsheet,
  transactionHash = 'None',
}: {
  blockNumber: number;
  path: Path;
  maxFeePerGas: number;
  spreadsheet: GoogleSpreadsheet;
  transactionHash?: string;
}) => {
  const timestamp = formatTimestamp(path[0].timestamp);
  const borrowedTokens = _convertToHumanReadableAmount(path[0].fromTokenDecimalAmount, path[0].fromToken.decimals);
  const boughtTokens = _convertToHumanReadableAmount(path[0].toTokenDecimalAmount, path[0].toToken.decimals);
  const revenues = _convertToHumanReadableAmount(path[1].toTokenDecimalAmount, path[1].toToken.decimals);

  const bestSellingExchangeName = ExchangeIndex[path[0].exchangeIndex];
  const bestBuyingExchangeName = ExchangeIndex[path[1].exchangeIndex];

  // TODO: refactor so the gas cost is passed rather than calculated, since it's been calculated
  // before already
  const gasCost = path[0].gasEstimate
    .add(path[1].gasEstimate)
    // Add estimated gas to trade with Transactor (without accounting for the swap themselves)
    .add(TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE)
    // Add gasLimit margin
    .mul(config.gasLimitMultiplicator * 100)
    .div(100)
    // Multiply by max fee per gas to get total gas cost
    .mul(maxFeePerGas);

  const gasCostWETH = _convertToHumanReadableAmount(gasCost, WETH.decimals);

  const [profitDec, profitPercent] = calculateProfit({
    revenueDec: path[1].toTokenDecimalAmount,
    // Add gas cost to expense. Note that this logic only works because we
    // start and end the path with WETH
    expenseDec: path[0].fromTokenDecimalAmount.add(gasCost),
  });

  const profitInTokens = _convertToHumanReadableAmount(profitDec, path[0].fromToken.decimals);

  // Log paths in Slack and Google Spreadsheet in production
  if (config.isDev) {
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
            text: `*Block number:*\n${blockNumber}`,
          },
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
            text: `*Gas cost (in ETH):*\n${gasCost}`,
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
    ];

    const worksheetRow: WorksheetRow = [
      timestamp,
      transactionHash,
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
    ];

    // And update the Google Spreadsheet document
    const worksheet = spreadsheet.sheetsByIndex[0];

    const res = await Promise.allSettled([
      // Send path to Slack
      sendSlackMessage(
        {
          blocks: slackBlock.flat(),
        },
        'deals'
      ),
      // Add row
      worksheet.addRow(worksheetRow),
    ]);

    console.log('res', res);

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
      'Block number': blockNumber,
      [`${path[0].fromToken.symbol} borrowed`]: borrowedTokens,
      'Best selling exchange': bestSellingExchangeName,
      [`${path[0].toToken.symbol} bought`]: boughtTokens,
      'Best buying exchange': bestBuyingExchangeName,
      [`${path[0].fromToken.symbol} bought back`]: revenues,
      'Gas cost (in ETH)': gasCostWETH,
      [`Profit (in ${path[0].fromToken.symbol})`]: profitInTokens,
      'Profit (%)': profitPercent + '%',
    };

    console.table([tableRow]);
  }
};

export default {
  log,
  error,
  transaction,
};
