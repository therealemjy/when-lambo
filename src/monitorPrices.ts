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
  // @ts-ignore
  const sortedDeals = exchanges.reduce<Deal[]>((results, exchange) => {
    const updatedResults = [...results];

    console.log(exchange.name);

    const resultFormatter = resultFormatters[exchange.name];
    const formattedResults = resultFormatter(multicallRes.results[exchange.name]);

    console.log(formattedResults);

    // Go through each result of the exchange
    // @ts-ignore
    // const deals = multicallRes.results[exchange.name].callsReturnContext
    //   // Filter out unsuccessful calls
    //   .filter((callReturnContext) => callReturnContext.success)
    //   // Format each result and shape them into deals
    //   .forEach((callReturnContext) => {
    //     const formattedResult = resultFormatter(callReturnContext);
    //   });

    return updatedResults;
  }, []);

  return [];
};

export default monitorPrices;
