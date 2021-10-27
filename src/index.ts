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

// const potentialETHAmounts = [1, 3, 5, 7];

const init = async () => {
  const [dai, weth] = await Promise.all(
    [addresses.tokens.dai, addresses.tokens.weth].map((tokenAddress) =>
      Token.fetchData(ChainId.MAINNET, tokenAddress)
    )
  );
  const daiWeth = await Pair.fetchData(dai, weth);

  const monitorPrices = async () => {
    const WETH_DECIMALS_AMOUNT = ETH_IN_DECIMALS;

    const toSellResults = await Promise.all([
      kyber.methods
        // How much DAI do we get for 1weth?
        // eg: 4000
        // returns value in coin
        .getExpectedRate(
          addresses.tokens.weth,
          addresses.tokens.dai,
          // Return always the price of 1 token given the amount of source token you want to exchange
          WETH_DECIMALS_AMOUNT.toString()
        )
        .call(),
      // How many DAI do we get for a given amount of source token decimal?
      // returns in token's decimal
      daiWeth.getOutputAmount(
        new TokenAmount(weth, WETH_DECIMALS_AMOUNT.toString())
      ),
    ]);

    // Kyber expectedRate === includes slippage Kyber worstRate === worst
    // slippage you can get on top of the expectedRate, transaction would fail
    // if this threshold is reached. Note the worstRate is calculated using a
    // fixed slippage of 3%, so we should instead use our own notion of safe
    // slippage when calculating pessimistic rates
    const kyberWethToDaiDecSellRate = toSellResults[0].expectedRate;

    const kyberWethToDaiDecSellAmountBn = new BigNumber(
      kyberWethToDaiDecSellRate
    ).multipliedBy(WETH_DECIMALS_AMOUNT / ETH_IN_DECIMALS);

    const uniswapWethToDaiDecAmountBn = new BigNumber(
      toSellResults[1][0].toExact().toString()
    ).multipliedBy(DAI_IN_DECIMALS);

    console.log("Selling prices: ETH to DAI decimals");
    console.log("Kyber:", kyberWethToDaiDecSellAmountBn.toFixed());
    console.log("Uniswap:", uniswapWethToDaiDecAmountBn.toFixed());
    console.log("---------------");

    // Find the highest value we can get
    const isKyberBestSeller = kyberWethToDaiDecSellAmountBn.isGreaterThan(
      uniswapWethToDaiDecAmountBn
    );
    const highestBuyableDaiAmountBn = isKyberBestSeller
      ? kyberWethToDaiDecSellAmountBn
      : uniswapWethToDaiDecAmountBn;
    const bestBuyerPlatform = isKyberBestSeller ? "kyber" : "uniswap";

    console.log("Selling platform:", bestBuyerPlatform);
    console.log("Amount (DAI decimals):", highestBuyableDaiAmountBn.toFixed());
    console.log("---------------");

    // const toBuyResults = await Promise.all([
    //   // kyber.methods
    //   //   .getExpectedRate(
    //   //     addresses.tokens.dai,
    //   //     addresses.tokens.weth,
    //   //     finalAmountDaiDecimals
    //   //   )
    //   //   .call(),
    //   daiWeth.getOutputAmount(new TokenAmount(dai, finalAmountDaiDec)),
    // ]);

    // console.log(toBuyResults[0][0].toExact());

    // Kyber
    // const kyberBuyingRate = toBuyResults[0].expectedRate;

    // console.log("rate", kyberBuyingRate);

    // const kyberDaiToEthAmount = ethers.BigNumber.from(kyberBuyingRate)
    //   .mul(ethers.BigNumber.from(finalAmountDaiDecimals))
    //   .div(ethers.BigNumber.from(DAI_IN_DECIMALS.toString()))
    //   .toString();

    // console.log(
    //   ethers.BigNumber.from(kyberBuyingRate)
    //     .mul(ethers.BigNumber.from(finalAmountDaiDecimals))
    //     .toString()
    // );
    // console.log(DAI_IN_DECIMALS.toString());

    // const uniswapDaiToEthAmount = toBuyResults[1][0].toExact();

    // console.log("Buying prices: DAI to ETH");
    // console.log("Kyber:", kyberDaiToEthAmount);
    // console.log("Uniswap:", uniswapDaiToEthAmount);
    // console.log("---------------");

    // const refRate = kyberResults[0].expectedRate;
    // const getSlippage = (rate) => 100 - (rate / refRate) * 100;

    // console.log("Slippages:");
    // console.log(getSlippage(kyberResults[1].expectedRate));
    // console.log(getSlippage(kyberResults[2].expectedRate));
    // console.log(getSlippage(kyberResults[4].expectedRate));
    // console.log(getSlippage(kyberResults[5].expectedRate));
    // console.log(getSlippage(kyberResults[6].expectedRate));

    // console.log(kyberResults[0].expectedRate / DAI_IN_DECIMALS);
    // console.log(kyberResults[1].expectedRate / DAI_IN_DECIMALS);

    // const kyberRates = {
    //   buy: parseFloat(1 / (kyberResults[0].expectedRate / 10 ** 18)),
    //   sell: parseFloat(kyberResults[1].expectedRate / 10 ** 18),
    // };
    // console.log("Kyber ETH/DAI");
    // console.log(kyberRates);
    // const uniswapResults = await Promise.all([
    //   daiWeth.getOutputAmount(new TokenAmount(dai, AMOUNT_DAI_WEI)),
    //   daiWeth.getOutputAmount(new TokenAmount(weth, AMOUNT_ETH_WEI)),
    // ]);
    // const uniswapRates = {
    //   buy: parseFloat(
    //     AMOUNT_DAI_WEI / (uniswapResults[0][0].toExact() * 10 ** 18)
    //   ),
    //   sell: parseFloat(uniswapResults[1][0].toExact() / AMOUNT_ETH),
    // };
    // console.log("Uniswap ETH/DAI");
    // console.log(uniswapRates);
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
