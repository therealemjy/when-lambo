require("dotenv").config();

const Web3 = require("web3");
const { ChainId, Token, TokenAmount, Pair } = require("@uniswap/sdk");
const abis = require("../abis");
const { mainnet: addresses } = require("../addresses");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.RPC_URL)
);

const kyber = new web3.eth.Contract(
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

    const kyberResults = await Promise.all([
      kyber.methods
        .getExpectedRate(
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          addresses.tokens.dai,
          ETH_IN_DECIMALS.toString()
        )
        .call(),
      kyber.methods
        .getExpectedRate(
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          addresses.tokens.dai,
          ETH_IN_DECIMALS.toString() + "00"
        )
        .call(),
      kyber.methods
        .getExpectedRate(
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          addresses.tokens.dai,
          (ETH_IN_DECIMALS * 6).toString() + "00"
        )
        .call(),
      kyber.methods
        .getExpectedRate(
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          addresses.tokens.dai,
          (ETH_IN_DECIMALS * 12).toString() + "00"
        )
        .call(),

      kyber.methods
        .getExpectedRate(
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          addresses.tokens.dai,
          (ETH_IN_DECIMALS * 18).toString() + "00"
        )
        .call(),
      kyber.methods
        .getExpectedRate(
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          addresses.tokens.dai,
          (ETH_IN_DECIMALS * 24).toString() + "00"
        )
        .call(),
      kyber.methods
        .getExpectedRate(
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          addresses.tokens.dai,
          (ETH_IN_DECIMALS * 30).toString() + "00"
        )
        .call(),
    ]);

    const refRate = kyberResults[0].expectedRate;
    const getSlippage = (rate) => 100 - (rate / refRate) * 100;

    console.log("Slippages:");
    console.log(getSlippage(kyberResults[1].expectedRate));
    console.log(getSlippage(kyberResults[2].expectedRate));
    console.log(getSlippage(kyberResults[4].expectedRate));
    console.log(getSlippage(kyberResults[5].expectedRate));
    console.log(getSlippage(kyberResults[6].expectedRate));

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

  web3.eth
    .subscribe("newBlockHeaders")
    .on("data", async (block) => {
      console.log(`New block received. Block # ${block.number}`);

      // monitorPrices();
    })
    .on("error", (error) => {
      console.log(error);
    });
};

init();
