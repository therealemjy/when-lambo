import { ContractCallContext } from '@maxime.julian/ethereum-multicall';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, ResultsFormatter, Token, Deal, UsedExchangeNames } from '@src/types';

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

const findBestDeals = async ({
  multicall,
  fromTokenDecimalAmounts,
  fromToken,
  toToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
  usedExchangeNames, // Reference of all the exchanges used to obtain each fromTokenDecimalAmount
}: {
  multicall: Multicall;
  fromTokenDecimalAmounts: BigNumber[];
  fromToken: Token;
  toToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  exchanges: Exchange[];
  usedExchangeNames?: UsedExchangeNames;
}) => {
  const resultsFormatters: {
    [key: string]: ResultsFormatter;
  } = {};

  // Get prices from all the exchanges
  const multicallContexts = exchanges.reduce<ContractCallContext[]>((contexts, exchange) => {
    const filteredfromTokenDecimalAmounts = !usedExchangeNames
      ? fromTokenDecimalAmounts
      : // If usedExchangeNames was provided, remove all the fromTokenDecimalAmounts
        // previously found on the exchange. We do this to prevent front-running
        // ourselves by buying from an exchange and selling to the same exchange
        // in the same path.
        fromTokenDecimalAmounts.filter(
          (fromTokenDecimalAmount) => usedExchangeNames[fromTokenDecimalAmount.toFixed()] !== exchange.name
        );

    const { context, resultsFormatter } = exchange.getDecimalAmountOutCallContext({
      callReference: exchange.name,
      fromTokenDecimalAmounts: filteredfromTokenDecimalAmounts,
      fromToken,
      toToken,
    });

    resultsFormatters[exchange.name] = resultsFormatter;
    return [...contexts, context];
  }, []);

  const multicallRes = await multicall.call(multicallContexts, {
    gasLimit: 999999999999999, // Add stupid value to prevent issues with view functions running out of gas
  });

  // Find the best deal for each fromTokenDecimalAmount
  const bestDeals: {
    [key: string]: Deal;
  } = {};

  exchanges.forEach((exchange) => {
    // Skip exchange if none of the results were found using it
    if (!multicallRes.results[exchange.name]) {
      return;
    }

    // Format results
    const resultsFormatter = resultsFormatters[exchange.name];
    const formattedResults = resultsFormatter(multicallRes.results[exchange.name], { fromToken, toToken });

    // Go through each result to find the best deal for each fromTokenDecimalAmount
    formattedResults.forEach((formattedResult) => {
      // Apply maximum slippage allowance, which means any deal found is
      // calculated with the most pessimistic outcome (given our slippage
      // allowance). If we still yield a profit despite this, then we consider
      // the opportunity safe
      const pessimisticToTokenDecimalAmount = new BigNumber(
        formattedResult.toTokenDecimalAmount.multipliedBy((100 - slippageAllowancePercent) / 100).toFixed(0)
      );

      const deal = {
        timestamp: new Date(),
        exchangeName: exchange.name,
        fromToken: formattedResult.fromToken,
        fromTokenDecimalAmount: formattedResult.fromTokenDecimalAmount,
        toToken: formattedResult.toToken,
        toTokenDecimalAmount: pessimisticToTokenDecimalAmount,
        slippageAllowancePercent,
        estimatedGasCost: gasPriceWei.multipliedBy(formattedResult.estimatedGas),
      };

      const currentBestDeal = bestDeals[formattedResult.fromTokenDecimalAmount.toFixed()];

      // If no best deal has been determined for the current
      // fromTokenDecimalAmount, we assign this deal as the best
      if (!currentBestDeal) {
        bestDeals[formattedResult.fromTokenDecimalAmount.toFixed()] = deal;
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
        bestDeals[formattedResult.fromTokenDecimalAmount.toFixed()] = deal;
      }
    });
  });

  // Return best deals in the form of an array, sorted in the same order as the
  // fromTokenDecimalAmounts
  return Object.keys(bestDeals).map((key) => bestDeals[key]);
};

export default findBestDeals;
