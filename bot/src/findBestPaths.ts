import { Multicall } from '@maxime.julian/ethereum-multicall';
import { BigNumber } from 'ethers';

import { GasEstimates, Token } from '@localTypes';

import { Exchange, UsedExchangeIndexes, Path } from '@bot/src/types';

import findBestDeals from './findBestDeals';

type FindBestPathsArgs = {
  multicall: Multicall;
  fromToken: Token;
  fromTokenDecimalAmounts: BigNumber[];
  toToken: Token;
  slippageAllowancePercent: number;
  maxFeePerGas: number;
  exchanges: Exchange[];
  gasEstimates: GasEstimates;
};

const findBestPaths = async ({
  multicall,
  fromToken,
  fromTokenDecimalAmounts,
  toToken,
  exchanges,
  slippageAllowancePercent,
  maxFeePerGas,
  gasEstimates,
}: FindBestPathsArgs) => {
  // Find the highest amount of toToken decimals we can buy with each
  // fromTokenDecimalAmount
  const bestBuyingDeals = await findBestDeals({
    multicall,
    fromToken,
    fromTokenDecimalAmounts,
    toToken,
    exchanges,
    slippageAllowancePercent,
    maxFeePerGas,
    gasEstimates,
  });

  if (!bestBuyingDeals.length) {
    return [];
  }

  // List exchanges used for each fromTokenDecimalAmount
  const usedExchangeIndexes = bestBuyingDeals.reduce<UsedExchangeIndexes>(
    (acc, bestBuyingDeal) => ({
      ...acc,
      [bestBuyingDeal.toTokenDecimalAmount.toString()]: bestBuyingDeal.exchangeIndex,
    }),
    {}
  );

  // Find the highest amount of fromToken decimals we can get back from selling
  // each toToken decimals obtained from the selling deals
  const bestSellingDeals = await findBestDeals({
    multicall,
    fromToken: toToken,
    fromTokenDecimalAmounts: bestBuyingDeals.map((bestBuyingDeal) => bestBuyingDeal.toTokenDecimalAmount),
    toToken: fromToken,
    exchanges,
    slippageAllowancePercent,
    maxFeePerGas,
    gasEstimates,
    usedExchangeIndexes,
  });

  if (!bestSellingDeals.length) {
    return [];
  }

  // Compose best paths
  const bestPaths = bestBuyingDeals.reduce<Path[]>((paths, bestBuyingDeal) => {
    // Find corresponding best selling deal
    const correspondingBestSellingDeal = bestSellingDeals.find((bestSellingDeal) =>
      bestSellingDeal.fromTokenDecimalAmount.eq(bestBuyingDeal.toTokenDecimalAmount)
    );

    if (!correspondingBestSellingDeal) {
      return paths;
    }

    const path: Path = [bestBuyingDeal, correspondingBestSellingDeal];
    return [...paths, path];
  }, []);

  return bestPaths;
};

export default findBestPaths;
