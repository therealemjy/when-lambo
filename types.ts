// These values need to follow the exact same order as the ones used in the Transactor contract
export enum ExchangeIndex {
  UniswapV2 = 0,
  Sushiswap = 1,
  CryptoCom = 2,
}

export type GasEstimates = {
  [exchangeIndex: number]: {
    [tokenAddress: string]: string;
  };
};
