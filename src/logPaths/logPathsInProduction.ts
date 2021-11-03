import { Path } from '@src/types';
import calculateProfit from '@src/utils/calculateProfit';
import sendSlackMessage from '@src/utils/sendSlackMessage';

const logPathsInProduction = async (paths: Path[]) => {
  const slackBlocks: any[] = [];

  for (const path of paths) {
    const gasCost = path[0].estimatedGasCost.plus(path[1].estimatedGasCost);

    const [profitDec, profitPercent] = calculateProfit({
      revenueDec: path[1].toTokenDecimalAmount,
      // Add gas cost to expense. Note that this logic only works because we
      // start and end the path with WETH
      expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });

    // Only log profitable paths
    if (profitDec.isGreaterThan(0)) {
      const borrowedDec = path[0].fromTokenDecimalAmount.toFixed();
      const boughtDec = path[0].toTokenDecimalAmount.toFixed();
      const profitDecAmount = profitDec.toFixed(0);
      const boughtDecBack = path[1].toTokenDecimalAmount.toFixed(0);
      const bestSellingExchange = path[0].exchange.name;
      const bestBuyingExchange = path[1].exchange.name;

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
              text: `*Profit (in ${path[0].fromToken.symbol} decimals):*\n${profitDecAmount}`,
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
  }

  if (slackBlocks.length > 0) {
    // Send alerts to slack
    await sendSlackMessage({
      blocks: slackBlocks.flat(),
    });
  }
};

export default logPathsInProduction;
