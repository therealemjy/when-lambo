import BigNumber from 'bignumber.js';

import { Token, Exchange, Deal } from '@src/types';

const findBestPath = async (
  {
    refTokenDecimalAmount,
    refToken,
    tradedToken,
  }: {
    refTokenDecimalAmount: BigNumber;
    refToken: Token;
    tradedToken: Token;
  },
  exchanges: Array<{
    name: string;
    service: Exchange;
  }>
) => {
  // Check how many tradedToken (e.g.: DAI) decimals we get from trading the
  // provided refToken (e.g.: WETH) decimals amount, on all monitored exchanges
  const sellingPromises = exchanges.map<Promise<Deal>>(async (exchange) => {
    const decimalAmount = await exchange.service.getDecimalAmountOut({
      fromTokenDecimalAmount: refTokenDecimalAmount,
      fromToken: refToken,
      toToken: tradedToken,
    });

    return {
      exchangeName: exchange.name,
      fromToken: refToken,
      fromTokenDecimalAmount: refTokenDecimalAmount,
      toToken: tradedToken,
      toTokenDecimalAmount: decimalAmount,
    };
  });

  // TODO: use something else than Promise.all so if some of the requests fail
  // then the other ones are still executed
  const sellingDeals = await Promise.all(sellingPromises).catch((error) =>
    console.error('Error while fetching selling prices', error)
  );

  if (!sellingDeals) {
    return;
  }
  console.log('ALL SELLING DEALS');
  console.log(JSON.parse(JSON.stringify(sellingDeals)));

  // Find the highest amount of tradedToken decimals we can get from selling all
  // refTokenDecimalAmount
  const bestSellingDeal = sellingDeals.reduce((currentBestSellingDeal, sellingDeal) => {
    return sellingDeal.toTokenDecimalAmount.isGreaterThan(currentBestSellingDeal.toTokenDecimalAmount)
      ? sellingDeal
      : currentBestSellingDeal;
  }, sellingDeals[0]);

  console.log('BEST SELLING DEAL');
  console.log(JSON.parse(JSON.stringify(bestSellingDeal)));

  // TODO: we should apply a safe slippage to each value so that the final
  // calculated profit is safer

  // Check which platform gives us the highest amount of refToken decimals back
  // from selling all our tradedToken decimals
  const buyingPromises = exchanges
    // Remove exchange the best selling deal was found on
    .filter((exchange) => exchange.name !== bestSellingDeal.exchangeName)
    .map(async (exchange) => {
      const decimalAmount = await exchange.service.getDecimalAmountOut({
        fromTokenDecimalAmount: bestSellingDeal.toTokenDecimalAmount,
        fromToken: tradedToken,
        toToken: refToken,
      });

      return {
        exchangeName: exchange.name,
        fromToken: tradedToken,
        fromTokenDecimalAmount: bestSellingDeal.fromTokenDecimalAmount,
        toToken: refToken,
        toTokenDecimalAmount: decimalAmount,
      };
    });

  const buyingDeals = await Promise.all(buyingPromises);

  console.log('ALL BUYING DEALS');
  console.log(JSON.parse(JSON.stringify(buyingDeals)));

  // Find the highest amount of refToken decimals we can get back from selling
  // all tradedToken decimals
  const bestBuyingDeal = buyingDeals.reduce((currentBestBuyingDeal, buyingDeal) => {
    return buyingDeal.toTokenDecimalAmount.isGreaterThan(currentBestBuyingDeal.toTokenDecimalAmount)
      ? buyingDeal
      : currentBestBuyingDeal;
  }, buyingDeals[0]);

  console.log('BEST BUYING DEAL');
  console.log(JSON.parse(JSON.stringify(bestBuyingDeal)));

  // TODO: we should apply a safe slippage to each value so that the final
  // calculated profit is safer

  // isMonitoring = false;

  // // Calculate profits
  // const table = buyingDeals.map((buyingDeal, index) => {
  //   const [profitDec, profitPercent] = calculateProfit(buyingDeal.decimalAmount, refTokenDecimalAmount);

  //   return {
  //     Platform: getPlatformName(index),
  //     [`Selling price (in ${tradedToken.symbol} decimals)`]: sellingDeals[0].toFixed(),
  //     [`Buying price (in ${refToken.symbol} decimals)`]: toBuyResult.toFixed(0),
  //     [`Potential profit (in ${refToken.symbol} DECIMALS)`]: profitDec.toFixed(0),
  //     'Potential profit (%)': profitPercent + '%',
  //   };
  // });

  // console.table(table);
};

export default findBestPath;
