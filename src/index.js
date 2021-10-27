require("dotenv").config();

const Web3 = require("web3");
const abis = require("../abis");
const { ChainId, Token, TokenAmount, Pair } = require("@uniswap/sdk");
const { mainnet: addresses } = require("../addresses");
const JSBI = require("jsbi");
const ethers = require("ethers");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.RPC_URL)
);

const kyber = new web3.eth.Contract(
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
    // const kyberResults = await Promise.all([
    //   kyber.methods
    //     .getExpectedRate(
    //       addresses.tokens.dai,
    //       "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    //       DAI_IN_DECIMALS.toString() + "00000"
    //     )
    //     .call(),
    // kyber.methods
    //   .getExpectedRate(
    //     "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    //     addresses.tokens.dai,
    //     ETH_IN_DECIMALS.toString() + "00000"
    //   )
    //   .call(),
    // ]);

    const toSellResults = await Promise.all([
      kyber.methods
        .getExpectedRate(
          addresses.tokens.weth,
          addresses.tokens.dai,
          ETH_IN_DECIMALS.toString()
        )
        .call(),
      daiWeth.getOutputAmount(
        new TokenAmount(weth, ETH_IN_DECIMALS.toString())
      ),
    ]);

    const kyberEthToDaiAmount = toSellResults[0].expectedRate;
    const uniswapEthToDaiAmount = (toSellResults[1][0].toExact() + "").replace(
      ".",
      ""
    );

    const buyingPlatform =
      kyberEthToDaiAmount > uniswapEthToDaiAmount ? "kyber" : "uniswap";
    const finalAmountDaiDecimals =
      kyberEthToDaiAmount > uniswapEthToDaiAmount
        ? kyberEthToDaiAmount
        : uniswapEthToDaiAmount;

    console.log("Selling prices: ETH to DAI decimals");
    console.log("Kyber:", kyberEthToDaiAmount);
    console.log("Uniswap:", uniswapEthToDaiAmount);
    console.log("---------------");

    console.log("Selling platform:", buyingPlatform);
    console.log("Amount (DAI decimals):", finalAmountDaiDecimals);
    console.log("---------------");

    const toBuyResults = await Promise.all([
      kyber.methods
        .getExpectedRate(
          addresses.tokens.dai,
          addresses.tokens.weth,
          finalAmountDaiDecimals
        )
        .call(),
      daiWeth.getOutputAmount(new TokenAmount(dai, finalAmountDaiDecimals)),
    ]);

    const kyberDaiToAthAmount = toBuyResults[0].expectedRate;
    const uniswapDaiToEthAmount = toBuyResults[1][0].toExact();

    console.log("Buying prices: DAI to ETH");
    console.log("Kyber:", kyberDaiToAthAmount);
    console.log("Uniswap:", uniswapDaiToEthAmount);
    console.log("---------------");

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
