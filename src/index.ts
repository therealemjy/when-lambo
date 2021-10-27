import dotenv from "dotenv";
dotenv.config();

import Web3 from "web3";
import abis from "../abis";
import { ChainId, Token, TokenAmount, Pair } from "@uniswap/sdk";
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

const DAI_IN_DECIMALS = 1 * 10 ** 18;
const ETH_IN_DECIMALS = 1 * 10 ** 18;

const init = async () => {
  const [dai, weth] = await Promise.all(
    [addresses.tokens.dai, addresses.tokens.weth].map((tokenAddress) =>
      Token.fetchData(ChainId.MAINNET, tokenAddress)
    )
  );
  const daiWeth = await Pair.fetchData(dai, weth);

  const monitorPrices = async () => {
    const WETH_DECIMALS_AMOUNT = ETH_IN_DECIMALS;
    const WETH_AMOUNT = WETH_DECIMALS_AMOUNT / ETH_IN_DECIMALS;

    const toSellResults = await Promise.all([
      kyber.methods
        // How much DAI do we get for 1weth?
        // eg: 4000
        // returns value in decimals of dest token (DAI)
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
      daiWeth.getOutputAmount(
        new TokenAmount(weth, WETH_DECIMALS_AMOUNT.toString())
      ),
    ]);

    // Price of 1 WETH in DAI decimals
    // Kyber expectedRate === includes slippage Kyber worstRate === worst
    // slippage you can get on top of the expectedRate, transaction would fail
    // if this threshold is reached. Note the worstRate is calculated using a
    // fixed slippage of 3%, so we should instead use our own notion of safe
    // slippage when calculating pessimistic rates.
    const kyberWethToDaiDecSellRate = toSellResults[0].expectedRate;

    const kyberWethToDaiDecSellAmountBn = new BigNumber(
      kyberWethToDaiDecSellRate
    ).multipliedBy(WETH_AMOUNT);

    const uniswapWethToDaiDecAmountBn = new BigNumber(
      toSellResults[1][0].toExact().toString()
    ).multipliedBy(DAI_IN_DECIMALS);

    console.log("Selling prices: WETH decimals to DAI decimals");
    console.log("Kyber:", kyberWethToDaiDecSellAmountBn.toFixed());
    console.log("Uniswap:", uniswapWethToDaiDecAmountBn.toFixed());
    console.log("---------------");

    // Find the highest amount of DAI we can get
    const isKyberBestSeller = kyberWethToDaiDecSellAmountBn.isGreaterThan(
      uniswapWethToDaiDecAmountBn
    );
    const highestBuyableDaiDecAmountBn = isKyberBestSeller
      ? kyberWethToDaiDecSellAmountBn
      : uniswapWethToDaiDecAmountBn;
    const bestBuyerPlatform = isKyberBestSeller ? "kyber" : "uniswap";

    console.log("Selling platform:", bestBuyerPlatform);
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
      daiWeth.getOutputAmount(
        new TokenAmount(dai, highestBuyableDaiDecAmountBn.toFixed())
      ),
    ]);

    // Price of 1 DAI in WETH decimals
    const kyberDaiToWethDecSellRate = toBuyResults[0].expectedRate;

    // Price of 1 DAI decimal in WETH decimals
    const kyberDaiDecToWethDecSellRate =
      kyberDaiToWethDecSellRate / DAI_IN_DECIMALS;

    // Total amount of WETH decimals we get from selling all the DAI decimals we
    // just bought
    const kyberDaiDecToWethDecAmount = new BigNumber(
      kyberDaiDecToWethDecSellRate
    ).multipliedBy(highestBuyableDaiDecAmountBn);

    const uniswapDaiToWethDecAmountBn = new BigNumber(
      toBuyResults[1][0].toExact()
    ).multipliedBy(ETH_IN_DECIMALS);

    console.log("Buying prices: DAI decimals to WETH decimals");
    console.log("Kyber:", kyberDaiDecToWethDecAmount.toFixed(0));
    console.log("Uniswap:", uniswapDaiToWethDecAmountBn.toFixed());
    console.log("---------------");

    // Calculate profits
    console.log("Potential profits in WETH decimals:");
    console.log(
      "Kyber:",
      kyberDaiDecToWethDecAmount.minus(WETH_DECIMALS_AMOUNT).toFixed(0)
    );
    console.log(
      "Uniswap:",
      uniswapDaiToWethDecAmountBn.minus(WETH_DECIMALS_AMOUNT).toFixed(0)
    );
  };

  monitorPrices();

  // web3.eth
  //   .subscribe("newBlockHeaders")
  //   .on("data", async (block) => {
  //     console.log(`New block received. Block # ${block.number}`);

  //     monitorPrices();
  //   })
  //   .on("error", (error) => {
  //     console.log(error);
  //   });
};

init();
