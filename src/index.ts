import dotenv from "dotenv";
dotenv.config();

import Web3 from "web3";
import abis from "../abis";
import exchangesAddresses from "../addresses";
import BigNumber from "bignumber.js";

const { mainnet: addresses } = exchangesAddresses;

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.RPC_URL || "")
);

const kyber = new web3.eth.Contract(
  // @ts-ignore
  abis.kyber.kyberNetworkProxy,
  addresses.kyber.kyberNetworkProxy
);

const uniswap = new web3.eth.Contract(
  // @ts-ignore
  abis.uniswap.uniswap,
  addresses.uniswap.router
);

const sushiswap = new web3.eth.Contract(
  // @ts-ignore
  abis.sushiswap.sushi,
  addresses.sushiswap.router
);

// Update with the token you want to trade
const TRADED_TOKEN_ADDRESS = addresses.tokens.sushi;
const TRADED_TOKEN_DECIMALS = 18;

const WETH_IN_DECIMALS = 1 * 10 ** 18;
const TRADED_TOKEN_IN_DECIMALS = 1 * 10 ** TRADED_TOKEN_DECIMALS;

let isMonitoring = false;

const monitorPrices = async (borrowedWethDecAmounts: string) => {
  if (isMonitoring) {
    console.log("Block skipped! Price monitoring ongoing.");
    return;
  }

  isMonitoring = true;

  const toSellResults = await Promise.all([
    kyber.methods
      // How much Traded Token do we get for 1weth?
      // eg: 4000
      // returns value in decimals of dest token (Traded Token decimals)
      .getExpectedRate(
        addresses.tokens.weth,
        TRADED_TOKEN_ADDRESS,
        // Return always the price of 1 token given the amount of source token
        // you want to exchange
        borrowedWethDecAmounts
      )
      .call(),
    // How many Traded Token do we get for a given amount of source token decimal?
    // returns in token's decimal
    uniswap.methods
      .getAmountsOut(borrowedWethDecAmounts, [
        addresses.tokens.weth,
        TRADED_TOKEN_ADDRESS,
      ])
      .call(),
    // Sushiswap
    sushiswap.methods
      .getAmountsOut(borrowedWethDecAmounts, [
        addresses.tokens.weth,
        TRADED_TOKEN_ADDRESS,
      ])
      .call(),
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
  const kyberWethDecToDaiDecSellRate = new BigNumber(
    kyberWethToDaiDecSellRate
  ).dividedBy(WETH_IN_DECIMALS);

  // Total amount of Traded Token decimals we get from selling all the WETH
  // decimals we borrowed
  const kyberWethToDaiDecAmountBn = new BigNumber(
    kyberWethDecToDaiDecSellRate
  ).multipliedBy(WETH_DECIMALS_AMOUNT);

  // Uniswap
  const uniswapV2WethToDaiDecAmountBn = new BigNumber(
    toSellResults[1][1].toString()
  );

  // Sushiswap
  const sushiswapWethToDaiDecAmountBn = new BigNumber(
    toSellResults[2][1].toString()
  );

  console.log("Selling prices: WETH decimals to Traded Token decimals");
  console.log("Kyber:", kyberWethToDaiDecAmountBn.toFixed());
  console.log("Uniswap V2:", uniswapV2WethToDaiDecAmountBn.toFixed());
  console.log("Sushiswap:", sushiswapWethToDaiDecAmountBn.toFixed());
  console.log("---------------");

  // Find the highest amount of Traded Token decimals we can get
  const isKyberBestSeller = kyberWethToDaiDecAmountBn.isGreaterThan(
    uniswapV2WethToDaiDecAmountBn
  );
  const highestBuyableDaiDecAmountBn = isKyberBestSeller
    ? kyberWethToDaiDecAmountBn
    : uniswapV2WethToDaiDecAmountBn;

  // TODO: we should apply a safe slippage to that value so that the final
  // calculated profit is safer

  console.log("Selling platform:", isKyberBestSeller ? "Kyber" : "Uniswap v2");
  console.log(
    "Amount (Traded Token decimals):",
    highestBuyableDaiDecAmountBn.toFixed()
  );
  console.log("---------------");

  // Check which platform gives us the highest amount of ETH decimals back
  // from selling our Traded Token decimals
  const toBuyResults = await Promise.all([
    kyber.methods
      .getExpectedRate(
        TRADED_TOKEN_ADDRESS,
        addresses.tokens.weth,
        highestBuyableDaiDecAmountBn.toFixed()
      )
      .call(),
    uniswap.methods
      .getAmountsOut(highestBuyableDaiDecAmountBn.toFixed(), [
        TRADED_TOKEN_ADDRESS,
        addresses.tokens.weth,
      ])
      .call(),
    sushiswap.methods
      .getAmountsOut(highestBuyableDaiDecAmountBn.toFixed(), [
        TRADED_TOKEN_ADDRESS,
        addresses.tokens.weth,
      ])
      .call(),
  ]);

  // Price of 1 Traded Token in WETH decimals
  const kyberDaiToWethDecRate = toBuyResults[0].expectedRate;

  // Price of 1 Traded Token decimal in WETH decimals
  const kyberDaiDecToWethDecRate = new BigNumber(
    kyberDaiToWethDecRate
  ).dividedBy(TRADED_TOKEN_IN_DECIMALS);

  // Total amount of WETH decimals we get from selling all the Traded Token
  // decimals we just bought
  const kyberDaiDecToWethDecAmountBn = new BigNumber(
    kyberDaiDecToWethDecRate
  ).multipliedBy(highestBuyableDaiDecAmountBn);

  // Uniswap
  const uniswapV2DaiToWethDecAmountBn = new BigNumber(
    toBuyResults[1][1].toString()
  );

  // Sushiswap
  const sushiswapDaiToWethDecAmountBn = new BigNumber(
    toBuyResults[2][1].toString()
  );

  // TODO: we should apply a safe slippage to that value so that the final
  // calculated profit is safer

  console.log("Buying prices: Traded Token decimals to WETH decimals");
  console.log("Kyber:", kyberDaiDecToWethDecAmountBn.toFixed(0));
  console.log("Uniswap V2:", uniswapV2DaiToWethDecAmountBn.toFixed());
  console.log("Sushiswap:", sushiswapDaiToWethDecAmountBn.toFixed());
  console.log("---------------");

  // Calculate profits
  const kyberProfitBn =
    kyberDaiDecToWethDecAmountBn.minus(WETH_DECIMALS_AMOUNT);
  const uniswapV2ProfitBn =
    uniswapV2DaiToWethDecAmountBn.minus(WETH_DECIMALS_AMOUNT);
  const sushiswapProfitBn =
    sushiswapDaiToWethDecAmountBn.minus(WETH_DECIMALS_AMOUNT);

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

  console.log("Potential profits in WETH decimals:");
  console.log(
    "Kyber:",
    kyberProfitBn.toFixed() + " (" + kyberProfitPercent + "%)"
  );
  console.log(
    "Uniswap V2:",
    uniswapV2ProfitBn.toFixed() + " (" + uniswapV2ProfitPercent + "%)"
  );
  console.log(
    "Sushiswap:",
    sushiswapProfitBn.toFixed() + " (" + sushiswapProfitPercent + "%)"
  );

  isMonitoring = false;
};

const WETH_DECIMALS_AMOUNT = 1 * WETH_IN_DECIMALS;

const init = async () => {
  const borrowedWethDec = WETH_DECIMALS_AMOUNT.toString();

  monitorPrices(borrowedWethDec);

  web3.eth
    .subscribe("newBlockHeaders")
    .on("data", async (block) => {
      console.log(`---------------`);
      console.log(`New block received. Block # ${block.number}`);
      console.log(`---------------`);
      monitorPrices(borrowedWethDec);
    })
    .on("error", (error) => {
      console.log(error);
    });
};

init();
