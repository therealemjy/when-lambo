import { BigNumber } from 'ethers';

export const WETH_MAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const DYDX_SOLO_MAINNET_ADDRESS = '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e';
export const UNISWAP_V2_ROUTER_MAINNET_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
export const SUSHISWAP_ROUTER_MAINNET_ADDRESS = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
export const CRYPTO_COM_ROUTER_MAINNET_ADDRESS = '0xCeB90E4C17d626BE0fACd78b79c9c87d7ca181b3';

// TODO: move to env variables
// Juicy deal (see line 68 of spreadsheet: https://docs.google.com/spreadsheets/d/1zHMFP3oMbB8opRr4A4uG6nQrsaSyrw1bNcRy4trkhQw/edit#gid=0)
export const profitableTestTrade = {
  blockNumber: 13680260,
  wethAmountToBorrow: BigNumber.from('6300000000000000000'),
  sellingExchangeIndex: 0, // Uniswap V2
  tradedTokenAddress: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', // MANA (https://etherscan.io/token/0x0f5d2fb29fb7d3cfee444a200298f468908cc942))
  tradedTokenAmountOutMin: BigNumber.from('6014317813922740000000'),
  tradedTokenAmountOutExpected: BigNumber.from('6044540516505264580775'),
  buyingExchangeIndex: 1, // Sushiswap
  wethAmountOutMin: BigNumber.from('6818466095429090000'),
  wethAmountOutExpected: BigNumber.from('6887029118114948956'),
};
