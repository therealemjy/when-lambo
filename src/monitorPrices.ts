import { ContractCallContext } from '@maxime.julian/ethereum-multicall';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, ResultFormatter, Token, Deal } from '@src/types';

import { WETH } from './tokens';

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
  // Get prices from all the exchanges
  const resultFormatters: {
    [key: string]: ResultFormatter;
  } = {};

  const multicallContexts = exchanges.reduce<ContractCallContext[]>((contexts, exchange) => {
    const { context, resultFormatter } = exchange.getDecimalAmountOutCallContext({
      callReference: exchange.name,
      fromTokenDecimalAmounts: refTokenDecimalAmounts,
      fromToken: refToken,
      toToken: tradedToken,
    });

    resultFormatters[exchange.name] = resultFormatter;
    return [...contexts, context];
  }, []);

  const multicallRes = await multicall.call(multicallContexts, {
    gasLimit: 999999999999999, // Add stupid value to prevent issues with view functions running out of gas
  });

  // Find the best deal for each refTokenDecimalAmount
  const bestDeals: {
    [key: string]: Deal;
  } = {};

  exchanges.forEach((exchange) => {
    // Format results
    const resultFormatter = resultFormatters[exchange.name];
    const formattedResults = resultFormatter(multicallRes.results[exchange.name]);

    // Go through each result to find the best deal for each refTokenDecimalAmount
    formattedResults.forEach((formattedResult, resultIndex) => {
      // Apply maximum slippage allowance, which means any deal found is
      // calculated with the most pessimistic outcome (given our slippage
      // allowance). If we still yield a profit despite this, then we consider
      // the opportunity safe
      const pessimisticToTokenDecimalAmount = new BigNumber(
        formattedResult.decimalAmountOut.multipliedBy((100 - slippageAllowancePercent) / 100).toFixed(0)
      );

      const fromTokenDecimalAmount = refTokenDecimalAmounts[resultIndex];

      const deal = {
        timestamp: new Date(),
        exchangeName: exchange.name,
        fromToken: refToken,
        fromTokenDecimalAmount,
        toToken: tradedToken,
        toTokenDecimalAmount: pessimisticToTokenDecimalAmount,
        slippageAllowancePercent,
        estimatedGasCost: gasPriceWei.multipliedBy(formattedResult.estimatedGas),
      };

      const currentBestDeal = bestDeals[fromTokenDecimalAmount.toFixed()];

      // If no best deal has been determined for the current
      // refTokenDecimalAmount, we assign this deal as the best
      if (!currentBestDeal) {
        bestDeals[fromTokenDecimalAmount.toFixed()] = deal;
        return;
      }

      // We incorporate the total gas cost of the swap necessary to make the
      // deal by first calculating its price in the currency of the traded
      // token, then deducting it from the total amount of decimals received
      // from the swap
      const dealRevenuesMinusGas = pessimisticToTokenDecimalAmount.minus(getConvertedDealGasCost(deal));
      const currentBestDealRevenuesMinusGas = currentBestDeal.toTokenDecimalAmount.minus(
        getConvertedDealGasCost(currentBestDeal)
      );

      // If the deal is better than the current best deal, we assign is as the
      // best deal
      if (dealRevenuesMinusGas.isGreaterThan(currentBestDealRevenuesMinusGas)) {
        bestDeals[fromTokenDecimalAmount.toFixed()] = deal;
      }
    });
  });

  console.log(bestDeals);

  return [];
};

export default monitorPrices;
