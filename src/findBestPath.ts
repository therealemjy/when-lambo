import BigNumber from 'bignumber.js';

import { Token, Exchange, Path } from '@src/types';

import findBestDeal from './findBestDeal';

const findBestPath = async ({
  refTokenDecimalAmount,
  refToken,
  tradedToken,
  exchanges,
}: {
  refTokenDecimalAmount: BigNumber;
  refToken: Token;
  tradedToken: Token;
  exchanges: Exchange[];
}): Promise<Path | undefined> => {
  // Find the highest amount of tradedToken decimals we can get from selling all
  // refTokenDecimalAmount
  const bestSellingDeal = await findBestDeal({
    refTokenDecimalAmount,
    refToken,
    tradedToken,
    exchanges,
  });

  if (!bestSellingDeal) {
    return undefined;
  }

  // TODO: we should apply a safe slippage to each value so that the final
  // calculated profit is safer

  // Find the highest amount of refToken decimals we can get back from selling
  // all tradedToken decimals
  const bestBuyingDeal = await findBestDeal({
    refTokenDecimalAmount: bestSellingDeal.toTokenDecimalAmount,
    refToken: bestSellingDeal.toToken,
    tradedToken: bestSellingDeal.fromToken,
    exchanges,
  });

  if (!bestBuyingDeal) {
    return undefined;
  }

  // TODO: we should apply a safe slippage to each value so that the final
  // calculated profit is safer

  // Return best path
  return [bestSellingDeal, bestBuyingDeal];
};

export default findBestPath;
