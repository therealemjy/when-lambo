import BigNumber from 'bignumber.js';

declare global {
  namespace NodeJS {
    interface Global {
      currentGasPrices: {
        rapid: BigNumber;
        fast: BigNumber;
        standard: BigNumber;
        slow: BigNumber;
      };
    }
  }
}
export {};
