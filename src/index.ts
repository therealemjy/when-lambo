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

const DAI_IN_DECIMALS = 1 * 10 ** 18;
const WETH_IN_DECIMALS = 1 * 10 ** 18;

const init = async () => {
  const monitorPrices = async () => {
    const WETH_DECIMALS_AMOUNT = 1 * WETH_IN_DECIMALS;

    const toSellResults = await Promise.all([
      kyber.methods
        // How much DAI do we get for 1weth?
        // eg: 4000
        // returns value in decimals of dest token (DAI decimals)
        .getExpectedRate(
          addresses.tokens.weth,
          addresses.tokens.dai,
          // Return always the price of 1 token given the amount of source token
          // you want to exchange
          WETH_DECIMALS_AMOUNT.toString()
        )
        .call(),
      // How many DAI do we get for a given amount of source token decimal?
      // returns in token's decimal
      uniswap.methods
        .getAmountsOut(WETH_DECIMALS_AMOUNT.toString(), [
          addresses.tokens.weth,
          addresses.tokens.dai,
        ])
        .call(),
      // Sushiswap
      sushiswap.methods
        .getAmountsOut(WETH_DECIMALS_AMOUNT.toString(), [
          addresses.tokens.weth,
          addresses.tokens.dai,
        ])
        .call(),
    ]);

    // Kyber

    // Price of 1 WETH in DAI decimals
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

    // Total amount of DAI decimals we get from selling all the WETH decimals we
    // borrowed
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

    console.log("Selling prices: WETH decimals to DAI decimals");
    console.log("Kyber:", kyberWethToDaiDecAmountBn.toFixed());
    console.log("Uniswap V2:", uniswapV2WethToDaiDecAmountBn.toFixed());
    console.log("Sushiswap:", sushiswapWethToDaiDecAmountBn.toFixed());
    console.log("---------------");

    // Find the highest amount of DAI decimals we can get
    const isKyberBestSeller = kyberWethToDaiDecAmountBn.isGreaterThan(
      uniswapV2WethToDaiDecAmountBn
    );
    const highestBuyableDaiDecAmountBn = isKyberBestSeller
      ? kyberWethToDaiDecAmountBn
      : uniswapV2WethToDaiDecAmountBn;

    // TODO: we should apply a safe slippage to that value so that the final
    // calculated profit is safer

    console.log(
      "Selling platform:",
      isKyberBestSeller ? "Kyber" : "Uniswap v2"
    );
    console.log(
      "Amount (DAI decimals):",
      highestBuyableDaiDecAmountBn.toFixed()
    );
    console.log("---------------");

    // Check which platform gives us the highest amount of ETH decimals back
    // from selling our DAI decimals
    const toBuyResults = await Promise.all([
      kyber.methods
        .getExpectedRate(
          addresses.tokens.dai,
          addresses.tokens.weth,
          highestBuyableDaiDecAmountBn.toFixed()
        )
        .call(),
      uniswap.methods
        .getAmountsOut(highestBuyableDaiDecAmountBn.toFixed(), [
          addresses.tokens.dai,
          addresses.tokens.weth,
        ])
        .call(),
      sushiswap.methods
        .getAmountsOut(highestBuyableDaiDecAmountBn.toFixed(), [
          addresses.tokens.dai,
          addresses.tokens.weth,
        ])
        .call(),
    ]);

    // Price of 1 DAI in WETH decimals
    const kyberDaiToWethDecRate = toBuyResults[0].expectedRate;

    // Price of 1 DAI decimal in WETH decimals
    const kyberDaiDecToWethDecRate = new BigNumber(
      kyberDaiToWethDecRate
    ).dividedBy(DAI_IN_DECIMALS);

    // Total amount of WETH decimals we get from selling all the DAI decimals we
    // just bought
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

    console.log("Buying prices: DAI decimals to WETH decimals");
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
  };

  monitorPrices();

  web3.eth
    .subscribe("newBlockHeaders")
    .on("data", async (block) => {
      console.log(`New block received. Block # ${block.number}`);

      monitorPrices();
    })
    .on("error", (error) => {
      console.log(error);
    });
};

init();
