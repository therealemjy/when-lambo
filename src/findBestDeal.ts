import BigNumber from 'bignumber.js';

import { WETH } from '@src/tokens';
import { Token, Exchange, Deal } from '@src/types';

// Get the gas cost of a deal, in the currency (in decimals) of the traded
// token. Note that this logic only works because we're currently only trading
// for or from WETH decimals.
const getConvertedDealGasCost = (deal: Deal) => {
  if (deal.toToken.address === WETH.address) {
    // Since the traded token is in WETH, we can directly return the
    // estimated gas cost as it's already expressed in wei
    return deal.estimatedGasCost;
  }

  // Otherwise we convert the gas cost in the currency of the traded token
  const fromTokenDecimalPriceInToTokenDecimals = deal.toTokenDecimalAmount
    .dividedBy(deal.fromTokenDecimalAmount) // In this case, we know fromTokenDecimalAmount is expressed in wei
    .toFixed(0);

  return deal.estimatedGasCost.multipliedBy(fromTokenDecimalPriceInToTokenDecimals);
};

const findBestDeal = async ({
  refTokenDecimalAmount,
  refToken,
  tradedToken,
  exchanges,
  aggregators,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  refTokenDecimalAmount: BigNumber;
  refToken: Token;
  tradedToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  exchanges?: Exchange[];
  aggregators?: Exchange[];
}): Promise<Deal | undefined> => {
  // Check how many tradedToken (e.g.: DAI) decimals we get from trading the
  // provided refToken (e.g.: WETH) decimals amount, on all monitored exchanges
  const dealPromises = (exchanges || aggregators || []).map<Promise<Deal>>(async (exchange) => {
    const res = await exchange.getDecimalAmountOut({
      fromTokenDecimalAmount: refTokenDecimalAmount,
      fromToken: refToken,
      toToken: tradedToken,
    });

    // Apply maximum slippage allowance, which means any deal found is
    // calculated with the most pessimistic outcome (given our slippage
    // allowance). If we still yield a profit despite this, then we consider the
    // opportunity safe
    const pessimisticToTokenDecimalAmount = new BigNumber(
      res.decimalAmountOut.multipliedBy((100 - slippageAllowancePercent) / 100).toFixed(0)
    );

    return {
      timestamp: new Date(),
      exchange,
      fromToken: refToken,
      fromTokenDecimalAmount: refTokenDecimalAmount,
      toToken: tradedToken,
      toTokenDecimalAmount: pessimisticToTokenDecimalAmount,
      slippageAllowancePercent,
      estimatedGasCost: gasPriceWei.multipliedBy(res.estimatedGas),
      usedExchangeNames: res.usedExchangeNames,
    };
  });

  const dealsRes = await Promise.allSettled(dealPromises);

  const deals: Deal[] = dealsRes
    .filter((res) => res.status === 'fulfilled')
    // @ts-ignore Typescript's definition of Promise.allSettled isn't correct
    .map((res) => res.value);

  if (deals.length === 0) {
    return undefined;
  }

  // Find the highest amount of tradedToken decimals we can get from selling all
  // refTokenDecimalAmount
  const bestDeal = deals.reduce((currentBestDeal, deal) => {
    // We incorporate the total gas cost of the swap necessary to make the deal
    // by first calculating its price in the currency of the traded token, then
    // deducting it from the total amount of decimals received from the swap
    const dealRevenuesMinusGas = deal.toTokenDecimalAmount.minus(getConvertedDealGasCost(deal));
    const currentBestDealRevenuesMinusGas = currentBestDeal.toTokenDecimalAmount.minus(
      getConvertedDealGasCost(currentBestDeal)
    );

    return dealRevenuesMinusGas.isGreaterThan(currentBestDealRevenuesMinusGas) ? deal : currentBestDeal;
  }, deals[0]);

  return bestDeal;
};

export default findBestDeal;
