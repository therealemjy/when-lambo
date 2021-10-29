import BigNumber from 'bignumber.js';

import KyberExchange from '@src/exchanges/kyber';
import SushiswapExchange from '@src/exchanges/sushiswap';
import UniswapV2Exchange from '@src/exchanges/uniswapV2';
import Token from '@src/tokens/Token';
import calculateProfit from '@src/utils/calculateProfit';

let isMonitoring = false;

const monitorPrices = async (
  {
    refTokenDecimalAmount,
    refToken,
    tradedToken,
  }: {
    refTokenDecimalAmount: BigNumber;
    refToken: Token;
    tradedToken: Token;
  },
  {
    uniswapV2ExchangeService,
    sushiswapExchangeService,
    kyberExchangeService,
  }: {
    uniswapV2ExchangeService: UniswapV2Exchange;
    sushiswapExchangeService: SushiswapExchange;
    kyberExchangeService: KyberExchange;
  }
) => {
  if (isMonitoring) {
    console.log('Block skipped! Price monitoring ongoing.');
    return;
  }

  isMonitoring = true;

  const getPlatformName = (dealIndex: number) => {
    switch (dealIndex) {
      case 0:
        return 'Kyber';
      case 1:
        return 'Uniswap V2';
      default:
        return 'Sushiswap';
    }
  };

  // Check how many tradedToken (e.g.: DAI) decimals we get from trading all the
  // refToken (e.g.: WETH) decimals, on all monitored exchanges
  const toSellResults = await Promise.all([
    // Kyber
    kyberExchangeService.getDecimalAmountOut({
      fromTokenDecimalAmount: refTokenDecimalAmount,
      fromToken: refToken,
      toToken: tradedToken,
    }),
    // Uniswap
    uniswapV2ExchangeService.getDecimalAmountOut({
      fromTokenDecimalAmount: refTokenDecimalAmount,
      fromToken: refToken,
      toToken: tradedToken,
    }),
    // Sushiswap
    sushiswapExchangeService.getDecimalAmountOut({
      fromTokenDecimalAmount: refTokenDecimalAmount,
      fromToken: refToken,
      toToken: tradedToken,
    }),
  ]);

  // Find the highest amount of tradedToken decimals we can get
  const bestDeal = toSellResults.reduce<{
    platformName: string;
    decAmount: BigNumber;
  }>(
    (currentBestDeal, decAmount, index) =>
      decAmount.isGreaterThan(currentBestDeal.decAmount)
        ? {
            platformName: getPlatformName(index),
            decAmount,
          }
        : currentBestDeal,
    {
      platformName: getPlatformName(0),
      decAmount: toSellResults[0],
    }
  );

  // TODO: we should apply a safe slippage to each value so that the final
  // calculated profit is safer

  // Check which platform gives us the highest amount of ETH decimals back from
  // selling all our tradedToken decimals
  const toBuyResults = await Promise.all([
    // Kyber
    kyberExchangeService.getDecimalAmountOut({
      fromTokenDecimalAmount: bestDeal.decAmount,
      fromToken: tradedToken,
      toToken: refToken,
    }),
    // Uniswap
    uniswapV2ExchangeService.getDecimalAmountOut({
      fromTokenDecimalAmount: bestDeal.decAmount,
      fromToken: tradedToken,
      toToken: refToken,
    }),
    // Sushiswap
    sushiswapExchangeService.getDecimalAmountOut({
      fromTokenDecimalAmount: bestDeal.decAmount,
      fromToken: tradedToken,
      toToken: refToken,
    }),
  ]);

  // TODO: we should apply a safe slippage to each value so that the final
  // calculated profit is safer

  isMonitoring = false;

  // Calculate profits
  const table = toBuyResults.map((toBuyResult, index) => {
    const [profitDec, profitPercent] = calculateProfit(toBuyResult, refTokenDecimalAmount);

    return {
      Platform: getPlatformName(index),
      [`Selling price (in ${tradedToken.symbol} decimals)`]: toSellResults[0].toFixed(),
      [`Buying price (in ${refToken.symbol} decimals)`]: toBuyResult.toFixed(0),
      [`Potential profit (in ${refToken.symbol} DECIMALS)`]: profitDec.toFixed(0),
      'Potential profit (%)': profitPercent + '%',
    };
  });

  console.table(table);
};

export default monitorPrices;
