import BigNumber from 'bignumber.js';

import { Token, Exchange, Path } from '@src/types';

import findBestDeal from './findBestDeal';

const findBestPath = async ({
  refTokenDecimalAmount,
  refToken,
  tradedToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  refTokenDecimalAmount: BigNumber;
  refToken: Token;
  tradedToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  exchanges: Exchange[];
}): Promise<Path | undefined> => {
  // Find the highest amount of tradedToken decimals we can get from selling all
  // refTokenDecimalAmount
  const bestSellingDeal = await findBestDeal({
    refTokenDecimalAmount,
    refToken,
    tradedToken,
    exchanges,
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
    // Remove the exchanges used in the best deal
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
