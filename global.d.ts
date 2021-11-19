import BigNumber from 'bignumber.js';

declare global {
  var isMonitoring: boolean;
  var currentGasPrices: {
    rapid: BigNumber;
    fast: BigNumber;
    standard: BigNumber;
    slow: BigNumber;
  };
}
