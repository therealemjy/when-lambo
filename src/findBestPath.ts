import BigNumber from 'bignumber.js';

import { Token, Exchange, Path } from '@src/types';

import findBestDeal from './findBestDeal';

const findBestPath = async ({
  refTokenDecimalAmount,
  refToken,
  tradedToken,
  aggregators,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  refTokenDecimalAmount: BigNumber;
  refToken: Token;
  tradedToken: Token;
  aggregators: Exchange[];
  exchanges: Exchange[];
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
}): Promise<Path | undefined> => {
  // Find the highest amount of tradedToken decimals we can get from selling all
  // refTokenDecimalAmount
  const bestSellingDeal = await findBestDeal({
    refTokenDecimalAmount,
    refToken,
    tradedToken,
    aggregators, // New strategy: buy on aggregators, sell to exchanges' pools
    slippageAllowancePercent,
    gasPriceWei,
  });

  if (!bestSellingDeal) {
    return undefined;
  }

  // Find the highest amount of refToken decimals we can get back, considering
  // the gas cost of the operation, from selling all tradedToken decimals
  const bestBuyingDeal = await findBestDeal({
    refTokenDecimalAmount: bestSellingDeal.toTokenDecimalAmount,
    refToken: bestSellingDeal.toToken,
    tradedToken: bestSellingDeal.fromToken,
    // Remove the exchange we got the best selling deal from
    exchanges: exchanges.filter((exchange) => !bestSellingDeal.usedExchangeNames.includes(exchange.name)),
    slippageAllowancePercent,
    gasPriceWei,
  });

  if (!bestBuyingDeal) {
    return undefined;
  }

  // Return best path
  return [bestSellingDeal, bestBuyingDeal];
};

export default findBestPath;
