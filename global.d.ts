import BigNumber from 'bignumber.js';

declare global {
  namespace NodeJS {
    interface Global {
      isMonitoring: boolean;
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
