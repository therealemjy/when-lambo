import { ContractCallContext } from '@maxime.julian/ethereum-multicall';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import { BigNumber } from 'ethers';

import { GasEstimates } from '@localTypes';
import { address as wethAddress } from '@resources/thirdPartyContracts/mainnet/weth.json';

import { Exchange, ResultsFormatter, Token, Deal, UsedExchangeIndexes } from '@bot/src/types';

import { WETH } from './tokens';

// Get the gas cost of a deal, in the currency (in decimals) of the traded
// token. Note that this logic only works because we're currently only trading
// for or from WETH decimals.
const getConvertedDealGasCost = (deal: Deal) => {
  if (deal.toToken.address === WETH.address) {
    // Since the traded token is in WETH, we can directly return the estimated
    // gas cost as it's already expressed in wei
    return deal.gasCostEstimate;
  }

  // Otherwise we convert the gas cost in the currency of the traded token. In
  // this case, we know fromTokenDecimalAmount is expressed in wei
  const fromTokenDecimalPriceInToTokenDecimals = deal.toTokenDecimalAmount.div(deal.fromTokenDecimalAmount);

  return deal.gasCostEstimate.mul(fromTokenDecimalPriceInToTokenDecimals);
};

const findBestDeals = async ({
  multicall,
  fromTokenDecimalAmounts,
  fromToken,
  toToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
  gasEstimates,
  usedExchangeIndexes, // Reference of all the exchanges used to obtain each fromTokenDecimalAmount
}: {
  multicall: Multicall;
  fromTokenDecimalAmounts: BigNumber[];
  fromToken: Token;
  toToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  gasEstimates: GasEstimates;
  exchanges: Exchange[];
  usedExchangeIndexes?: UsedExchangeIndexes;
}) => {
  const resultsFormatters: {
    [key: string]: ResultsFormatter;
  } = {};

  // Get prices from all the exchanges
  const multicallContexts = exchanges.reduce<ContractCallContext[]>((contexts, exchange) => {
    const filteredFromTokenDecimalAmounts = !usedExchangeIndexes
      ? fromTokenDecimalAmounts
      : // If usedExchangeIndexes was provided, remove all the fromTokenDecimalAmounts
        // previously found on the exchange. We do this to prevent front-running
        // ourselves by buying from an exchange and selling to the same exchange
        // in the same path.
        fromTokenDecimalAmounts.filter(
          (fromTokenDecimalAmount) => usedExchangeIndexes[fromTokenDecimalAmount.toString()] !== exchange.index
        );

    const { context, resultsFormatter } = exchange.getDecimalAmountOutCallContext({
      callReference: exchange.name,
      fromTokenDecimalAmounts: filteredFromTokenDecimalAmounts,
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
      // the opportunity safe.
      const pessimisticToTokenDecimalAmount = formattedResult.toTokenDecimalAmount
        // We want to be able to use up to two decimals places when expressing,
        // but since BigNumber does not support decimal numbers then we
        // transform slippageAllowancePercent into an integer by multiplying it
        // by 100, then transform it back to it's original value by dividing it
        // by 100 (we end up dividing by 10000 since we're applying a
        // percentage)
        .mul((100 - slippageAllowancePercent) * 100)
        .div(10000);

      // Get estimated gas necessary to execute the swap. In the gas estimates
      // file, the traded token is used as a reference for each gas estimate,
      // which is why here we use the address of the token that's not WETH as a
      // reference.
      const refTokenAddress = fromToken.address === wethAddress ? toToken.address : fromToken.address;

      // TODO: add safe guard that logs an error in case the estimate wasn't
      // found
      const gasEstimate = BigNumber.from(gasEstimates[exchange.index][refTokenAddress]);

      const deal: Deal = {
        timestamp: new Date(),
        exchangeIndex: exchange.index,
        fromToken,
        fromTokenDecimalAmount: formattedResult.fromTokenDecimalAmount,
        toToken,
        toTokenDecimalAmount: pessimisticToTokenDecimalAmount,
        slippageAllowancePercent,
        gasEstimate,
        gasCostEstimate: gasPriceWei.mul(gasEstimate),
      };

      const currentBestDeal = bestDeals[formattedResult.fromTokenDecimalAmount.toString()];

      // If no best deal has been determined for the current
      // fromTokenDecimalAmount yet, we assign this deal as the current best
      if (!currentBestDeal) {
        bestDeals[formattedResult.fromTokenDecimalAmount.toString()] = deal;
        return;
      }

      // We incorporate the total gas cost of the swap necessary to make the
      // deal by first calculating its price in the currency of the traded
      // token, then deducting it from the total amount of decimals received
      // from the swap
      const dealRevenuesMinusGas = pessimisticToTokenDecimalAmount.sub(getConvertedDealGasCost(deal));
      const currentBestDealRevenuesMinusGas = currentBestDeal.toTokenDecimalAmount.sub(
        getConvertedDealGasCost(currentBestDeal)
      );

      // If the deal is better than the current best deal, we assign is as the
      // new best deal
      if (dealRevenuesMinusGas.gt(currentBestDealRevenuesMinusGas)) {
        bestDeals[formattedResult.fromTokenDecimalAmount.toString()] = deal;
      }
    });
  });

  // Return best deals in the form of an array, sorted in the same order as
  // fromTokenDecimalAmounts
  return Object.keys(bestDeals).map((key) => bestDeals[key]);
};

export default findBestDeals;
