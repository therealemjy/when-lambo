import { BigNumber } from 'ethers';

// Juicy deal (see line 68 of spreadsheet: https://docs.google.com/spreadsheets/d/1zHMFP3oMbB8opRr4A4uG6nQrsaSyrw1bNcRy4trkhQw/edit#gid=0)
export const profitableTestTrade = {
  blockNumber: 13680260,
  wethAmountToBorrow: BigNumber.from('6300000000000000000'),
  tradedTokenAddress: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942', // MANA (https://etherscan.io/token/0x0f5d2fb29fb7d3cfee444a200298f468908cc942))
  minTradedTokenAmountOut: BigNumber.from('6014317813922740000000'),
  minWethAmountOut: BigNumber.from('6818466095429090000'),
  sellingExchangeIndex: 0, // Uniswap V2
  buyingExchangeIndex: 1, // Sushiswap
};
