import BigNumber from 'bignumber.js';

import { Exchange } from '@src/exchanges/types';
import calculateProfit from '@src/utils/calculateProfit';

import findBestPath from './findBestPath';
import { Token, Path } from './types';

// import { sendSlackMessage } from './utils/sendSlackMessage';

let isMonitoring = false;

const monitorPrices = async (
  {
    refTokenDecimalAmounts,
    refToken,
    tradedToken,
  }: {
    refTokenDecimalAmounts: BigNumber[];
    refToken: Token;
    tradedToken: Token;
  },
  exchanges: Array<{
    name: string;
    service: Exchange;
  }>
) => {
  if (isMonitoring) {
    console.log('Block skipped! Price monitoring ongoing.');
    return;
  }

  isMonitoring = true;

  const paths = await Promise.all(
    refTokenDecimalAmounts.map((refTokenDecimalAmount) =>
      findBestPath(
        {
          refTokenDecimalAmount,
          refToken,
          tradedToken,
        },
        exchanges
      )
    )
  );

  isMonitoring = false;

  const validPaths = paths.filter((path): path is Path => path !== undefined);

  const tableLogs: any[] = [];
  const slackBlocks: any[] = [];

  // Calculate profits
  for (const path of validPaths) {
    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      expenseDec: path[0].fromTokenDecimalAmount,
    });

    const decBorrowed = path[0].fromTokenDecimalAmount.toFixed();
    const decBought = path[0].toTokenDecimalAmount.toFixed();
    const decProfit = profitDec.toFixed(0);
    const decBoughtBack = path[1].toTokenDecimalAmount.toFixed(0);
    const bestSellingExchange = path[0].exchangeName;
    const bestBuyingExchange = path[1].exchangeName;

    tableLogs.push({
      [`${refToken.symbol} decimals borrowed`]: decBorrowed,
      'Best selling exchange': bestSellingExchange,
      [`${tradedToken.symbol} decimals bought`]: decBought,
      'Best buying exchange': bestBuyingExchange,
      [`${refToken.symbol} decimals bought back`]: decBoughtBack,
      [`Profit (in ${refToken.symbol} decimals)`]: decProfit,
      'Profit (%)': profitPercent + '%',
    });

    slackBlocks.push([
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*${refToken.symbol} decimals borrowed:*\n${decBorrowed}`,
          },
          {
            type: 'mrkdwn',
            text: `*Best selling exchange:*\n${bestSellingExchange}`,
          },
          {
            type: 'mrkdwn',
            text: `*${tradedToken.symbol} decimals bought:*\n${decBought}`,
          },
          {
            type: 'mrkdwn',
            text: `*Best buying exchange:*\n${bestBuyingExchange}`,
          },
          {
            type: 'mrkdwn',
            text: `*${refToken.symbol} decimals bought back:*\n${decBoughtBack}`,
          },
          {
            type: 'mrkdwn',
            text: `*Profit (in ${refToken.symbol} decimals):*\n${decProfit}`,
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

  // Log in local
  console.table(tableLogs);

  // Send alerts to slack
  // await sendSlackMessage({
  //   blocks: slackBlocks.flat(),
  // });
};

export default monitorPrices;
