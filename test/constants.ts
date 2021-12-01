import { BigNumber } from 'ethers';

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
