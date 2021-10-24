import dotenv from "dotenv";

import Web3 from "web3";
import axios from "axios";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import IUniswapV3PoolJSON from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

dotenv.config();
const UNISWAP_CONTRACT_ADDRESS = "0x60594a405d53811d3bc4766596efd80fd545a270";

// WEB3 CONFIG
const web3 = new Web3(process.env.RPC_URL);

const uniswapPoolContract = new web3.eth.Contract(
  IUniswapV3PoolJSON.abi,
  UNISWAP_CONTRACT_ADDRESS
);

async function getPoolImmutables() {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      uniswapPoolContract.methods.factory().call(),
      uniswapPoolContract.methods.token0().call(),
      uniswapPoolContract.methods.token1().call(),
      uniswapPoolContract.methods.fee().call(),
      uniswapPoolContract.methods.tickSpacing().call(),
      uniswapPoolContract.methods.maxLiquidityPerTick().call(),
    ]);

  const immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  };
  return immutables;
}

async function getPoolState() {
  const [liquidity, slot] = await Promise.all([
    uniswapPoolContract.methods.liquidity().call(),
    uniswapPoolContract.methods.slot0().call(),
  ]);

  const PoolState = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };

  return PoolState;
}

async function checkPair(args) {
  // const {
  //   inputTokenSymbol,
  //   inputTokenAddress,
  //   outputTokenSymbol,
  //   outputTokenAddress,
  //   inputAmount,
  // } = args;

  // const zrXRes = await axios.get(
  //   "https://api.0x.org/swap/v1/price?sellToken=WETH&buyToken=DAI&sellAmount=1000000000000000000"
  // );
  async function main() {
    const [immutables, state] = await Promise.all([
      getPoolImmutables(),
      getPoolState(),
    ]);

    const TokenA = new Token(1, immutables.token0, 18, "DAI");
    const TokenB = new Token(1, immutables.token1, 18, "ETH");

    const pool = new Pool(
      TokenA,
      TokenB,
      +immutables.fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      +state.tick
    );

    console.log(pool.token0Price());
  }

  const uniswapRes = await main();

  // console.table([
  //   {
  //     "Input Token": inputTokenSymbol,
  //     "Output Token": outputTokenSymbol,
  //     "Input Amount": web3.utils.fromWei(inputAmount, "Ether"),
  //     "Uniswap Return": web3.utils.fromWei(uniswapResult, "Ether"),
  //   },
  // ]);
}

let priceMonitor;
let monitoringPrice = false;

async function monitorPrice() {
  if (monitoringPrice) {
    return;
  }

  console.log("Checking prices...");
  monitoringPrice = true;

  try {
    // ADD YOUR CUSTOM TOKEN PAIRS HERE!!!

    await checkPair({
      inputTokenSymbol: "ETH",
      inputTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      outputTokenSymbol: "MANA",
      outputTokenAddress: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      inputAmount: web3.utils.toWei("1", "ETHER"),
    });
  } catch (error) {
    console.error(error);
    monitoringPrice = false;
    clearInterval(priceMonitor);
    return;
  }

  monitoringPrice = false;
}

// Check markets every n seconds
priceMonitor = setInterval(async () => {
  await monitorPrice();
}, 3000);
