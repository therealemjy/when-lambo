require("dotenv").config();

import Web3 from "web3";
import abis from "../abis";
import { ChainId, Token, TokenAmount, Pair } from "@uniswap/sdk";
import { mainnet as addresses } from "../addresses";
import BigNumber from "bignumber.js";

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.RPC_URL)
);

const kyber = new web3.eth.Contract(
  // @ts-ignore
  abis.kyber.kyberNetworkProxy,
  addresses.kyber.kyberNetworkProxy
);

const DAI_IN_DECIMALS = 1 * 10 ** 18;
const ETH_IN_DECIMALS = 1 * 10 ** 18;

const potentialETHAmounts = [1, 3, 5, 7];

const init = async () => {
  const [dai, weth] = await Promise.all(
    [addresses.tokens.dai, addresses.tokens.weth].map((tokenAddress) =>
      Token.fetchData(ChainId.MAINNET, tokenAddress)
    )
  );
  const daiWeth = await Pair.fetchData(dai, weth);

  const monitorPrices = async () => {
    const WETH_AMOUNT = 1;
    const WETH_DECIMALS_AMOUNT = 1 * ETH_IN_DECIMALS;

    const toSellResults = await Promise.all([
      kyber.methods
        .getExpectedRate(
          addresses.tokens.weth,
          addresses.tokens.dai,
          WETH_DECIMALS_AMOUNT.toString()
        )
        .call(),
      daiWeth.getOutputAmount(
        new TokenAmount(weth, WETH_DECIMALS_AMOUNT.toString())
      ),
    ]);

    const kyberWethToDaiDecSellRate = toSellResults[0].expectedRate;
    const kyberWethToDaiSellAmountBn = new BigNumber(kyberWethToDaiDecSellRate)
      .times(WETH_AMOUNT)
      .dividedBy(DAI_IN_DECIMALS);

    const uniswapWethToDaiAmountBn = new BigNumber(
      toSellResults[1][0].toExact().toString()
    );

    console.log("Selling prices: ETH to DAI decimals");
    console.log("Kyber:", kyberWethToDaiSellAmountBn.toFixed());
    console.log("Uniswap:", uniswapWethToDaiAmountBn.toFixed());
    console.log("---------------");

    // const isKyberGreater = kyberWethToDaiSellAmountBn.isGreaterThan(
    //   uniswapWethToDaiDecAmountBn
    // );
    // const buyingPlatform = isKyberGreater ? "kyber" : "uniswap";
    // const finalAmountDaiDec = isKyberGreater
    //   ? kyberWethToDaiDecSellAmountBn.toFixed()
    //   : uniswapWethToDaiDecAmountBn.toFixed();

    // console.log("Selling platform:", buyingPlatform);
    // console.log("Amount (DAI decimals):", finalAmountDaiDec);
    // console.log("---------------");

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
