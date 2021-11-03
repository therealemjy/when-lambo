import BigNumber from 'bignumber.js';

import { Token, Exchange, Deal } from '@src/types';

const findBestDeal = async ({
  refTokenDecimalAmount,
  refToken,
  tradedToken,
  exchanges,
}: {
  refTokenDecimalAmount: BigNumber;
  refToken: Token;
  tradedToken: Token;
  exchanges: Exchange[];
}): Promise<Deal | undefined> => {
  // Check how many tradedToken (e.g.: DAI) decimals we get from trading the
  // provided refToken (e.g.: WETH) decimals amount, on all monitored exchanges
  const dealPromises = exchanges.map<Promise<Deal>>(async (exchange) => {
    const decimalAmount = await exchange.getDecimalAmountOut({
      fromTokenDecimalAmount: refTokenDecimalAmount,
      fromToken: refToken,
      toToken: tradedToken,
    });

    return {
      timestamp: new Date(),
      exchangeName: exchange.name,
      fromToken: refToken,
      fromTokenDecimalAmount: refTokenDecimalAmount,
      toToken: tradedToken,
      toTokenDecimalAmount: decimalAmount,
    };
  });

  const dealsRes = await Promise.allSettled(dealPromises);

  const deals = dealsRes
    .filter((res) => res.status === 'fulfilled')
    // @ts-ignore Typescript's definition of Promise.allSettled isn't correct
    .map((res) => res.value);

  // Find the highest amount of tradedToken decimals we can get from selling all
  // refTokenDecimalAmount
  const bestDeal: Deal = deals.reduce((currentBestDeal, deal) => {
    return deal.toTokenDecimalAmount.isGreaterThan(currentBestDeal.toTokenDecimalAmount) ? deal : currentBestDeal;
  }, deals[0]);

  return bestDeal;
};

export default findBestDeal;
