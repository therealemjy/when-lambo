import { ContractCallContext } from '@maxime.julian/ethereum-multicall';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, ResultFormatter, Token, Deal } from '@src/types';

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

  // Format each result into a deal and sort them by the amount of decimals obtained from it
  const sortedDeals = exchanges.reduce<Deal[]>((deals, exchange) => {
    const updatedDeals = [...deals];

    console.log(exchange.name);

    const resultFormatter = resultFormatters[exchange.name];
    const formattedResults = resultFormatter(multicallRes.results[exchange.name]);

    formattedResults.forEach((formattedResult, resultIndex) => {
      // Apply maximum slippage allowance, which means any deal found is
      // calculated with the most pessimistic outcome (given our slippage
      // allowance). If we still yield a profit despite this, then we consider the
      // opportunity safe
      const pessimisticToTokenDecimalAmount = new BigNumber(
        formattedResult.decimalAmountOut.multipliedBy((100 - slippageAllowancePercent) / 100).toFixed(0)
      );

      updatedDeals.push({
        timestamp: new Date(),
        exchangeName: exchange.name,
        fromToken: refToken,
        fromTokenDecimalAmount: refTokenDecimalAmounts[resultIndex],
        toToken: tradedToken,
        toTokenDecimalAmount: pessimisticToTokenDecimalAmount,
        slippageAllowancePercent,
        estimatedGasCost: gasPriceWei.multipliedBy(formattedResult.estimatedGas),
      });
    });

    return updatedDeals;
  }, []);

  console.log(sortedDeals);

  return [];
};

export default monitorPrices;
