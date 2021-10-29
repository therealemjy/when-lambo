import BigNumber from 'bignumber.js';

import { Token, Exchange, Deal, Path } from '@src/types';

const findBestPath = async (
  {
    refTokenDecimalAmount,
    refToken,
    tradedToken,
  }: {
    refTokenDecimalAmount: BigNumber;
    refToken: Token;
    tradedToken: Token;
  },
  exchanges: Array<{
    name: string;
    service: Exchange;
  }>
): Promise<Path | undefined> => {
  // Check how many tradedToken (e.g.: DAI) decimals we get from trading the
  // provided refToken (e.g.: WETH) decimals amount, on all monitored exchanges
  const sellingPromises = exchanges.map<Promise<Deal>>(async (exchange) => {
    const decimalAmount = await exchange.service.getDecimalAmountOut({
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

  const sellingDealsRes = await Promise.allSettled(sellingPromises).catch((error) =>
    console.error('Error while fetching selling prices', error)
  );

  if (!sellingDealsRes) {
    return;
  }

  const sellingDeals = sellingDealsRes
    .filter((res) => res.status === 'fulfilled')
    // @ts-ignore Typescript's definition of Promise.allSettled isn't correct
    .map((res) => res.value);

  // Find the highest amount of tradedToken decimals we can get from selling all
  // refTokenDecimalAmount
  const bestSellingDeal = sellingDeals.reduce((currentBestSellingDeal, sellingDeal) => {
    return sellingDeal.toTokenDecimalAmount.isGreaterThan(currentBestSellingDeal.toTokenDecimalAmount)
      ? sellingDeal
      : currentBestSellingDeal;
  }, sellingDeals[0]);

  // TODO: we should apply a safe slippage to each value so that the final
  // calculated profit is safer

  // Check which platform gives us the highest amount of refToken decimals back
  // from selling all our tradedToken decimals
  const buyingPromises = exchanges
    // Remove exchange the best selling deal was found on
    .filter((exchange) => exchange.name !== bestSellingDeal.exchangeName)
    .map(async (exchange) => {
      const decimalAmount = await exchange.service.getDecimalAmountOut({
        fromTokenDecimalAmount: bestSellingDeal.toTokenDecimalAmount,
        fromToken: tradedToken,
        toToken: refToken,
      });

      return {
        exchangeName: exchange.name,
        fromToken: tradedToken,
        fromTokenDecimalAmount: bestSellingDeal.fromTokenDecimalAmount,
        toToken: refToken,
        toTokenDecimalAmount: decimalAmount,
      };
    });

  const buyingDealsRes = await Promise.allSettled(buyingPromises);

  const buyingDeals = buyingDealsRes
    .filter((res) => res.status === 'fulfilled')
    // @ts-ignore Typescript's definition of Promise.allSettled isn't correct
    .map((res) => res.value);

  // Find the highest amount of refToken decimals we can get back from selling
  // all tradedToken decimals
  const bestBuyingDeal = buyingDeals.reduce((currentBestBuyingDeal, buyingDeal) => {
    return buyingDeal.toTokenDecimalAmount.isGreaterThan(currentBestBuyingDeal.toTokenDecimalAmount)
      ? buyingDeal
      : currentBestBuyingDeal;
  }, buyingDeals[0]);

  // Return best path
  return [bestSellingDeal, bestBuyingDeal];
};

export default findBestPath;
