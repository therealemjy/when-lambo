import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, Token, UsedExchangeNames } from '@src/types';

import findBestDeals from './findBestDeals';
import convertBigNumbersToStrings from './utils/convertBigNumbersToStrings';

const monitorPrices = async ({
  multicall,
  refTokenDecimalAmounts,
  refToken,
  tradedToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  multicall: Multicall;
  refTokenDecimalAmounts: BigNumber[];
  refToken: Token;
  tradedToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  exchanges: Exchange[];
}) => {
  // Find the highest amount of tradedToken decimals we can buy with each
  // refTokenDecimalAmount
  const bestBuyingDeals = await findBestDeals({
    multicall,
    refTokenDecimalAmounts,
    refToken,
    tradedToken,
    exchanges,
    slippageAllowancePercent,
    gasPriceWei,
  });

  if (!bestBuyingDeals.length) {
    return [];
  }

  console.log(bestBuyingDeals.map(convertBigNumbersToStrings));

  // List exchanges used for each refTokenDecimalAmount
  // @ts-ignore
  const usedExchangeNames = bestBuyingDeals.reduce<UsedExchangeNames>(
    (acc, bestBuyingDeal) => ({
      ...acc,
      [bestBuyingDeal.toTokenDecimalAmount.toFixed()]: bestBuyingDeal.exchangeName,
    }),
    {}
  );

  // Find the highest amount of refToken decimals we can get back from selling
  // each tradedToken decimals obtained from the selling deals
  const bestSellingDeals = await findBestDeals({
    multicall,
    refTokenDecimalAmounts: bestBuyingDeals.map((bestBuyingDeal) => bestBuyingDeal.toTokenDecimalAmount),
    refToken,
    tradedToken,
    exchanges,
    slippageAllowancePercent,
    gasPriceWei,
    usedExchangeNames,
  });

  if (!bestSellingDeals.length) {
    return [];
  }

  console.log(bestSellingDeals.map(convertBigNumbersToStrings));

  return [];
};

export default monitorPrices;
