// @ts-ignore
import AWSWebsocketProvider from '@aws/web3-ws-provider';
import BigNumber from 'bignumber.js';
import 'console.table';
import dotenv from 'dotenv';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import kyberNetworkProxyABI from './abis/kyberNetworkProxy.json';
import sushiswapRouterABI from './abis/sushiswapRouter.json';
import uniswapRouterABI from './abis/uniswapRouter.json';
import exchangeAddresses from './addresses/mainnet/exchanges.json';
import tokenAddresses from './addresses/mainnet/tokens.json';

dotenv.config();

const web3 = new Web3(
  new AWSWebsocketProvider(process.env.AWS_WS_RPC_URL, {
    clientConfig: {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
  })
);

web3.eth.getNodeInfo().then(console.log);

const kyber = new web3.eth.Contract(
  kyberNetworkProxyABI.kyberNetworkProxy as unknown as AbiItem,
  exchangeAddresses.kyber.networkProxy
);
const uniswap = new web3.eth.Contract(uniswapRouterABI.uniswap as unknown as AbiItem, exchangeAddresses.uniswap.router);

const sushiswap = new web3.eth.Contract(
  sushiswapRouterABI.sushi as unknown as AbiItem,
  exchangeAddresses.sushiswap.router
);

// Update with the token you want to trade
const TRADED_TOKEN_ADDRESS = tokenAddresses.sushi;
const TRADED_TOKEN_DECIMALS = 18;

const WETH_IN_DECIMALS = 1 * 10 ** 18;
const TRADED_TOKEN_IN_DECIMALS = 1 * 10 ** TRADED_TOKEN_DECIMALS;

let isMonitoring = false;

const monitorPrices = async (borrowedWethDecAmounts: string) => {
  if (isMonitoring) {
    console.log('Block skipped ☠️ Price monitoring ongoing.');
    return;
  }

  isMonitoring = true;

  const toSellResults = await Promise.all([
    kyber.methods
      // How much Traded Token do we get for 1weth?
      // eg: 4000
      // returns value in decimals of dest token (Traded Token decimals)
      .getExpectedRate(
        tokenAddresses.weth,
        TRADED_TOKEN_ADDRESS,
        // Return always the price of 1 token given the amount of source token
        // you want to exchange
        borrowedWethDecAmounts
      )
      .call(),
    // How many Traded Token do we get for a given amount of source token decimal?
    // returns in token's decimal
    uniswap.methods.getAmountsOut(borrowedWethDecAmounts, [tokenAddresses.weth, TRADED_TOKEN_ADDRESS]).call(),
    // Sushiswap
    sushiswap.methods.getAmountsOut(borrowedWethDecAmounts, [tokenAddresses.weth, TRADED_TOKEN_ADDRESS]).call(),
  ]);

  // Kyber
  // Price of 1 WETH in Traded Token decimals
  // Kyber expectedRate === includes slippage Kyber worstRate === worst
  // slippage you can get on top of the expectedRate, transaction would fail
  // if this threshold is reached. Note the worstRate is calculated using a
  // fixed slippage of 3%, so we should instead use our own notion of safe
  // slippage when calculating pessimistic rates.
  const kyberWethToDaiDecSellRate = toSellResults[0].expectedRate;

  // Price of 1 WETH decimal in DAI decimals
  const kyberWethDecToDaiDecSellRate = new BigNumber(kyberWethToDaiDecSellRate).dividedBy(WETH_IN_DECIMALS);

  // Total amount of Traded Token decimals we get from selling all the WETH
  // decimals we borrowed
  const kyberWethToDaiDecAmountBn = new BigNumber(kyberWethDecToDaiDecSellRate).multipliedBy(WETH_DECIMALS_AMOUNT);

  // Uniswap
  const uniswapV2WethToDaiDecAmountBn = new BigNumber(toSellResults[1][1].toString());

  // Sushiswap
  const sushiswapWethToDaiDecAmountBn = new BigNumber(toSellResults[2][1].toString());

  // Find the highest amount of Traded Token decimals we can get
  const isKyberBestSeller = kyberWethToDaiDecAmountBn.isGreaterThan(uniswapV2WethToDaiDecAmountBn);
  const highestBuyableDaiDecAmountBn = isKyberBestSeller ? kyberWethToDaiDecAmountBn : uniswapV2WethToDaiDecAmountBn;

  // TODO: we should apply a safe slippage to that value so that the final
  // calculated profit is safer

  // Check which platform gives us the highest amount of ETH decimals back
  // from selling our Traded Token decimals
  const toBuyResults = await Promise.all([
    kyber.methods
      .getExpectedRate(TRADED_TOKEN_ADDRESS, tokenAddresses.weth, highestBuyableDaiDecAmountBn.toFixed())
      .call(),
    uniswap.methods
      .getAmountsOut(highestBuyableDaiDecAmountBn.toFixed(), [TRADED_TOKEN_ADDRESS, tokenAddresses.weth])
      .call(),
    sushiswap.methods
      .getAmountsOut(highestBuyableDaiDecAmountBn.toFixed(), [TRADED_TOKEN_ADDRESS, tokenAddresses.weth])
      .call(),
  ]);

  // Price of 1 Traded Token in WETH decimals
  const kyberDaiToWethDecRate = toBuyResults[0].expectedRate;

  // Price of 1 Traded Token decimal in WETH decimals
  const kyberDaiDecToWethDecRate = new BigNumber(kyberDaiToWethDecRate).dividedBy(TRADED_TOKEN_IN_DECIMALS);

  // Total amount of WETH decimals we get from selling all the Traded Token
  // decimals we just bought
  const kyberDaiDecToWethDecAmountBn = new BigNumber(kyberDaiDecToWethDecRate).multipliedBy(
    highestBuyableDaiDecAmountBn
  );

  // Uniswap
  const uniswapV2DaiToWethDecAmountBn = new BigNumber(toBuyResults[1][1].toString());

  // Sushiswap
  const sushiswapDaiToWethDecAmountBn = new BigNumber(toBuyResults[2][1].toString());

  // TODO: we should apply a safe slippage to that value so that the final
  // calculated profit is safer

  // Calculate profits
  const kyberProfitBn = kyberDaiDecToWethDecAmountBn.minus(WETH_DECIMALS_AMOUNT);
  const uniswapV2ProfitBn = uniswapV2DaiToWethDecAmountBn.minus(WETH_DECIMALS_AMOUNT);
  const sushiswapProfitBn = sushiswapDaiToWethDecAmountBn.minus(WETH_DECIMALS_AMOUNT);

  const kyberProfitPercent = kyberProfitBn
    .dividedBy(kyberDaiDecToWethDecAmountBn.toFixed(0))
    .multipliedBy(100)
    .toFixed(2);
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
      'Buying price (in WETH decimals)': kyberDaiDecToWethDecAmountBn.toFixed(0),
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

const WETH_DECIMALS_AMOUNT = 1 * WETH_IN_DECIMALS;

const init = async () => {
  const borrowedWethDec = WETH_DECIMALS_AMOUNT.toString();

  monitorPrices(borrowedWethDec);

  web3.eth
    .subscribe('newBlockHeaders')
    .on('data', async (block) => {
      console.log(`New block received. Block # ${block.number}`);
      monitorPrices(borrowedWethDec);
    })
    .on('error', (error) => {
      console.log(error);
    });
};

init();
