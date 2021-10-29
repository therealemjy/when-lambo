// @ts-ignore
import AWSWebsocketProvider from '@aws/web3-ws-provider';
import BigNumber from 'bignumber.js';
import 'console.table';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

import { Token } from '@src/tokens/types';

import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import { DAI, WETH } from './src/tokens';

dotenv.config();

const provider = new ethers.providers.Web3Provider(
  new AWSWebsocketProvider(process.env.AWS_WS_RPC_URL, {
    clientConfig: {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
  })
);

// Instantiate exchange services
const uniswapV2ExchangeService = new UniswapV2Exchange(provider);
const sushiswapExchangeService = new SushiswapExchange(provider);
const kyberExchangeService = new KyberExchange(provider);

let isMonitoring = false;

const monitorPrices = async ({
  refTokenDecimalAmount,
  refToken,
  tradedToken,
}: {
  refTokenDecimalAmount: BigNumber;
  refToken: Token;
  tradedToken: Token;
}) => {
  if (isMonitoring) {
    console.log('Block skipped! Price monitoring ongoing.');
    return;
  }

  isMonitoring = true;

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

  const kyberWethToDaiDecAmountBn = toSellResults[0];
  const uniswapV2WethToDaiDecAmountBn = toSellResults[1];
  const sushiswapWethToDaiDecAmountBn = toSellResults[2];

  const getDealPlatformName = (dealIndex: number) => {
    switch (dealIndex) {
      case 0:
        return 'Kyber';
      case 1:
        return 'Uniswap V2';
      default:
        return 'Sushiswap';
    }
  };

  // Find the highest amount of tradedToken decimals we can get
  const bestDeal = toSellResults.reduce<{
    platformName: string;
    decAmount: BigNumber;
  }>(
    (currentBestDeal, decAmount, index) =>
      decAmount.isGreaterThan(currentBestDeal.decAmount)
        ? {
            platformName: getDealPlatformName(index),
            decAmount,
          }
        : currentBestDeal,
    {
      platformName: getDealPlatformName(0),
      decAmount: toSellResults[0],
    }
  );

  // TODO: we should apply a safe slippage to that value so that the final
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

  const kyberDaiToWethDecAmountBn = toBuyResults[0];
  const uniswapV2DaiToWethDecAmountBn = toBuyResults[1];
  const sushiswapDaiToWethDecAmountBn = toBuyResults[2];

  // TODO: we should apply a safe slippage to that value so that the final
  // calculated profit is safer

  // Calculate profits
  const kyberProfitBn = kyberDaiToWethDecAmountBn.minus(refTokenDecimalAmount);
  const uniswapV2ProfitBn = uniswapV2DaiToWethDecAmountBn.minus(refTokenDecimalAmount);
  const sushiswapProfitBn = sushiswapDaiToWethDecAmountBn.minus(refTokenDecimalAmount);

  const kyberProfitPercent = kyberProfitBn.dividedBy(kyberDaiToWethDecAmountBn.toFixed(0)).multipliedBy(100).toFixed(2);
  const uniswapV2ProfitPercent = uniswapV2ProfitBn
    .dividedBy(uniswapV2DaiToWethDecAmountBn.toFixed(0))
    .multipliedBy(100)
    .toFixed(2);
  const sushiswapProfitPercent = sushiswapProfitBn
    .dividedBy(sushiswapDaiToWethDecAmountBn.toFixed(0))
    .multipliedBy(100)
    .toFixed(2);

  isMonitoring = false;

  console.table([
    {
      Platform: 'Kyber',
      'Selling price (in Traded Token decimals)': kyberWethToDaiDecAmountBn.toFixed(),
      'Buying price (in WETH decimals)': kyberDaiToWethDecAmountBn.toFixed(0),
      'Potential profit (in WETH DECIMALS)': kyberProfitBn.toFixed(0),
      'Potential profit (%)': kyberProfitPercent + '%',
    },
    {
      Platform: 'Uniswap V2',
      'Selling price (in Traded Token decimals)': uniswapV2WethToDaiDecAmountBn.toFixed(),
      'Buying price (in WETH decimals)': uniswapV2DaiToWethDecAmountBn.toFixed(),
      'Potential profit (in WETH DECIMALS)': uniswapV2ProfitBn.toFixed(),
      'Potential profit (%)': uniswapV2ProfitPercent + '%',
    },
    {
      Platform: 'Sushiswap',
      'Selling price (in Traded Token decimals)': sushiswapWethToDaiDecAmountBn.toFixed(),
      'Buying price (in WETH decimals)': sushiswapDaiToWethDecAmountBn.toFixed(),
      'Potential profit (in WETH DECIMALS)': sushiswapProfitBn.toFixed(),
      'Potential profit (%)': sushiswapProfitPercent + '%',
    },
  ]);
};

// TODO: use environment variables for this
const WETH_DECIMALS_AMOUNT = '1000000000000000000'; // One WETH in decimals

const init = async () => {
  const borrowedWethDec = new BigNumber(WETH_DECIMALS_AMOUNT);

  // TODO: remove when deploying
  monitorPrices({
    refTokenDecimalAmount: borrowedWethDec,
    refToken: WETH,
    tradedToken: DAI,
  });

  provider.addListener('block', (blockNumber) => {
    console.log(`New block received. Block # ${blockNumber}`);
    monitorPrices({
      refTokenDecimalAmount: borrowedWethDec,
      refToken: WETH,
      tradedToken: DAI,
    });
  });
};

init();
