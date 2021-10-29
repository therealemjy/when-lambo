// @ts-ignore
import AWSWebsocketProvider from '@aws/web3-ws-provider';
import BigNumber from 'bignumber.js';
import 'console.table';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

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

const monitorPrices = async (borrowedWethDecAmounts: BigNumber) => {
  if (isMonitoring) {
    console.log('Block skipped! Price monitoring ongoing.');
    return;
  }

  isMonitoring = true;

  const toSellResults = await Promise.all([
    // Kyber
    kyberExchangeService.getDecimalsOut({
      fromTokenDecimalAmount: borrowedWethDecAmounts,
      fromToken: WETH,
      toToken: DAI,
    }),
    // Uniswap
    uniswapV2ExchangeService.getDecimalsOut({
      fromTokenDecimalAmount: borrowedWethDecAmounts,
      fromToken: WETH,
      toToken: DAI,
    }),
    // Sushiswap
    sushiswapExchangeService.getDecimalsOut({
      fromTokenDecimalAmount: borrowedWethDecAmounts,
      fromToken: WETH,
      toToken: DAI,
    }),
  ]);

  const kyberWethToDaiDecAmountBn = toSellResults[0];
  const uniswapV2WethToDaiDecAmountBn = toSellResults[1];
  const sushiswapWethToDaiDecAmountBn = toSellResults[2];

  // Find the highest amount of Traded Token decimals we can get
  // TODO: re-do to take all exchanges in count
  const isKyberBestSeller = kyberWethToDaiDecAmountBn.isGreaterThan(uniswapV2WethToDaiDecAmountBn);
  const highestBuyableDaiDecAmountBn = isKyberBestSeller ? kyberWethToDaiDecAmountBn : uniswapV2WethToDaiDecAmountBn;

  // TODO: we should apply a safe slippage to that value so that the final
  // calculated profit is safer

  // Check which platform gives us the highest amount of ETH decimals back3
  // from selling our Traded Token decimals
  const toBuyResults = await Promise.all([
    // Kyber
    kyberExchangeService.getDecimalsOut({
      fromTokenDecimalAmount: highestBuyableDaiDecAmountBn,
      fromToken: DAI,
      toToken: WETH,
    }),
    // Uniswap
    uniswapV2ExchangeService.getDecimalsOut({
      fromTokenDecimalAmount: highestBuyableDaiDecAmountBn,
      fromToken: DAI,
      toToken: WETH,
    }),
    // Sushiswap
    sushiswapExchangeService.getDecimalsOut({
      fromTokenDecimalAmount: highestBuyableDaiDecAmountBn,
      fromToken: DAI,
      toToken: WETH,
    }),
  ]);

  // Kyber
  const kyberDaiToWethDecAmountBn = toBuyResults[0];

  // Uniswap
  const uniswapV2DaiToWethDecAmountBn = toBuyResults[1];

  // Sushiswap
  const sushiswapDaiToWethDecAmountBn = toBuyResults[2];

  // TODO: we should apply a safe slippage to that value so that the final
  // calculated profit is safer

  // Calculate profits
  const kyberProfitBn = kyberDaiToWethDecAmountBn.minus(borrowedWethDecAmounts);
  const uniswapV2ProfitBn = uniswapV2DaiToWethDecAmountBn.minus(borrowedWethDecAmounts);
  const sushiswapProfitBn = sushiswapDaiToWethDecAmountBn.minus(borrowedWethDecAmounts);

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
  monitorPrices(borrowedWethDec);

  provider.addListener('block', (blockNumber) => {
    console.log(`New block received. Block # ${blockNumber}`);
    monitorPrices(borrowedWethDec);
  });
};

init();
