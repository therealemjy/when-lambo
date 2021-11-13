import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, Token, UsedExchangeNames } from '@src/types';

import findBestDeals from './findBestDeals';
import convertBigNumbersToStrings from './utils/convertBigNumbersToStrings';

const monitorPrices = async ({
  multicall,
  refToken,
  refTokenDecimalAmounts,
  tradedToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  multicall: Multicall;
  refToken: Token;
  refTokenDecimalAmounts: BigNumber[];
  tradedToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  exchanges: Exchange[];
}) => {
  // Find the highest amount of tradedToken decimals we can buy with each
  // refTokenDecimalAmount
  const bestBuyingDeals = await findBestDeals({
    multicall,
    refToken,
    refTokenDecimalAmounts,
    tradedToken,
    exchanges,
    slippageAllowancePercent,
    gasPriceWei,
  });

  if (!bestBuyingDeals.length) {
    return [];
  }

  // List exchanges used for each refTokenDecimalAmount
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
    refToken: tradedToken,
    refTokenDecimalAmounts: bestBuyingDeals.map((bestBuyingDeal) => bestBuyingDeal.toTokenDecimalAmount),
    tradedToken: refToken,
    exchanges,
    slippageAllowancePercent,
    gasPriceWei,
    usedExchangeNames,
  });

  if (!bestSellingDeals.length) {
    return [];
  }

  return [];
};

export default monitorPrices;
